const Settlement = require('../models/Settlement');
const WalletTransaction = require('../models/WalletTransaction');
const Wallet = require('../models/Wallet');
const mongoose = require('mongoose');
const { generateTransactionId } = require('../utils/generateId');

const calculateSettlements = async (groupId, expenses) => {
  const paidByMap = new Map();
  const balances = new Map();

  // Calculate balances
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

  // Add total paid amount to payer's balance
  for (const [userId, totalPaid] of paidByMap) {
    if (!balances.has(userId)) {
      balances.set(userId, 0);
    }

    balances.set(
      userId,
      balances.get(userId) + totalPaid
    );
  }

  // Separate creditors and debtors
  const creditors = [];
  const debtors = [];

  for (const [userId, balance] of balances) {
    if (balance > 0) {
      creditors.push({
        userId,
        amount: balance
      });
    } else if (balance < 0) {
      debtors.push({
        userId,
        amount: Math.abs(balance)
      });
    }
  }

  // Sort by largest amount
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);
};

module.exports = {
  calculateSettlements
};