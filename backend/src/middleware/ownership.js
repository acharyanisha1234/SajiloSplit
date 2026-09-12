const User = require('../models/User');
const Wallet = require('../models/Wallet');

// ===== Verify user owns the resource =====
const verifyOwnership = (Model, userField = 'user') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check ownership
      const ownerId = resource[userField]?.toString();
      
      if (ownerId !== req.user.id && req.user.role !== 'admin') {
        // Log unauthorized access attempt
        const SecurityLog = require('../models/SecurityLog');
        const security = require('./security');
        
        await SecurityLog.create({
          user: req.user.id,
          action: 'suspicious_activity',
          ip: security.getClientIP(req),
          userAgent: req.headers['user-agent'],
          severity: 'critical',
          details: {
            reason: 'UNAUTHORIZED_RESOURCE_ACCESS',
            resource: Model.modelName,
            resourceId,
            ownerId
          }
        });

        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this resource',
          code: 'UNAUTHORIZED_ACCESS'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
};

// ===== Verify transaction involvement =====
const verifyTransactionAccess = async (req, res, next) => {
  try {
    const WalletTransaction = require('../models/WalletTransaction');
    const transaction = await WalletTransaction.findOne({
      transactionId: req.params.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const userId = req.user.id;
    const isSender = transaction.sender?.toString() === userId;
    const isReceiver = transaction.receiver?.toString() === userId;

    if (!isSender && !isReceiver && req.user.role !== 'admin') {
      const SecurityLog = require('../models/SecurityLog');
      const security = require('./security');
      
      await SecurityLog.create({
        user: userId,
        action: 'suspicious_activity',
        ip: security.getClientIP(req),
        severity: 'critical',
        details: {
          reason: 'UNAUTHORIZED_TRANSACTION_ACCESS',
          transactionId: transaction._id
        }
      });

      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this transaction'
      });
    }

    req.transaction = transaction;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  verifyOwnership,
  verifyTransactionAccess
};