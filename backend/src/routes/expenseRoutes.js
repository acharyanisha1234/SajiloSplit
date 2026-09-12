const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const WalletTransaction = require('../models/WalletTransaction');
const { generateTransactionId } = require('../utils/generateId');
const { requireKYC } = require('../middleware/kyc');

const mongoose = require('mongoose');

// Get all expenses for a group
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

// Create expense
router.post('/', protect, async (req, res) => {
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
      const total = Object.values(parsedSplitDetails).reduce((sum, val) => sum + parseFloat(val), 0);
      if (Math.round(total) !== 100) {
        return res.status(400).json({
          success: false,
          message: 'Percentage split must total 100%'
        });
      }
    } else if (splitType === 'exact') {
      const total = Object.values(parsedSplitDetails).reduce((sum, val) => sum + parseFloat(val), 0);
      if (Math.round(total) !== amount) {
        return res.status(400).json({
          success: false,
          message: 'Exact amounts must total the expense amount'
        });
      }
    }

    // Create expense
    const expense = await Expense.create({
      title,
      amount,
      category,
      paidBy: paidBy || req.user.id,
      group: groupId,
      members: validMembers,
      splitType,
      splitDetails: parsedSplitDetails,
      description,
      receipt,
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
        title: '🧾 New Expense',
        message: `${paidByName} added expense "${title}" for Rs. ${amount}`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update group balances
async function updateGroupBalances(groupId, expense) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update group balance
    const group = await Group.findById(groupId).session(session);
    group.balance += expense.amount;
    await group.save({ session });

    // Create transaction for each member
    const members = expense.members || [];
    for (const memberId of members) {
      if (memberId.toString() !== expense.paidBy.toString()) {
        // This is a simplified version - in real app, calculate shares properly
        const share = expense.amount / members.length;
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

// Update expense (approve/reject)
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

// Delete expense
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
router.post('/', protect, requireKYC, createExpense);

module.exports = router;