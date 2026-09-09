const mongoose = require('mongoose');

const lockedFundSchema = new mongoose.Schema({
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
  purpose: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  unlockDate: {
    type: Date
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['locked', 'unlocked', 'expired'],
    default: 'locked'
  },
  unlockedAt: {
    type: Date
  }
}, {
  timestamps: true
});

lockedFundSchema.index({ user: 1 });
lockedFundSchema.index({ status: 1 });
lockedFundSchema.index({ unlockDate: 1 });

module.exports = mongoose.model('LockedFund', lockedFundSchema);