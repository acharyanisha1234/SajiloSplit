const Settlement = require('../models/Settlement');
const WalletTransaction = require('../models/WalletTransaction');
const Wallet = require('../models/Wallet');
const mongoose = require('mongoose');
const { generateTransactionId } = require('../utils/generateId');

// Calculate settlements for a group using a simplified algorithm
const calculateSettlements = async (groupId, expenses) => {
  // Group expenses by paidBy
  const paidByMap = new Map();
  const balances = new Map();

  // Calculate net balances
  for (const expense of expenses) {
    const paidBy = expense.paidBy.toString();
    const amount = expense.amount;

    if (!paidByMap.has(paidBy)) {
      paidByMap.set(paidBy, 0);
    }

    paidByMap.set(
      paidBy,
      paidByMap.get(paidBy) + amount
    );

    // Calculate each member's share
    for (const member of expense.members) {
      const memberId = member.toString();

      if (!balances.has(memberId)) {
        balances.set(memberId, 0);
      }

      const share = expense.splitDetails[memberId] || 0;

      balances.set(
        memberId,
        balances.get(memberId) - share
      );
    }
  }
};

module.exports = {
  calculateSettlements
};