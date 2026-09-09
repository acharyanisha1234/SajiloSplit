const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { 
    type: String, 
    enum: [
      'login', 'logout', 'login_failed', 
      'password_change', 'pin_change',
      'device_added', 'device_removed',
      'kyc_submitted', 'kyc_approved', 'kyc_rejected',
      'transaction', 'transaction_failed',
      'suspicious_activity',
      '2fa_enabled', '2fa_disabled',
      'session_terminated',
      'admin_action'
    ],
    required: true 
  },
  details: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
  userAgent: { type: String },
  deviceId: { type: String },
  location: {
    country: { type: String },
    city: { type: String },
    coordinates: { type: [Number] },
  },
  severity: { 
    type: String, 
    enum: ['info', 'warning', 'critical', 'security'], 
    default: 'info' 
  },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ severity: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);