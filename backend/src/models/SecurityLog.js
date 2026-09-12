const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login_success',
      'login_failed',
      'logout',
      'password_change',
      'password_reset_request',
      'password_reset_success',
      'email_change',
      'phone_change',
      'session_created',
      'session_hijack_attempt',
      'suspicious_activity',
      'invalid_password_confirmation',
      'account_locked',
      'account_unlocked',
      '2fa_enabled',
      '2fa_disabled',
      'device_added',
      'device_removed',
      'ip_blocked',
      'multiple_failed_attempts'
    ]
  },
  ip: {
    type: String,
    required: true,
    index: true
  },
  userAgent: String,
  deviceFingerprint: String,
  location: {
    country: String,
    city: String,
    coordinates: [Number]
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info',
    index: true
  },
  warnings: [{
    type: { type: String },
    severity: String,
    message: String
  }],
  details: mongoose.Schema.Types.Mixed,
  success: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 90 * 24 * 60 * 60 // Auto-delete after 90 days
  }
});

// Compound indexes
securityLogSchema.index({ user: 1, createdAt: -1 });
securityLogSchema.index({ ip: 1, createdAt: -1 });
securityLogSchema.index({ severity: 1, createdAt: -1 });
securityLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('SecurityLog', securityLogSchema);