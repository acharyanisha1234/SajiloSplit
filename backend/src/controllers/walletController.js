const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const mongoose = require('mongoose');
const { generateTransactionId } = require('../utils/generateId');

// @desc    Get wallet details
// @route   GET /api/wallet
// @access  Private
const getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    res.status(200).json({
      success: true,
      data: wallet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add money to wallet
// @route   POST /api/wallet/add-money
// @access  Private
const addMoney = async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
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
      const balanceBefore = wallet.balance;

      wallet.balance += amount;
      wallet.availableBalance += amount;

      await wallet.save({ session });

      const transaction = await WalletTransaction.create([{
        transactionId: generateTransactionId(),
        receiver: req.user.id,
        amount,
        type: 'deposit',
        status: 'completed',
        purpose: description || 'Add money to wallet',
        balanceBefore,
        balanceAfter: wallet.balance
      }], { session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: 'Money added successfully',
        data: {
          wallet,
          transaction: transaction[0]
        }
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
};

module.exports = {
  getWallet,
  addMoney
};