const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Budget = require('../models/Budget');

// Get all budgets for user
router.get('/', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { user: req.user.id };

    if (month && year) {
      query.month = parseInt(month);
      query.year = parseInt(year);
    } else {
      const now = new Date();
      query.month = now.getMonth() + 1;
      query.year = now.getFullYear();
    }

    const budgets = await Budget.find(query).sort({ category: 1 });

    res.status(200).json({
      success: true,
      data: budgets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create budget
router.post('/', protect, async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    const existing = await Budget.findOne({
      user: req.user.id,
      category,
      month,
      year
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this category and month'
      });
    }

    const budget = await Budget.create({
      user: req.user.id,
      category,
      amount,
      month,
      year,
      spent: 0,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get budget by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findOne({
      _id: id,
      user: req.user.id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update budget
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { category, amount, month, year, spent } = req.body;

    const budget = await Budget.findOne({
      _id: id,
      user: req.user.id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    if (category) budget.category = category;
    if (amount) budget.amount = amount;
    if (month) budget.month = month;
    if (year) budget.year = year;
    if (spent !== undefined) budget.spent = spent;

    await budget.save();

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete budget
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findOne({
      _id: id,
      user: req.user.id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get budget summary
router.get('/summary', protect, async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const budgets = await Budget.find({
      user: req.user.id,
      month,
      year
    });

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
    const totalRemaining = totalBudget - totalSpent;

    const warnings = budgets
      .filter(b => b.amount > 0 && ((b.spent || 0) / b.amount) >= 0.7)
      .map(b => ({
        category: b.category,
        percentage: Math.round(((b.spent || 0) / b.amount) * 100),
        remaining: b.amount - (b.spent || 0)
      }));

    res.status(200).json({
      success: true,
      data: {
        totalBudget,
        totalSpent,
        totalRemaining,
        budgets,
        warnings
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