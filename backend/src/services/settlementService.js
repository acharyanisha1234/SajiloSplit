const Settlement = require('../models/Settlement');
const WalletTransaction = require('../models/WalletTransaction');
const Wallet = require('../models/Wallet');
const mongoose = require('mongoose');
const { generateTransactionId } = require('../utils/generateId');

const calculateSettlements = async (groupId, expenses) => {
  const paidByMap = new Map();
  const balances = new Map();

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

  for (const [userId, totalPaid] of paidByMap) {
    if (!balances.has(userId)) {
      balances.set(userId, 0);
    }

    balances.set(
      userId,
      balances.get(userId) + totalPaid
    );
  }

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

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  // Generate settlements
  const settlements = [];

  let i = 0;
  let j = 0;

  while (
    i < debtors.length &&
    j < creditors.length
  ) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(
      debtor.amount,
      creditor.amount
    );

    if (amount > 0) {
      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(amount * 100) / 100,
        group: groupId
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount === 0) {
      i++;
    }

    if (creditor.amount === 0) {
      j++;
    }
  }

  return settlements;
};

module.exports = {
  calculateSettlements
};