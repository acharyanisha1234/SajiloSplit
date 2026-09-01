const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  transactionId: {
    type: String
  },
  settledAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
settlementSchema.index({ group: 1 });
settlementSchema.index({ from: 1, to: 1 });
settlementSchema.index({ status: 1 });

module.exports = mongoose.model('Settlement', settlementSchema);