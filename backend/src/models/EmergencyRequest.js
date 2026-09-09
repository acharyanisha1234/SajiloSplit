const mongoose = require('mongoose');

const emergencyRequestSchema = new mongoose.Schema({
  fund: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmergencyFund',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  attachment: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

emergencyRequestSchema.index({ fund: 1 });
emergencyRequestSchema.index({ user: 1 });
emergencyRequestSchema.index({ status: 1 });

module.exports = mongoose.model('EmergencyRequest', emergencyRequestSchema);