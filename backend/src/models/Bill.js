const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  recurring: {
    type: String,
    enum: ['one-time', 'monthly', 'quarterly', 'yearly'],
    default: 'one-time'
  },
  reminder: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  paidAt: {
    type: Date
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

billSchema.index({ user: 1 });
billSchema.index({ dueDate: 1 });
billSchema.index({ status: 1 });

module.exports = mongoose.model('Bill', billSchema);