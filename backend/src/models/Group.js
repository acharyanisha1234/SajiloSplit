const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  balance: {
    type: Number,
    default: 0
  },
  targetAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  image: {
    type: String
  },
  category: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
groupSchema.index({ owner: 1 });
groupSchema.index({ members: 1 });
groupSchema.index({ status: 1 });

module.exports = mongoose.model('Group', groupSchema);