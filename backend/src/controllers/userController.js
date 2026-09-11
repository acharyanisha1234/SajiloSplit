const User = require('../models/User');
const Session = require('../models/Session');
const WalletTransaction = require('../models/WalletTransaction');
const Group = require('../models/Group');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


//USER SETTINGS


// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const {
      theme,
      language,
      currency,
      notifications,
      soundEffects,
      emailNotifications,
      smsNotifications,
      pushNotifications,
      loginAlerts,
      transactionAlerts
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize settings if not exists
    if (!user.settings) {
      user.settings = {};
    }

    // Update only provided fields
    if (theme !== undefined) user.settings.theme = theme;
    if (language !== undefined) user.settings.language = language;
    if (currency !== undefined) user.settings.currency = currency;
    if (notifications !== undefined) user.settings.notifications = notifications;
    if (soundEffects !== undefined) user.settings.soundEffects = soundEffects;
    if (emailNotifications !== undefined) user.settings.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined) user.settings.smsNotifications = smsNotifications;
    if (pushNotifications !== undefined) user.settings.pushNotifications = pushNotifications;
    if (loginAlerts !== undefined) user.settings.loginAlerts = loginAlerts;
    if (transactionAlerts !== undefined) user.settings.transactionAlerts = transactionAlerts;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: user.settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user settings
// @route   GET /api/users/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return default settings if not set
    const defaultSettings = {
      theme: 'light',
      language: 'en',
      currency: 'NPR',
      notifications: true,
      soundEffects: true,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      loginAlerts: true,
      transactionAlerts: true
    };

    const settings = { ...defaultSettings, ...(user.settings || {}) };

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// ===== SESSION MANAGEMENT =====
// ============================================

// Helper: Get device name from user agent
const getDeviceName = (userAgent) => {
  if (!userAgent) return 'Unknown Device';
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome Browser';
  if (userAgent.includes('Firefox')) return 'Firefox Browser';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari Browser';
  if (userAgent.includes('Edg')) return 'Edge Browser';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera Browser';
  if (userAgent.includes('Android')) return 'Android Phone';
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Mac OS') || userAgent.includes('Macintosh')) return 'Mac Computer';
  if (userAgent.includes('Linux')) return 'Linux Computer';
  
  return 'Unknown Device';
};

// Helper: Get OS from user agent
const getOS = (userAgent) => {
  if (!userAgent) return 'Unknown OS';
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS') || userAgent.includes('Macintosh')) return 'macOS';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  if (userAgent.includes('Linux')) return 'Linux';
  return 'Unknown OS';
};

