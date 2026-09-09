const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Settlement = require('../models/Settlement');
const Group = require('../models/Group');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const { generateTransactionId } = require('../utils/generateId');
const mongoose = require('mongoose');

// Get all settlements for user
router.get('/', protect, async (req, res) => {
  try {
    const settlements = await Settlement.find({
      $or: [
        { from: req.user.id },
        { to: req.user.id }
      ]
    })
      .populate('from', 'name email')
      .populate('to', 'name email')
      .populate('group', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: settlements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get settlements for a group
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

    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not a member of this group'
      });
    }

    const settlements = await Settlement.find({ group: groupId })
      .populate('from', 'name email')
      .populate('to', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: settlements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create settlement
router.post('/', protect, async (req, res) => {
  try {
    const { from, to, amount, groupId } = req.body;

    // Validate
    if (from.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only create settlements from yourself'
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (!group.members.includes(from) || !group.members.includes(to)) {
      return res.status(400).json({
        success: false,
        message: 'Both users must be members of the group'
      });
    }

    const settlement = await Settlement.create({
      from,
      to,
      amount,
      group: groupId,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Settlement created',
      data: settlement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Settle payment
router.put('/:id/settle', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const settlement = await Settlement.findById(id);
    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: 'Settlement not found'
      });
    }

    if (settlement.from.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the debtor can settle this'
      });
    }

    if (settlement.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Settlement is already processed'
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check balances
      const fromWallet = await Wallet.findOne({ user: settlement.from }).session(session);
      const toWallet = await Wallet.findOne({ user: settlement.to }).session(session);

      if (!fromWallet || !toWallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
      }

      if (fromWallet.availableBalance < settlement.amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance'
        });
      }

      // Update wallets
      const fromBalanceBefore = fromWallet.balance;
      const toBalanceBefore = toWallet.balance;

      fromWallet.balance -= settlement.amount;
      fromWallet.availableBalance -= settlement.amount;
      await fromWallet.save({ session });

      toWallet.balance += settlement.amount;
      toWallet.availableBalance += settlement.amount;
      await toWallet.save({ session });

      // Update settlement
      settlement.status = 'paid';
      settlement.settledAt = new Date();
      await settlement.save({ session });

      // Create transaction
      const transaction = await WalletTransaction.create([{
        transactionId: generateTransactionId(),
        sender: settlement.from,
        receiver: settlement.to,
        amount: settlement.amount,
        type: 'settlement',
        status: 'completed',
        purpose: `Settlement for ${settlement.group?.name || 'group'}`,
        group: settlement.group,
        settlement: settlement._id,
        balanceBefore: fromBalanceBefore,
        balanceAfter: fromWallet.balance
      }], { session });

      await session.commitTransaction();
      session.endSession();

      // Emit notifications
      const io = global.io;
      if (io) {
        const fromUser = await settlement.populate('from', 'name');
        const toUser = await settlement.populate('to', 'name');
        
        io.to(`user-${settlement.to}`).emit('notification', {
          type: 'money_received',
          title: '💰 Settlement Received',
          message: `You received Rs. ${settlement.amount} from ${fromUser.from?.name}`
        });

        io.to(`user-${settlement.from}`).emit('notification', {
          type: 'money_sent',
          title: '💸 Settlement Sent',
          message: `You sent Rs. ${settlement.amount} to ${toUser.to?.name}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Settlement completed',
        data: settlement
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Cancel settlement
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const settlement = await Settlement.findById(id);
    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: 'Settlement not found'
      });
    }

    if (settlement.from.toString() !== req.user.id && settlement.to.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (settlement.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Settlement is already processed'
      });
    }

    settlement.status = 'cancelled';
    await settlement.save();

    res.status(200).json({
      success: true,
      message: 'Settlement cancelled',
      data: settlement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;