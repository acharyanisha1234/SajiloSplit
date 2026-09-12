const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'create',     
      'update',
      'delete',
      'suspend',
      'activate',
      'approve',
      'reject',
      'kyc_submitted',
      'kyc_approved',
      'kyc_rejected',
      'transaction',
      'settlement',
      'password_change',
      '2fa_enabled',
      '2fa_disabled'
    ]
  },
  details: {
    type: String
  },
  ip: {
    type: String
  },
  userAgent: {
    type: String
  },
  deviceId: {
    type: String
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical', 'security'],
    default: 'info'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ severity: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);