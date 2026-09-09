const AuditLog = require('../models/AuditLog');

// Create audit log
const createAuditLog = async (userId, action, details = {}, ip = '') => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      ip,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

// Log user login
const logLogin = async (userId, ip) => {
  return createAuditLog(userId, 'login', 'User logged in', ip);
};

// Log user logout
const logLogout = async (userId, ip) => {
  return createAuditLog(userId, 'logout', 'User logged out', ip);
};

// Log user registration
const logRegistration = async (userId, ip) => {
  return createAuditLog(userId, 'create', 'User registered', ip);
};

// Log wallet transaction
const logWalletTransaction = async (userId, action, details, ip) => {
  return createAuditLog(userId, action, details, ip);
};

// Log group creation
const logGroupCreation = async (userId, groupName, ip) => {
  return createAuditLog(userId, 'create', `Group "${groupName}" created`, ip);
};

// Log expense creation
const logExpenseCreation = async (userId, expenseTitle, amount, ip) => {
  return createAuditLog(userId, 'create', `Expense "${expenseTitle}" of Rs. ${amount} created`, ip);
};

// Log user suspension
const logUserSuspension = async (userId, targetUserId, ip) => {
  return createAuditLog(userId, 'suspend', `User ${targetUserId} suspended`, ip);
};

// Log user activation
const logUserActivation = async (userId, targetUserId, ip) => {
  return createAuditLog(userId, 'activate', `User ${targetUserId} activated`, ip);
};

module.exports = {
  createAuditLog,
  logLogin,
  logLogout,
  logRegistration,
  logWalletTransaction,
  logGroupCreation,
  logExpenseCreation,
  logUserSuspension,
  logUserActivation
};