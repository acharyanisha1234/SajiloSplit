const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const User = require('../models/User');
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
      // Update wallet balance
      const balanceBefore = wallet.balance;
      wallet.balance += amount;
      wallet.availableBalance += amount;
      await wallet.save({ session });

      // Create transaction record
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

// @desc    Send money to another user
// @route   POST /api/wallet/send
// @access  Private
const sendMoney = async (req, res) => {
  try {
    const { receiverId, amount, purpose } = req.body;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Prevent sending to self
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

    // Check sufficient balance
    if (senderWallet.availableBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update sender wallet
      const senderBalanceBefore = senderWallet.balance;
      senderWallet.balance -= amount;
      senderWallet.availableBalance -= amount;
      await senderWallet.save({ session });

      // Update receiver wallet
      const receiverBalanceBefore = receiverWallet.balance;
      receiverWallet.balance += amount;
      receiverWallet.availableBalance += amount;
      await receiverWallet.save({ session });

      // Create transaction record
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

      // Send notifications via socket
      const io = global.io;
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
};

// @desc    Get transaction history
// @route   GET /api/wallet/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, startDate, endDate } = req.query;

    const query = {
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id }
      ]
    };

    if (type) {
      query.type = type;
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
};

// @desc    Get transaction details
// @route   GET /api/wallet/transactions/:id
// @access  Private
const getTransactionDetails = async (req, res) => {
  try {
    const transaction = await WalletTransaction.findOne({
      transactionId: req.params.id
    }).populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('group', 'name')
      .populate('expense', 'title');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user is involved in transaction
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
};

module.exports = {
  getWallet,
  addMoney,
  sendMoney,
  getTransactions,
  getTransactionDetails
};