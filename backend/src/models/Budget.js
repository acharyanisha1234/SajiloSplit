const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  spent: {
    type: Number,
    default: 0
  },
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

budgetSchema.virtual('remaining').get(function() {
  return Math.max(0, this.amount - this.spent);
});

budgetSchema.virtual('percentageUsed').get(function() {
  if (this.amount === 0) return 0;
  return Math.min(100, (this.spent / this.amount) * 100);
});

// Index for faster queries
budgetSchema.index({ user: 1 });
budgetSchema.index({ month: 1, year: 1 });

module.exports = mongoose.model('Budget', budgetSchema);