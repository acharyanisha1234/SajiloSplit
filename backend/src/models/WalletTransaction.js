const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'transfer', 'group_contribution', 'group_expense', 'settlement', 'refund', 'locked_fund', 'emergency'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'reversed'],
    default: 'pending'
  },
  purpose: {
    type: String
  },
  description: {
    type: String
  },
  category: {
    type: String
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  expense: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense'
  },
  settlement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Settlement'
  },
  lockedFund: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LockedFund'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  balanceBefore: {
    type: Number
  },
  balanceAfter: {
    type: Number
  },
  referenceId: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
walletTransactionSchema.index({ transactionId: 1 });
walletTransactionSchema.index({ sender: 1, receiver: 1 });
walletTransactionSchema.index({ group: 1 });
walletTransactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);