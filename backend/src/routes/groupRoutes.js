const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const User = require('../models/User');

// Get user's groups
router.get('/', protect, async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.user.id,
      status: 'active'
    })
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

// Create group
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, targetAmount, category } = req.body;

    const group = await Group.create({
      name,
      description,
      owner: req.user.id,
      members: [req.user.id],
      targetAmount: targetAmount || 0,
      category,
      status: 'active',
      balance: 0
    });

    await GroupMember.create({
      group: group._id,
      user: req.user.id,
      role: 'owner'
    });

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get group details
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id)
      .populate('owner', 'name email phone')
      .populate('members', 'name email phone profileImage');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (!group.members.some(m => m._id.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update group
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, targetAmount, category, requiresApproval } = req.body;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (group.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only group owner can update group'
      });
    }

    if (name) group.name = name;
    if (description) group.description = description;
    if (targetAmount) group.targetAmount = targetAmount;
    if (category) group.category = category;
    if (requiresApproval !== undefined) group.requiresApproval = requiresApproval;

    await group.save();

    res.status(200).json({
      success: true,
      message: 'Group updated successfully',
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add member to group
router.post('/:id/members', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (group.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only group owner can add members'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (group.members.includes(user._id)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member'
      });
    }

    group.members.push(user._id);
    await group.save();

    await GroupMember.create({
      group: group._id,
      user: user._id,
      role: 'member'
    });

    const io = global.io;
    if (io) {
      io.to(`user-${user._id}`).emit('notification', {
        type: 'group_invitation',
        title: '👥 Group Invitation',
        message: `You have been added to "${group.name}"`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Member added successfully',
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Remove member from group
router.delete('/:id/members/:userId', protect, async (req, res) => {
  try {
    const { id, userId } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (group.owner.toString() !== req.user.id && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove member'
      });
    }

    if (group.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove group owner'
      });
    }

    group.members = group.members.filter(m => m.toString() !== userId);
    await group.save();

    await GroupMember.findOneAndDelete({
      group: group._id,
      user: userId
    });

    res.status(200).json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Leave group
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (group.owner.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Owner cannot leave group. Transfer ownership first or delete the group.'
      });
    }

    if (!group.members.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }

    group.members = group.members.filter(m => m.toString() !== req.user.id);
    await group.save();

    await GroupMember.findOneAndDelete({
      group: group._id,
      user: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'You have left the group'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete group
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (group.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only group owner can delete group'
      });
    }

    await group.deleteOne();
    await GroupMember.deleteMany({ group: id });

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

module.exports = router;