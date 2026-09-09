const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const LockedFund = require('../models/LockedFund');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const { generateTransactionId } = require('../utils/generateId');
const mongoose = require('mongoose');

// Get all locked funds for user
router.get('/', protect, async (req, res) => {
  try {
    const funds = await LockedFund.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: funds
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create locked fund
router.post('/', protect, async (req, res) => {
  try {
    const { name, purpose, amount, unlockDate, description } = req.body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    if (wallet.availableBalance < numAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update wallet
      wallet.availableBalance -= numAmount;
      wallet.lockedBalance += numAmount;
      await wallet.save({ session });

      // Create locked fund
      const fund = await LockedFund.create([{
        user: req.user.id,
        name,
        purpose,
        amount: numAmount,
        unlockDate,
        description,
        status: 'locked'
      }], { session });

      // Create transaction
      await WalletTransaction.create([{
        transactionId: generateTransactionId(),
        sender: req.user.id,
        amount: numAmount,
        type: 'locked_fund',
        status: 'completed',
        purpose: `Locked fund: ${name}`,
        lockedFund: fund[0]._id,
        description: description || `Fund locked for ${purpose}`
      }], { session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        message: 'Fund locked successfully',
        data: fund[0]
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

// Unlock fund
router.put('/:id/unlock', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const fund = await LockedFund.findOne({
      _id: id,
      user: req.user.id
    });

    if (!fund) {
      return res.status(404).json({
        success: false,
        message: 'Fund not found'
      });
    }

    if (fund.status === 'unlocked') {
      return res.status(400).json({
        success: false,
        message: 'Fund is already unlocked'
      });
    }

    if (fund.unlockDate && new Date(fund.unlockDate) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Fund cannot be unlocked before unlock date'
      });
    }

    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update wallet
      wallet.availableBalance += fund.amount;
      wallet.lockedBalance -= fund.amount;
      await wallet.save({ session });

      // Update fund
      fund.status = 'unlocked';
      fund.unlockedAt = new Date();
      await fund.save({ session });

      // Create transaction
      await WalletTransaction.create([{
        transactionId: generateTransactionId(),
        receiver: req.user.id,
        amount: fund.amount,
        type: 'refund',
        status: 'completed',
        purpose: `Fund unlocked: ${fund.name}`,
        lockedFund: fund._id
      }], { session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: 'Fund unlocked successfully',
        data: fund
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

// Delete locked fund
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const fund = await LockedFund.findOne({
      _id: id,
      user: req.user.id
    });

    if (!fund) {
      return res.status(404).json({
        success: false,
        message: 'Fund not found'
      });
    }

    if (fund.status === 'locked') {
      // Return money to wallet
      const wallet = await Wallet.findOne({ user: req.user.id });
      if (wallet) {
        wallet.availableBalance += fund.amount;
        wallet.lockedBalance -= fund.amount;
        await wallet.save();
      }
    }

    await fund.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Fund deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;