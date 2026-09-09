const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WalletTransaction',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  attachment: {
    type: String
  },
  status: {
    type: String,
    enum: ['open', 'under-review', 'resolved', 'rejected'],
    default: 'open'
  },
  resolution: {
    type: String
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

disputeSchema.index({ user: 1 });
disputeSchema.index({ transaction: 1 });
disputeSchema.index({ status: 1 });

module.exports = mongoose.model('Dispute', disputeSchema);