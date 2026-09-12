const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireKYC } = require('../middleware/kyc');
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const WalletTransaction = require('../models/WalletTransaction');
const { generateTransactionId } = require('../utils/generateId');
const mongoose = require('mongoose');

// ==========================================
// GET ALL EXPENSES FOR A GROUP
// ==========================================
// @route   GET /api/expenses/group/:groupId
// @access  Private
router.get('/group/:groupId', protect, async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is member
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not a member of this group'
      });
    }

    const expenses = await Expense.find({ group: groupId })
      .populate('paidBy', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
// CREATE EXPENSE (KYC REQUIRED) 
// ==========================================
// @route   POST /api/expenses
// @access  Private + KYC
router.post('/', protect, requireKYC, async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      paidBy,
      group: groupId,
      members,
      splitType,
      splitDetails,
      description,
      receipt
    } = req.body;

    // Validation
    if (!title || !amount || !groupId) {
      return res.status(400).json({
        success: false,
        message: 'Title, amount and group are required'
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    // Validate group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is member
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not a member of this group'
      });
    }

    // Validate members
    const memberIds = typeof members === 'string' ? JSON.parse(members) : members;
    const validMembers = memberIds.filter(id => group.members.includes(id));

    if (validMembers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid members selected'
      });
    }

    // Parse split details if JSON string
    let parsedSplitDetails = {};
    if (splitDetails && typeof splitDetails === 'string') {
      parsedSplitDetails = JSON.parse(splitDetails);
    } else {
      parsedSplitDetails = splitDetails || {};
    }

    // Validate split based on split type
    if (splitType === 'percentage') {
      const total = Object.values(parsedSplitDetails).reduce(
        (sum, val) => sum + parseFloat(val || 0), 
        0
      );
      if (Math.round(total) !== 100) {
        return res.status(400).json({
          success: false,
          message: 'Percentage split must total 100%'
        });
      }
    } else if (splitType === 'exact') {
      const total = Object.values(parsedSplitDetails).reduce(
        (sum, val) => sum + parseFloat(val || 0), 
        0
      );
      if (Math.round(total) !== Math.round(numAmount)) {
        return res.status(400).json({
          success: false,
          message: 'Exact amounts must total the expense amount'
        });
      }
    }

    // Create expense
    const expense = await Expense.create({
      title,
      amount: numAmount,
      category: category || 'Other',
      paidBy: paidBy || req.user.id,
      group: groupId,
      members: validMembers,
      splitType: splitType || 'equal',
      splitDetails: parsedSplitDetails,
      description: description || '',
      receipt: receipt || null,
      status: group.requiresApproval ? 'pending' : 'approved'
    });

    // If group doesn't require approval, update balances immediately
    if (!group.requiresApproval) {
      await updateGroupBalances(groupId, expense);
    }

    // Emit socket notification
    const io = global.io;
    if (io) {
      const paidByName = req.user.name;
      io.to(`group-${groupId}`).emit('notification', {
        type: 'new_expense',
        title: 'New Expense',
        message: `${paidByName} added expense "${title}" for Rs. ${numAmount}`
      });
    }

    // Populate and return
    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name email')
      .populate('members', 'name email');

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: populatedExpense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
//  HELPER: Update Group Balances
// ==========================================
async function updateGroupBalances(groupId, expense) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update group balance
    const group = await Group.findById(groupId).session(session);
    group.balance = (group.balance || 0) + expense.amount;
    await group.save({ session });

    // Create transaction for each member
    const members = expense.members || [];
    const share = expense.amount / members.length;

    for (const memberId of members) {
      if (memberId.toString() !== expense.paidBy.toString()) {
        await WalletTransaction.create([{
          transactionId: generateTransactionId(),
          sender: memberId,
          receiver: expense.paidBy,
          amount: share,
          type: 'group_expense',
          status: 'completed',
          purpose: expense.title,
          group: groupId,
          expense: expense._id,
          description: `Share of ${expense.title}`
        }], { session });
      }
    }

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

// ==========================================
// UPDATE EXPENSE (Approve/Reject) 
// ==========================================
// @route   PUT /api/expenses/:id
// @access  Private (Group Owner/Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Check if user is group owner/admin
    const group = await Group.findById(expense.group);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (group.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only group owner can approve/reject expenses'
      });
    }

    if (status === 'approved' && expense.status === 'pending') {
      expense.status = 'approved';
      await expense.save();
      await updateGroupBalances(expense.group, expense);
    } else if (status === 'rejected') {
      expense.status = 'rejected';
      await expense.save();
    }

    res.status(200).json({
      success: true,
      message: `Expense ${status}`,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
// ===== DELETE EXPENSE =====
// ==========================================
// @route   DELETE /api/expenses/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Check if user is expense creator or group owner
    const group = await Group.findById(expense.group);
    if (expense.paidBy.toString() !== req.user.id &&
        group.owner.toString() !== req.user.id &&
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this expense'
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
// ===== GET EXPENSE DETAILS =====
// ==========================================
// @route   GET /api/expenses/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findById(id)
      .populate('paidBy', 'name email')
      .populate('members', 'name email')
      .populate('group', 'name');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;