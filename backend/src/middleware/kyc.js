const User = require('../models/User');

// ===== Require KYC Approval =====
const requireKYC = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended',
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    const kycStatus = user.kyc?.status || 'not_submitted';

    if (kycStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'KYC verification required to perform this action',
        code: 'KYC_REQUIRED',
        kycStatus,
        action: 'Please complete your KYC verification to continue'
      });
    }

    req.user.kycVerified = true;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
};

// ===== Check KYC Status (Non-blocking) =====
const checkKYC = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    req.user.kycStatus = user?.kyc?.status || 'not_submitted';
    req.user.isKYCVerified = req.user.kycStatus === 'approved';
    next();
  } catch (error) {
    req.user.kycStatus = 'not_submitted';
    req.user.isKYCVerified = false;
    next();
  }
};

module.exports = { requireKYC, checkKYC };