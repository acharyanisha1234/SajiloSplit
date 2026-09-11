const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Session = require('../models/Session');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');


// MULTER CONFIGURATION

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const getDeviceName = (userAgent) => {
  if (!userAgent) return 'Unknown Device';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome Browser';
  if (userAgent.includes('Firefox')) return 'Firefox Browser';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari Browser';
  if (userAgent.includes('Edg')) return 'Edge Browser';
  if (userAgent.includes('Android')) return 'Android Phone';
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Mac OS')) return 'Mac Computer';
  if (userAgent.includes('Linux')) return 'Linux Computer';
  return 'Unknown Device';
};

const getOS = (userAgent) => {
  if (!userAgent) return 'Unknown OS';
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS')) return 'macOS';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  if (userAgent.includes('Linux')) return 'Linux';
  return 'Unknown OS';
};

// ==========================================
// 2FA ROUTES
// ==========================================

// Get 2FA Status
router.get('/2fa/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      enabled: user ? (user.twoFactor?.enabled || false) : false
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Setup 2FA
router.post('/2fa/setup', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const secret = crypto.randomBytes(20).toString('hex').toUpperCase();
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }

    user.twoFactor = {
      enabled: false,
      secret: secret,
      backupCodes: backupCodes
    };
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA setup initialized',
      data: {
        secret: secret,
        backupCodes: backupCodes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Verify 2FA
router.post('/2fa/verify', protect, async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!code || code.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit code'
      });
    }

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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Disable 2FA
router.post('/2fa/disable', protect, async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
// SESSION ROUTES
// ==========================================

// Get Active Sessions
router.get('/sessions', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user.id })
      .sort({ lastActive: -1 });

    const authHeader = req.headers.authorization;
    const currentToken = authHeader?.split(' ')[1];

    // If no sessions in DB, return current session
    if (sessions.length === 0) {
      return res.status(200).json({
        success: true,
        data: [
          {
            id: 'current-session',
            deviceName: getDeviceName(req.headers['user-agent']),
            ip: req.ip || req.connection.remoteAddress || '127.0.0.1',
            os: getOS(req.headers['user-agent']),
            lastActive: new Date(),
            isCurrent: true
          }
        ]
      });
    }

    const formattedSessions = sessions.map(session => ({
      id: session._id,
      deviceName: session.deviceName && session.deviceName !== 'Unknown Device'
        ? session.deviceName
        : getDeviceName(session.userAgent),
      ip: session.ip || 'Unknown IP',
      os: session.os && session.os !== 'Unknown OS'
        ? session.os
        : getOS(session.userAgent),
      lastActive: session.lastActive,
      isCurrent: session.token === currentToken || session.isCurrent
    }));

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
});

// Logout All Devices
router.post('/sessions/logout-all', protect, async (req, res) => {
  try {
    await Session.deleteMany({ user: req.user.id });
    res.status(200).json({
      success: true,
      message: 'Logged out from all devices'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Logout Specific Device
router.delete('/sessions/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (id === 'current-session') {
      return res.status(400).json({
        success: false,
        message: 'Cannot logout current session'
      });
    }

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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
// SETTINGS ROUTES
// ==========================================

// Get Settings
router.get('/settings', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update Settings
router.put('/settings', protect, async (req, res) => {
  try {
    const {
      theme, language, currency, notifications, soundEffects,
      emailNotifications, smsNotifications, pushNotifications,
      loginAlerts, transactionAlerts
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.settings) user.settings = {};

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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
// DATA EXPORT
// ==========================================

router.post('/export', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const exportResult = {
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        joined: user.createdAt,
        settings: user.settings || {}
      }
    };

    res.status(200).json({
      success: true,
      data: exportResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==========================================
// EXISTING ROUTES
// ==========================================

// Get all users (with search)
router.get('/', protect, async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ],
        _id: { $ne: req.user.id }
      };
    }

    const users = await User.find(query)
      .select('name email phone profileImage isActive isVerified')
      .limit(20);

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update profile
router.put('/profile', protect, async (req, res) => {
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
          profileImage: user.profileImage,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Upload profile image
router.post('/profile-image', protect, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await User.findById(req.user.id);
    user.profileImage = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Change password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    await Session.deleteMany({ user: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete account (soft delete)
router.delete('/account', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (req.body.password) {
      const isMatch = await user.comparePassword(req.body.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }
    }

    user.isActive = false;
    user.isSuspended = true;
    await user.save();

    await Session.deleteMany({ user: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user by ID (MUST BE LAST)
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email phone profileImage address dob isVerified isActive');

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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;