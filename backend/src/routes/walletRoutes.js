const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireKYC } = require('../middleware/kyc');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const User = require('../models/User');
const { generateTransactionId } = require('../utils/generateId');
const mongoose = require('mongoose');

// ==========================================
// ===== GET WALLET DETAILS =====
// ==========================================
// @route   GET /api/wallet
// @access  Private
router.get('/', protect, async (req, res) => {
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
});

// ==========================================
// ===== ADD MONEY (KYC REQUIRED) =====
// ==========================================
// @route   POST /api/wallet/add-money
// @access  Private + KYC
router.post('/add-money', protect, requireKYC, async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
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
});

// ==========================================
// ===== SEND MONEY (KYC REQUIRED) =====
// ==========================================
// @route   POST /api/wallet/send
// @access  Private + KYC
router.post('/send', protect, requireKYC, async (req, res) => {
  try {
    const { receiverId, amount, purpose } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    if (receiverId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send money to yourself'
      });
    }

    const senderWallet = await Wallet.findOne({ user: req.user.id });
    const receiverWallet = await Wallet.findOne({ user: receiverId });

    if (!senderWallet || !receiverWallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    if (senderWallet.availableBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const senderBalanceBefore = senderWallet.balance;
      
      senderWallet.balance -= amount;
      senderWallet.availableBalance -= amount;
      await senderWallet.save({ session });

      receiverWallet.balance += amount;
      receiverWallet.availableBalance += amount;
      await receiverWallet.save({ session });

      const transactionId = generateTransactionId();
      
      await WalletTransaction.create([{
        transactionId,
        sender: req.user.id,
        receiver: receiverId,
        amount,
        type: 'transfer',
        status: 'completed',
        purpose: purpose || 'Money transfer',
        balanceBefore: senderBalanceBefore,
        balanceAfter: senderWallet.balance
      }], { session });

      await session.commitTransaction();
      session.endSession();

      // ===== Real-time notifications =====
      const io = global.io;
      if (io) {
        io.to(`user-${receiverId}`).emit('notification', {
          type: 'money_received',
          title: 'Money Received',
          message: `You received Rs. ${amount} from ${req.user.name}`
        });

        io.to(`user-${req.user.id}`).emit('notification', {
          type: 'money_sent',
          title: 'Money Sent',
          message: `You sent Rs. ${amount} to ${receiver.name}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Money sent successfully',
        data: {
          transactionId,
          amount,
          receiver: receiver.name
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
});

// ==========================================
// ===== GET TRANSACTION HISTORY =====
// ==========================================
// @route   GET /api/wallet/transactions
// @access  Private
router.get('/transactions', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, startDate, endDate, group } = req.query;

    const query = {
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id }
      ]
    };

    if (type) {
      query.type = type;
    }

    if (group) {
      query.group = group;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      WalletTransaction.find(query)
        .populate('sender', 'name email')
        .populate('receiver', 'name email')
        .populate('group', 'name')
        .populate('expense', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      WalletTransaction.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
// ===== GET TRANSACTION DETAILS =====
// ==========================================
// @route   GET /api/wallet/transactions/:id
// @access  Private
router.get('/transactions/:id', protect, async (req, res) => {
  try {
    const transaction = await WalletTransaction.findOne({
      transactionId: req.params.id
    })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('group', 'name')
      .populate('expense', 'title')
      .populate('settlement', 'amount status');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.sender?._id.toString() !== req.user.id &&
        transaction.receiver?._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this transaction'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
// ===== GET WALLET SUMMARY =====
// ==========================================
// @route   GET /api/wallet/summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    let dateFilter = {};
    const now = new Date();

    if (period === 'monthly') {
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1),
          $lte: now
        }
      };
    } else if (period === 'weekly') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      dateFilter = {
        createdAt: {
          $gte: weekStart,
          $lte: now
        }
      };
    }

    const transactions = await WalletTransaction.find({
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id }
      ],
      ...dateFilter,
      status: 'completed'
    });

    const totalIncome = transactions
      .filter(t => t.receiver?.toString() === req.user.id)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.sender?.toString() === req.user.id)
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryData = {};
    transactions.forEach(t => {
      const category = t.category || 'Other';
      if (!categoryData[category]) {
        categoryData[category] = 0;
      }
      categoryData[category] += t.amount;
    });

    res.status(200).json({
      success: true,
      data: {
        wallet,
        summary: {
          totalIncome,
          totalExpense,
          netBalance: totalIncome - totalExpense,
          transactionCount: transactions.length,
          categoryData
        },
        period
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
// ===== WITHDRAW MONEY (KYC REQUIRED) =====
// ==========================================
// @route   POST /api/wallet/withdraw
// @access  Private + KYC
router.post('/withdraw', protect, requireKYC, async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
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

    if (wallet.availableBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const balanceBefore = wallet.balance;
      wallet.balance -= amount;
      wallet.availableBalance -= amount;
      await wallet.save({ session });

      const transaction = await WalletTransaction.create([{
        transactionId: generateTransactionId(),
        sender: req.user.id,
        amount,
        type: 'withdrawal',
        status: 'completed',
        purpose: description || 'Withdraw from wallet',
        balanceBefore,
        balanceAfter: wallet.balance
      }], { session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: 'Withdrawal successful',
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
});

module.exports = router;