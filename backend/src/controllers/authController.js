const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Session = require('../models/Session');
const SecurityLog = require('../models/SecurityLog'); 
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { getDeviceInfo } = require('../utils/device');


const {
  getClientIP,
  getDeviceFingerprint,
  checkAccountLock,
  incrementFailedAttempts,
  resetFailedAttempts,
  detectSuspiciousActivity,
  checkIPBlacklist,
  blockIP
} = require('../middleware/security');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    //  Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone'
      });
    }

    const user = await User.create({ name, email, phone, password });

    await Wallet.create({
      user: user._id,
      balance: 0,
      availableBalance: 0,
      lockedBalance: 0
    });

    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailError) {
      console.error('Email send error:', emailError.message);
    }

    //  Log registration
    try {
      await SecurityLog.create({
        user: user._id,
        action: 'session_created',
        ip: getClientIP(req),
        userAgent: req.headers['user-agent'],
        deviceFingerprint: getDeviceFingerprint(req),
        severity: 'info',
        details: { reason: 'USER_REGISTERED' }
      });
    } catch (logError) {
      console.error('Security log error:', logError.message);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Login user
const login = async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    //  Get client info
    const clientIP = getClientIP(req);
    const deviceFingerprint = getDeviceFingerprint(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    //  Check IP blacklist
    if (checkIPBlacklist(clientIP)) {
      try {
        await SecurityLog.create({
          action: 'login_failed',
          ip: clientIP,
          userAgent,
          severity: 'critical',
          details: { reason: 'IP_BLACKLISTED', email }
        });
      } catch (logError) {
        console.error('Security log error:', logError.message);
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied from your IP address',
        code: 'IP_BLOCKED'
      });
    }

    // Check account lockout
    const lockStatus = await checkAccountLock(email);
    if (lockStatus.locked) {
      try {
        await SecurityLog.create({
          action: 'login_failed',
          ip: clientIP,
          userAgent,
          severity: 'warning',
          details: { reason: 'ACCOUNT_LOCKED', email }
        });
      } catch (logError) {
        console.error('Security log error:', logError.message);
      }

      return res.status(423).json({
        success: false,
        message: lockStatus.message,
        code: 'ACCOUNT_LOCKED',
        remainingMinutes: lockStatus.remainingMinutes
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      //  Constant time delay (prevent user enumeration)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Increment failed attempts for non-existent user
      await incrementFailedAttempts(email);

      try {
        await SecurityLog.create({
          action: 'login_failed',
          ip: clientIP,
          userAgent,
          deviceFingerprint,
          severity: 'warning',
          details: { reason: 'USER_NOT_FOUND', email }
        });
      } catch (logError) {
        console.error('Security log error:', logError.message);
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.isSuspended) {
      try {
        await SecurityLog.create({
          user: user._id,
          action: 'login_failed',
          ip: clientIP,
          userAgent,
          deviceFingerprint,
          severity: 'warning',
          details: { reason: 'ACCOUNT_SUSPENDED' }
        });
      } catch (logError) {
        console.error('Security log error:', logError.message);
      }

      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      //Increment failed attempts
      const lockResult = await incrementFailedAttempts(email);

      try {
        await SecurityLog.create({
          user: user._id,
          action: 'login_failed',
          ip: clientIP,
          userAgent,
          deviceFingerprint,
          severity: 'warning',
          details: {
            reason: 'INVALID_PASSWORD',
            attempts: lockResult?.attempts || 1,
            locked: lockResult?.locked || false
          }
        });
      } catch (logError) {
        console.error('Security log error:', logError.message);
      }

      //  Block IP after 15 failed attempts
      if (lockResult?.attempts >= 15) {
        blockIP(clientIP, 24 * 60 * 60 * 1000);
      }

      //  Send alert email after 5 failed attempts
      if (lockResult?.attempts === 5) {
        try {
          const { sendSecurityAlertEmail } = require('../services/emailService');
          if (typeof sendSecurityAlertEmail === 'function') {
            await sendSecurityAlertEmail(
              user.email,
              user.name,
              'Multiple Failed Login Attempts',
              `We detected ${lockResult.attempts} failed login attempts on your account. If this wasn't you, please secure your account immediately.`
            );
          }
        } catch (e) {
          console.error('Alert email failed:', e.message);
        }
      }

      return res.status(401).json({
        success: false,
        message: lockResult?.locked 
          ? `Account locked due to too many failed attempts. Try again later.`
          : 'Invalid credentials',
        code: lockResult?.locked ? 'ACCOUNT_LOCKED' : 'INVALID_CREDENTIALS'
      });
    }

    // Reset failed attempts
    await resetFailedAttempts(user._id);

    //  Detect suspicious activity
    const warnings = await detectSuspiciousActivity(user._id, req, 'login_success');

    const token = generateToken(user._id);

    // SAVE SESSION 
    try {
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const deviceId = req.body.deviceId || crypto.randomBytes(16).toString('hex');
      const deviceInfo = getDeviceInfo(userAgent);

      // Delete old sessions for this device
      await Session.deleteMany({ user: user._id, deviceId });

      // Create new session
      await Session.create({
        user: user._id,
        deviceId,
        deviceName: deviceInfo.deviceName,
        deviceType: deviceInfo.deviceType,
        ip: clientIP,
        userAgent,
        os: deviceInfo.os,
        browser: deviceInfo.browser,
        deviceFingerprint, 
        lastActive: new Date(),
        isCurrent: true,
        token
      });

      console.log('Session saved for user:', user.email);
    } catch (sessionError) {
      console.error('Session save error:', sessionError.message);
    }

    //Notify user of suspicious login (high severity)
    const hasHighWarning = warnings.some(w => w.severity === 'high');
    if (hasHighWarning) {
      try {
        const { sendSecurityAlertEmail } = require('../services/emailService');
        if (typeof sendSecurityAlertEmail === 'function') {
          await sendSecurityAlertEmail(
            user.email,
            user.name,
            'New Login Detected',
            `A new login was detected from ${clientIP}. Device: ${userAgent}. If this wasn't you, change your password immediately.`
          );
        }
      } catch (e) {
        console.error('Alert email failed:', e.message);
      }
    }

    res.status(200).json({
      success: true,
      warnings: warnings.length > 0 ? warnings : undefined, 
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified
        },
        wallet: {
          balance: 0,
          availableBalance: 0,
          lockedBalance: 0
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Logout user
const logout = async (req, res) => {
  try {
    // Delete current session
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];

      if (token) {
        await Session.deleteOne({ token });
        console.log('Session deleted on logout');
      }

      //  Log logout
      await SecurityLog.create({
        user: req.user?.id,
        action: 'logout',
        ip: getClientIP(req),
        userAgent: req.headers['user-agent'],
        deviceFingerprint: getDeviceFingerprint(req),
        severity: 'info'
      });
    } catch (sessionError) {
      console.error('Session delete error:', sessionError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const wallet = await Wallet.findOne({ user: req.user.id });

    // Update session lastActive
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];

      if (token) {
        await Session.updateOne(
          { token },
          { lastActive: new Date() }
        );
      }
    } catch (sessionError) {
      console.error('Session update error:', sessionError.message);
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        wallet
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      //  Return success even if user not found (prevent enumeration)
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a reset link has been sent'
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex'); //  Hash token before storing
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (emailError) {
      console.error('Email send error:', emailError.message);
    }

    // Log password reset request
    try {
      await SecurityLog.create({
        user: user._id,
        action: 'password_reset_request',
        ip: getClientIP(req),
        userAgent: req.headers['user-agent'],
        severity: 'info'
      });
    } catch (logError) {
      console.error('Security log error:', logError.message);
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a reset link has been sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reset password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    //  Hash token to compare
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    //  Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    //  Delete all sessions (force re-login)
    await Session.deleteMany({ user: user._id });

    //  Log password reset success
    try {
      await SecurityLog.create({
        user: user._id,
        action: 'password_reset_success',
        ip: getClientIP(req),
        userAgent: req.headers['user-agent'],
        severity: 'info'
      });
    } catch (logError) {
      console.error('Security log error:', logError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      //  Log invalid password attempt
      try {
        await SecurityLog.create({
          user: req.user.id,
          action: 'invalid_password_confirmation',
          ip: getClientIP(req),
          userAgent: req.headers['user-agent'],
          severity: 'warning'
        });
      } catch (logError) {
        console.error('Security log error:', logError.message);
      }

      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    //  Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      });
    }

    // ✅ ADDED - Check password reuse
    if (user.passwordHistory && user.passwordHistory.length > 0) {
      const bcrypt = require('bcryptjs');
      for (const oldPassword of user.passwordHistory) {
        const isReused = await bcrypt.compare(newPassword, oldPassword);
        if (isReused) {
          return res.status(400).json({
            success: false,
            message: 'Cannot reuse any of your last 5 passwords'
          });
        }
      }
    }

    //  Store password in history
    if (!user.passwordHistory) user.passwordHistory = [];
    user.passwordHistory.unshift(user.password);
    user.passwordHistory = user.passwordHistory.slice(0, 5); // Keep last 5

    user.password = newPassword;
    await user.save();

    // Delete all sessions after password change
    try {
      await Session.deleteMany({ user: req.user.id });
      console.log('All sessions invalidated after password change');
    } catch (sessionError) {
      console.error('Session delete error:', sessionError.message);
    }

    // Log password change
    try {
      await SecurityLog.create({
        user: req.user.id,
        action: 'password_change',
        ip: getClientIP(req),
        userAgent: req.headers['user-agent'],
        deviceFingerprint: getDeviceFingerprint(req),
        severity: 'info'
      });
    } catch (logError) {
      console.error('Security log error:', logError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword
};