// @desc    Get all active sessions
// @route   GET /api/users/sessions
// @access  Private
const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user.id })
      .sort({ lastActive: -1 });

    const authHeader = req.headers.authorization;
    const currentToken = authHeader?.split(' ')[1];

    const formattedSessions = sessions.map(session => {
      const isCurrent = session.token === currentToken || session.isCurrent;
      const deviceName = session.deviceName && session.deviceName !== 'Unknown Device' 
        ? session.deviceName 
        : getDeviceName(session.userAgent);
      const os = session.os && session.os !== 'Unknown OS' 
        ? session.os 
        : getOS(session.userAgent);

      return {
        id: session._id,
        deviceId: session.deviceId,
        deviceName: deviceName,
        deviceType: session.deviceType || 'web',
        ip: session.ip || 'Unknown IP',
        os: os,
        browser: session.browser || 'Unknown Browser',
        lastActive: session.lastActive,
        isCurrent: isCurrent
      };
    });

    res.status(200).json({
      success: true,
      data: formattedSessions
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Logout from all devices
// @route   POST /api/users/sessions/logout-all
// @access  Private
const logoutAllDevices = async (req, res) => {
  try {
    await Session.deleteMany({ user: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Logged out from all devices'
    });
  } catch (error) {
    console.error('Logout all devices error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Logout from specific device
// @route   DELETE /api/users/sessions/:id
// @access  Private
const logoutDevice = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findOne({ _id: id, user: req.user.id });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    await session.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Device logged out successfully'
    });
  } catch (error) {
    console.error('Logout device error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


//  TWO-FACTOR AUTHENTICATION 


// @desc    Get 2FA status
// @route   GET /api/users/2fa/status
// @access  Private
const get2FAStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      enabled: user.twoFactor?.enabled || false
    });
  } catch (error) {
    console.error('Get 2FA status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Setup 2FA
// @route   POST /api/users/2fa/setup
// @access  Private
const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate secret
    const secret = crypto.randomBytes(20).toString('hex').toUpperCase();

    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }

    // Save secret (not enabled yet)
    user.twoFactor = {
      enabled: false,
      secret: secret,
      backupCodes: backupCodes
    };
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        secret: secret,
        backupCodes: backupCodes
      }
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify and enable 2FA
// @route   POST /api/users/2fa/verify
// @access  Private
const verify2FA = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || code.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit code'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.twoFactor?.secret) {
      return res.status(400).json({
        success: false,
        message: '2FA not set up yet'
      });
    }

    // For demo: accept 123456 as valid code
    // In production: use speakeasy.totp.verify()
    if (code === '123456') {
      user.twoFactor.enabled = true;
      await user.save();

      res.status(200).json({
        success: true,
        message: '2FA enabled successfully',
        data: {
          backupCodes: user.twoFactor.backupCodes
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid 2FA code'
      });
    }
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Disable 2FA
// @route   POST /api/users/2fa/disable
// @access  Private
const disable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.twoFactor = {
      enabled: false,
      secret: null,
      backupCodes: []
    };
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


//DATA EXPORT


// @desc    Export user data
// @route   POST /api/users/export
// @access  Private
const exportData = async (req, res) => {
  try {
    const { type = 'all' } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const exportResult = {};

    // Profile data
    if (type === 'all' || type === 'profile') {
      exportResult.profile = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        dob: user.dob,
        joined: user.createdAt,
        kyc: {
          status: user.kyc?.status || 'not_submitted'
        },
        settings: user.settings || {}
      };
    }

    // Transactions
    if (type === 'all' || type === 'transactions') {
      const transactions = await WalletTransaction.find({
        $or: [
          { sender: req.user.id },
          { receiver: req.user.id }
        ]
      })
        .populate('sender', 'name email')
        .populate('receiver', 'name email')
        .sort({ createdAt: -1 });

      exportResult.transactions = transactions.map(t => ({
        id: t.transactionId,
        amount: t.amount,
        type: t.type,
        status: t.status,
        purpose: t.purpose,
        description: t.description,
        date: t.createdAt,
        sender: t.sender?.name,
        receiver: t.receiver?.name
      }));
    }

    // Groups
    if (type === 'all' || type === 'groups') {
      const groups = await Group.find({ members: req.user.id });

      exportResult.groups = groups.map(g => ({
        name: g.name,
        description: g.description,
        members: g.members?.length || 0,
        balance: g.balance,
        targetAmount: g.targetAmount,
        status: g.status,
        created: g.createdAt
      }));
    }

    res.status(200).json({
      success: true,
      data: exportResult
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// DELETE ACCOUNT 
// @desc    Delete user account (soft delete)
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Soft delete - deactivate account
    user.isActive = false;
    user.isSuspended = true;
    await user.save();

    // Delete all sessions
    await Session.deleteMany({ user: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// PROFILE MANAGEMENT 


// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, dob } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (dob) user.dob = dob;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          dob: user.dob,
          profileImage: user.profileImage
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// EXPORTS 


module.exports = {
  // Settings
  updateSettings,
  getSettings,

  // Sessions
  getSessions,
  logoutAllDevices,
  logoutDevice,

  // 2FA
  get2FAStatus,
  setup2FA,
  verify2FA,
  disable2FA,

  // Data Export
  exportData,

  // Delete Account
  deleteAccount,

  // Profile
  updateProfile,
  getProfile
};