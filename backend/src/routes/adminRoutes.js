const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const Group = require('../models/Group');
const Dispute = require('../models/Dispute');
const AuditLog = require('../models/AuditLog');
const EmergencyFund = require('../models/EmergencyFund');

// All admin routes require admin role
router.use(protect);
router.use(authorize('admin'));

// Get admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalGroups,
      totalTransactions,
      pendingDisputes,
      activeEmergencyFunds
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true, isSuspended: false }),
      User.countDocuments({ isSuspended: true }),
      Group.countDocuments(),
      WalletTransaction.countDocuments(),
      Dispute.countDocuments({ status: 'open' }),
      EmergencyFund.countDocuments({ status: 'active' })
    ]);

    // Calculate total transaction volume
    const transactions = await WalletTransaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalVolume = transactions.length > 0 ? transactions[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalGroups,
        totalTransactions,
        totalVolume,
        pendingDisputes,
        activeEmergencyFunds
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Suspend user
router.put('/users/:id/suspend', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot suspend admin user'
      });
    }

    user.isSuspended = true;
    user.isActive = false;
    await user.save();

    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'suspend',
      details: `User ${user.email} suspended by admin`,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'User suspended successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Activate user
router.put('/users/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isSuspended = false;
    user.isActive = true;
    await user.save();

    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'activate',
      details: `User ${user.email} activated by admin`,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'User activated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all transactions
router.get('/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      WalletTransaction.find()
        .populate('sender', 'name email')
        .populate('receiver', 'name email')
        .populate('group', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      WalletTransaction.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all groups
router.get('/groups', async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete group
router.delete('/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    await group.deleteOne();

    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      details: `Group "${group.name}" deleted by admin`,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all disputes
router.get('/disputes', async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate('user', 'name email')
      .populate('transaction', 'transactionId amount')
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

// Update dispute status
router.put('/disputes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    dispute.status = status;
    dispute.resolvedAt = status === 'resolved' || status === 'rejected' ? new Date() : undefined;
    await dispute.save();

    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      action: status === 'resolved' ? 'approve' : 'reject',
      details: `Dispute ${id} ${status} by admin`,
      ip: req.ip
    });

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

// Get audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get categories (admin management)
router.get('/categories', async (req, res) => {
  try {
    const Category = require('../models/Category');
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create category
router.post('/categories', async (req, res) => {
  try {
    const Category = require('../models/Category');
    const { name, icon, color } = req.body;

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }

    const category = await Category.create({ name, icon, color });

    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'create',
      details: `Category "${name}" created by admin`,
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Category created',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const Category = require('../models/Category');
    const { id } = req.params;
    const { name, icon, color } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (name) category.name = name;
    if (icon) category.icon = icon;
    if (color) category.color = color;

    await category.save();

    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      details: `Category "${category.name}" updated by admin`,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Category updated',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const Category = require('../models/Category');
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await category.deleteOne();

    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      details: `Category "${category.name}" deleted by admin`,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Category deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;