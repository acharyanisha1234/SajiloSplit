const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const EmergencyFund = require('../models/EmergencyFund');
const EmergencyRequest = require('../models/EmergencyRequest');
const Group = require('../models/Group');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const { generateTransactionId } = require('../utils/generateId');
const mongoose = require('mongoose');

// Get all emergency funds for user's groups
router.get('/', protect, async (req, res) => {
  try {
    console.log(' Fetching emergency funds for user:', req.user.id);
    
    const groups = await Group.find({ members: req.user.id });
    const groupIds = groups.map(g => g._id);

    const funds = await EmergencyFund.find({
      group: { $in: groupIds }
    }).populate('group', 'name');

    res.status(200).json({
      success: true,
      data: funds || []
    });
  } catch (error) {
    console.error('Error fetching emergency funds:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch emergency funds'
    });
  }
});

// Get emergency requests
router.get('/requests', protect, async (req, res) => {
  try {
    console.log('Fetching emergency requests for user:', req.user.id);
    
    const requests = await EmergencyRequest.find({ user: req.user.id })
      .populate('fund', 'name')
      .populate('user', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests || []
    });
  } catch (error) {
    console.error('Error fetching emergency requests:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch emergency requests'
    });
  }
});

// Create emergency fund
router.post('/', protect, async (req, res) => {
  try {
    console.log('Creating emergency fund:', req.body);
    
    const { name, targetAmount, description, groupId } = req.body;

    if (!name || !targetAmount || !groupId) {
      return res.status(400).json({
        success: false,
        message: 'Name, targetAmount and groupId are required'
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (group.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only group owner can create emergency fund'
      });
    }

    const fund = await EmergencyFund.create({
      group: groupId,
      name,
      targetAmount: Number(targetAmount),
      currentAmount: 0,
      description: description || '',
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Emergency fund created successfully',
      data: fund
    });
  } catch (error) {
    console.error(' Error creating emergency fund:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create emergency fund'
    });
  }
});

// Create emergency request
router.post('/requests', protect, async (req, res) => {
  try {
    console.log(' Creating emergency request:', req.body);
    
    const { fundId, amount, reason, description } = req.body;

    if (!fundId || !amount || !reason) {
      return res.status(400).json({
        success: false,
        message: 'FundId, amount and reason are required'
      });
    }

    const fund = await EmergencyFund.findById(fundId);
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: 'Emergency fund not found'
      });
    }

    const group = await Group.findById(fund.group);
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

    if (fund.currentAmount < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds in emergency fund'
      });
    }

    const request = await EmergencyRequest.create({
      fund: fundId,
      user: req.user.id,
      amount: Number(amount),
      reason,
      description: description || '',
      status: 'pending'
    });

    // Send notification to group owner
    const io = global.io;
    if (io) {
      io.to(`user-${group.owner}`).emit('notification', {
        type: 'emergency_request',
        title: ' Emergency Request',
        message: `${req.user.name} requested Rs. ${amount} for "${reason}"`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Emergency request submitted successfully',
      data: request
    });
  } catch (error) {
    console.error(' Error creating emergency request:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create emergency request'
    });
  }
});

// Approve/Reject emergency request
router.put('/requests/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`Updating emergency request ${id} to ${status}`);

    const request = await EmergencyRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const fund = await EmergencyFund.findById(request.fund);
    const group = await Group.findById(fund.group);

    if (group.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only group owner can approve/reject requests'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request is already processed'
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (status === 'approved') {
        fund.currentAmount -= request.amount;
        await fund.save({ session });

        const wallet = await Wallet.findOne({ user: request.user }).session(session);
        if (wallet) {
          wallet.balance += request.amount;
          wallet.availableBalance += request.amount;
          await wallet.save({ session });

          await WalletTransaction.create([{
            transactionId: generateTransactionId(),
            receiver: request.user,
            amount: request.amount,
            type: 'emergency',
            status: 'completed',
            purpose: `Emergency fund: ${fund.name}`,
            description: request.description || request.reason
          }], { session });
        }
      }

      request.status = status;
      request.approvedBy = req.user.id;
      request.approvedAt = new Date();
      await request.save({ session });

      await session.commitTransaction();
      session.endSession();

      const io = global.io;
      if (io) {
        io.to(`user-${request.user}`).emit('notification', {
          type: 'emergency_response',
          title: ` Emergency Request ${status}`,
          message: `Your emergency request has been ${status}`
        });
      }

      res.status(200).json({
        success: true,
        message: `Request ${status} successfully`,
        data: request
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error(' Error updating emergency request:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update request'
    });
  }
});

module.exports = router;