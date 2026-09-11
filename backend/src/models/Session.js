const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: {
    type: String,
    default: 'unknown'
  },
  deviceName: {
    type: String,
    default: 'Unknown Device'
  },
  deviceType: {
    type: String,
    default: 'web'
  },
  ip: {
    type: String,
    default: 'Unknown IP'
  },
  userAgent: {
    type: String,
    default: 'Unknown'
  },
  os: {
    type: String,
    default: 'Unknown OS'
  },
  browser: {
    type: String,
    default: 'Unknown Browser'
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  token: {
    type: String
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

sessionSchema.index({ user: 1 });
sessionSchema.index({ lastActive: -1 });

module.exports = mongoose.model('Session', sessionSchema);