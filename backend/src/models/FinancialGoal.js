const mongoose = require('mongoose');

const FinancialGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  targetAmountPaisa: { type: Number, required: true },
  currentAmountPaisa: { type: Number, default: 0 },
  targetDate: { type: Date, required: true },
  mode: { type: String, enum: ['PERSONAL', 'FAMILY', 'BUSINESS'], default: 'PERSONAL' },
  commitmentConfig: {
    hasCoolingOffPeriod: { type: Boolean, default: false },
    coolingOffHours: { type: Number, default: 24 },
    accountabilityPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }
}, { timestamps: true });

FinancialGoalSchema.virtual('requiredMonthlySavingPaisa').get(function() {
  const monthsRemaining = Math.max(1, (this.targetDate - new Date()) / (1000 * 60 * 60 * 24 * 30.44));
  const remainingPaisa = this.targetAmountPaisa - this.currentAmountPaisa;
  return Math.ceil(remainingPaisa / monthsRemaining);
});

module.exports = mongoose.model('FinancialGoal', FinancialGoalSchema);