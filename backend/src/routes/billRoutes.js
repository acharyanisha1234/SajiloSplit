const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Bill = require('../models/Bill');

// Get all bills for user
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { user: req.user.id };

    if (status) {
      query.status = status;
    }

    const bills = await Bill.find(query).sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      data: bills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create bill
router.post('/', protect, async (req, res) => {
  try {
    const { name, amount, category, dueDate, recurring, reminder, description } = req.body;

    const bill = await Bill.create({
      user: req.user.id,
      name,
      amount,
      category,
      dueDate,
      recurring: recurring || 'one-time',
      reminder: reminder || false,
      description,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get bill by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await Bill.findOne({
      _id: id,
      user: req.user.id
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update bill
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, category, dueDate, recurring, reminder, description } = req.body;

    const bill = await Bill.findOne({
      _id: id,
      user: req.user.id
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    if (name) bill.name = name;
    if (amount) bill.amount = amount;
    if (category) bill.category = category;
    if (dueDate) bill.dueDate = dueDate;
    if (recurring) bill.recurring = recurring;
    if (reminder !== undefined) bill.reminder = reminder;
    if (description) bill.description = description;

    await bill.save();

    res.status(200).json({
      success: true,
      message: 'Bill updated successfully',
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update bill status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const bill = await Bill.findOne({
      _id: id,
      user: req.user.id
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    bill.status = status;
    if (status === 'paid') {
      bill.paidAt = new Date();
    }
    await bill.save();

    res.status(200).json({
      success: true,
      message: 'Bill status updated',
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete bill
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await Bill.findOne({
      _id: id,
      user: req.user.id
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    await bill.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Bill deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get upcoming bills
router.get('/upcoming', protect, async (req, res) => {
  try {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + 7);

    const bills = await Bill.find({
      user: req.user.id,
      status: 'pending',
      dueDate: {
        $gte: now,
        $lte: future
      }
    }).sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      data: bills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get overdue bills
router.get('/overdue', protect, async (req, res) => {
  try {
    const now = new Date();

    const bills = await Bill.find({
      user: req.user.id,
      status: 'pending',
      dueDate: { $lt: now }
    }).sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      data: bills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;