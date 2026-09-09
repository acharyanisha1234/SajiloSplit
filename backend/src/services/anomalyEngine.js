
class AnomalyEngine {
  static evaluateTransaction(transaction, userHistory) {
    const { amount, category } = transaction;
    const categoryHistory = userHistory.filter(t => t.category === category);
    
    if (categoryHistory.length < 3) {
      return { riskLevel: 'LOW', reason: 'Insufficient history for anomaly flag.' };
    }

    const amounts = categoryHistory.map(t => t.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / amounts.length);

    const zScore = (amount - mean) / (stdDev || 1);

    if (zScore > 2.5 && amount > 5000) {
      return {
        riskLevel: 'HIGH',
        flagged: true,
        reason: `Rs. ${amount.toLocaleString()} is ${zScore.toFixed(1)}x higher than your usual ${category} spending pattern (avg: Rs. ${Math.round(mean)}).`,
        actionRecommended: 'Verify receipt details before confirming split.'
      };
    }

    if (zScore > 1.8) {
      return {
        riskLevel: 'MEDIUM',
        flagged: true,
        reason: `Slightly elevated transaction for ${category}.`,
        actionRecommended: 'Review category assignment.'
      };
    }

    return { riskLevel: 'LOW', flagged: false };
  }
}

module.exports = AnomalyEngine;