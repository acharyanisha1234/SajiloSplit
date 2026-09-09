const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Dispute = require('../models/Dispute');
const WalletTransaction = require('../models/WalletTransaction');

// Get user's disputes
router.get('/', protect, async (req, res) => {
  try {
    const disputes = await Dispute.find({ user: req.user.id })
      .populate('transaction', 'transactionId amount type')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: disputes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create dispute
router.post('/', protect, async (req, res) => {
  try {
    const { transactionId, reason, description, attachment } = req.body;

    // Verify transaction exists and user is involved
    const transaction = await WalletTransaction.findOne({
      transactionId
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.sender?.toString() !== req.user.id &&
        transaction.receiver?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not involved in this transaction'
      });
    }

    // Check if dispute already exists
    const existing = await Dispute.findOne({
      transaction: transaction._id,
      status: { $in: ['open', 'under-review'] }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A dispute already exists for this transaction'
      });
    }

    const dispute = await Dispute.create({
      user: req.user.id,
      transaction: transaction._id,
      reason,
      description,
      attachment,
      status: 'open'
    });

    res.status(201).json({
      success: true,
      message: 'Dispute created successfully',
      data: dispute
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get dispute details
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const dispute = await Dispute.findById(id)
      .populate('user', 'name email')
      .populate('transaction', 'transactionId amount type status');

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    if (dispute.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this dispute'
      });
    }

    res.status(200).json({
      success: true,
      data: dispute
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update dispute (admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can update disputes'
      });
    }

    const { id } = req.params;
    const { status, resolution } = req.body;

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    dispute.status = status;
    if (status === 'resolved' || status === 'rejected') {
      dispute.resolvedAt = new Date();
      dispute.resolution = resolution || '';
    }
    await dispute.save();

    res.status(200).json({
      success: true,
      message: 'Dispute updated',
      data: dispute
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;