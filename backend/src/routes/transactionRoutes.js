const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const WalletTransaction = require('../models/WalletTransaction');

// Get all transactions
router.get('/', protect, async (req, res) => {
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

// Get transaction by ID
router.get('/:id', protect, async (req, res) => {
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

    // Check if user is involved
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

// Get transaction summary
router.get('/summary', protect, async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

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
    } else if (period === 'yearly') {
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getFullYear(), 0, 1),
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

    const netBalance = totalIncome - totalExpense;

    // Group by category
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
        totalIncome,
        totalExpense,
        netBalance,
        transactionCount: transactions.length,
        categoryData,
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

module.exports = router;