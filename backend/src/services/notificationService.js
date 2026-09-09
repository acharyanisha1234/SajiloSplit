const Notification = require('../models/Notification');

// Create notification
const createNotification = async (userId, type, title, message, data = {}, link = '') => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
      link,
      isRead: false
    });

    // Emit socket notification
    const io = global.io;
    if (io) {
      io.to(`user-${userId}`).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Notification creation error:', error);
    return null;
  }
};

// Create money received notification
const notifyMoneyReceived = async (userId, amount, fromName) => {
  return createNotification(
    userId,
    'money_received',
    '💰 Money Received',
    `You received Rs. ${amount} from ${fromName}`,
    { amount, from: fromName },
    '/transactions'
  );
};

// Create money sent notification
const notifyMoneySent = async (userId, amount, toName) => {
  return createNotification(
    userId,
    'money_sent',
    '💸 Money Sent',
    `You sent Rs. ${amount} to ${toName}`,
    { amount, to: toName },
    '/transactions'
  );
};

// Create group invitation notification
const notifyGroupInvitation = async (userId, groupName, inviterName) => {
  return createNotification(
    userId,
    'group_invitation',
    '👥 Group Invitation',
    `${inviterName} invited you to join "${groupName}"`,
    { group: groupName, inviter: inviterName },
    '/groups'
  );
};

// Create group contribution notification
const notifyGroupContribution = async (userId, groupName, amount) => {
  return createNotification(
    userId,
    'group_contribution',
    '📊 Group Contribution',
    `You contributed Rs. ${amount} to "${groupName}"`,
    { group: groupName, amount },
    '/groups'
  );
};

// Create new expense notification
const notifyNewExpense = async (userId, groupName, expenseTitle, amount, paidBy) => {
  return createNotification(
    userId,
    'new_expense',
    '🧾 New Expense',
    `${paidBy} added expense "${expenseTitle}" for Rs. ${amount} in "${groupName}"`,
    { group: groupName, expense: expenseTitle, amount, paidBy },
    '/groups'
  );
};

// Create expense approval notification
const notifyExpenseApproval = async (userId, groupName, expenseTitle) => {
  return createNotification(
    userId,
    'expense_approval',
    '✅ Expense Approved',
    `Expense "${expenseTitle}" in "${groupName}" has been approved`,
    { group: groupName, expense: expenseTitle },
    '/groups'
  );
};

// Create expense rejection notification
const notifyExpenseRejection = async (userId, groupName, expenseTitle) => {
  return createNotification(
    userId,
    'expense_rejection',
    '❌ Expense Rejected',
    `Expense "${expenseTitle}" in "${groupName}" has been rejected`,
    { group: groupName, expense: expenseTitle },
    '/groups'
  );
};

// Create settlement reminder notification
const notifySettlementReminder = async (userId, amount, fromName) => {
  return createNotification(
    userId,
    'settlement_reminder',
    '🔔 Settlement Reminder',
    `You owe Rs. ${amount} to ${fromName}. Please settle up!`,
    { amount, to: fromName },
    '/settlements'
  );
};

// Create bill reminder notification
const notifyBillReminder = async (userId, billName, dueDate) => {
  return createNotification(
    userId,
    'bill_reminder',
    '📅 Bill Reminder',
    `Your bill "${billName}" is due on ${new Date(dueDate).toLocaleDateString()}`,
    { bill: billName, dueDate },
    '/bills'
  );
};

// Create budget warning notification
const notifyBudgetWarning = async (userId, category, percentage) => {
  return createNotification(
    userId,
    'budget_warning',
    '⚠️ Budget Warning',
    `You've used ${percentage}% of your "${category}" budget`,
    { category, percentage },
    '/budgets'
  );
};

// Create emergency request notification
const notifyEmergencyRequest = async (userId, amount, reason) => {
  return createNotification(
    userId,
    'emergency_request',
    '🚨 Emergency Request',
    `Emergency request of Rs. ${amount} for "${reason}" submitted`,
    { amount, reason },
    '/emergency-funds'
  );
};

// Create emergency response notification
const notifyEmergencyResponse = async (userId, requestId, status) => {
  return createNotification(
    userId,
    'emergency_response',
    `🚨 Emergency Request ${status}`,
    `Your emergency request has been ${status}`,
    { requestId, status },
    '/emergency-funds'
  );
};

// Create dispute update notification
const notifyDisputeUpdate = async (userId, disputeId, status) => {
  return createNotification(
    userId,
    'dispute_update',
    '⚖️ Dispute Update',
    `Your dispute status has been updated to "${status}"`,
    { disputeId, status },
    '/disputes'
  );
};

// Create locked fund unlock notification
const notifyLockedFundUnlock = async (userId, fundName, amount) => {
  return createNotification(
    userId,
    'locked_fund_unlock',
    '🔓 Fund Unlocked',
    `Your locked fund "${fundName}" of Rs. ${amount} has been unlocked`,
    { fund: fundName, amount },
    '/locked-funds'
  );
};

// Create system notification
const notifySystem = async (userId, message, link = '') => {
  return createNotification(
    userId,
    'system',
    'ℹ️ System Notification',
    message,
    {},
    link
  );
};

module.exports = {
  createNotification,
  notifyMoneyReceived,
  notifyMoneySent,
  notifyGroupInvitation,
  notifyGroupContribution,
  notifyNewExpense,
  notifyExpenseApproval,
  notifyExpenseRejection,
  notifySettlementReminder,
  notifyBillReminder,
  notifyBudgetWarning,
  notifyEmergencyRequest,
  notifyEmergencyResponse,
  notifyDisputeUpdate,
  notifyLockedFundUnlock,
  notifySystem
};