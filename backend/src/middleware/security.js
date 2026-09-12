const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const User = require('../models/User');
const SecurityLog = require('../models/SecurityLog');


// 1. DATA SANITIZATION (NoSQL Injection Prevention)
/**
 * Recursively strips MongoDB query operators ($ and .) to prevent Object Injection attacks
 */
const sanitizeData = (data) => {
  if (data instanceof Object) {
    for (const key in data) {
      if (key.startsWith('$') || key.includes('.')) {
        delete data[key];
      } else {
        sanitizeData(data[key]);
      }
    }
  }
  return data;
};

/**
 * Middleware wrapper to sanitize req.body, req.query, and req.params
 */
const mongoSanitizeMiddleware = (req, res, next) => {
  if (req.body) sanitizeData(req.body);
  if (req.query) sanitizeData(req.query);
  if (req.params) sanitizeData(req.params);
  next();
};


// 2. RATE LIMITERS
/**
 * Login Rate Limiter - Prevent brute force
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return `${req.ip}-${req.body?.email || 'unknown'}`;
  },
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    console.log(`🚨 Rate limit exceeded for ${req.ip} - ${req.body?.email}`);
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Account temporarily locked. Try again in 15 minutes.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 900
    });
  }
});

/**
 * API Rate Limiter - General
 */
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

/**
 * Strict Rate Limiter - For sensitive operations
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Try again in 1 hour.',
    code: 'STRICT_LIMIT_EXCEEDED'
  }
});

// Alias for backward compatibility
const authRateLimiter = loginLimiter;
const apiRateLimiter = apiLimiter;


// 3. IP & DEVICE FINGERPRINT


const getClientIP = (req) => {
  return (
    req.headers['cf-connecting-ip'] ||
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

const getDeviceFingerprint = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  return crypto
    .createHash('sha256')
    .update(`${userAgent}-${acceptLanguage}-${acceptEncoding}`)
    .digest('hex')
    .substring(0, 32);
};


// 4. SUSPICIOUS ACTIVITY DETECTION


const detectSuspiciousActivity = async (userId, req, action) => {
  try {
    const ip = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'unknown';
    const fingerprint = getDeviceFingerprint(req);

    // Get user's recent activity (last 24 hours)
    const recentLogs = await SecurityLog.find({
      user: userId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 }).limit(20);

    const warnings = [];

    // Check 1: New IP address
    const knownIPs = new Set(recentLogs.map(log => log.ip));
    if (knownIPs.size > 0 && !knownIPs.has(ip)) {
      warnings.push({
        type: 'new_ip',
        severity: 'medium',
        message: `Login from new IP: ${ip}`
      });
    }

    // Check 2: New device
    const knownDevices = new Set(recentLogs.map(log => log.deviceFingerprint));
    if (knownDevices.size > 0 && !knownDevices.has(fingerprint)) {
      warnings.push({
        type: 'new_device',
        severity: 'medium',
        message: 'Login from new device'
      });
    }

    // Check 3: Rapid location change
    const lastHourLogs = recentLogs.filter(
      log => log.createdAt >= new Date(Date.now() - 60 * 60 * 1000)
    );
    const recentIPs = new Set(lastHourLogs.map(log => log.ip));
    if (recentIPs.size >= 3 && !recentIPs.has(ip)) {
      warnings.push({
        type: 'multiple_locations',
        severity: 'high',
        message: 'Multiple login attempts from different locations'
      });
    }

    // Log the activity
    await SecurityLog.create({
      user: userId,
      action,
      ip,
      userAgent,
      deviceFingerprint: fingerprint,
      warnings,
      severity: warnings.some(w => w.severity === 'high') ? 'warning' : 'info',
      success: true
    });

    return warnings;
  } catch (error) {
    console.error('Suspicious activity detection error:', error);
    return [];
  }
};


// 5. ACCOUNT LOCKOUT


const checkAccountLock = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return { locked: false };

  if (user.security?.lockUntil && user.security.lockUntil > Date.now()) {
    const remainingTime = Math.ceil((user.security.lockUntil - Date.now()) / 1000 / 60);
    return {
      locked: true,
      reason: 'too_many_attempts',
      remainingMinutes: remainingTime,
      message: `Account locked. Try again in ${remainingTime} minutes.`
    };
  }

  if (user.security?.lockUntil && user.security.lockUntil <= Date.now()) {
    user.security.lockUntil = null;
    user.security.loginAttempts = 0;
    await user.save();
  }

  return { locked: false };
};

const incrementFailedAttempts = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    return { attempts: 1, locked: false };
  }

  if (!user.security) user.security = {};
  user.security.loginAttempts = (user.security.loginAttempts || 0) + 1;
  user.security.lastFailedLogin = new Date();

  let lockDuration = 0;
  if (user.security.loginAttempts >= 5) lockDuration = 15 * 60 * 1000;
  if (user.security.loginAttempts >= 10) lockDuration = 60 * 60 * 1000;
  if (user.security.loginAttempts >= 20) lockDuration = 24 * 60 * 60 * 1000;

  if (lockDuration > 0) {
    user.security.lockUntil = Date.now() + lockDuration;
  }

  await user.save();

  return {
    attempts: user.security.loginAttempts,
    locked: lockDuration > 0,
    lockUntil: user.security.lockUntil
  };
};

const resetFailedAttempts = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    $set: {
      'security.loginAttempts': 0,
      'security.lockUntil': null,
      'security.lastLogin': new Date()
    }
  });
};


// 6. IP BLACKLIST
const ipBlacklist = new Map();

const checkIPBlacklist = (ip) => {
  const blocked = ipBlacklist.get(ip);
  if (blocked && blocked.until > Date.now()) {
    return true;
  }
  if (blocked && blocked.until <= Date.now()) {
    ipBlacklist.delete(ip);
  }
  return false;
};

const blockIP = (ip, duration = 24 * 60 * 60 * 1000) => {
  ipBlacklist.set(ip, {
    blockedAt: Date.now(),
    until: Date.now() + duration
  });
  console.log(`🚫 IP blocked: ${ip} for ${duration / 1000 / 60} minutes`);
};

const middlewareCheckIP = (req, res, next) => {
  const ip = getClientIP(req);
  
  if (checkIPBlacklist(ip)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Your IP has been blocked.',
      code: 'IP_BLOCKED'
    });
  }
  
  next();
};


// 7. SESSION SECURITY
const validateSession = async (req, res, next) => {
  try {
    const deviceFingerprint = getDeviceFingerprint(req);
    const Session = require('../models/Session');
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return next();

    const session = await Session.findOne({ token });
    if (!session) return next();

    if (session.deviceFingerprint && session.deviceFingerprint !== deviceFingerprint) {
      console.log(`🚨 SESSION HIJACKING DETECTED: User ${session.user}`);
      
      await SecurityLog.create({
        user: session.user,
        action: 'session_hijack_attempt',
        ip: getClientIP(req),
        userAgent: req.headers['user-agent'],
        deviceFingerprint,
        severity: 'critical'
      });
      
      await Session.deleteMany({ user: session.user });
      
      return res.status(401).json({
        success: false,
        message: 'Security breach detected. Please login again.',
        code: 'SESSION_HIJACKED'
      });
    }

    session.lastActive = new Date();
    await session.save();

    next();
  } catch (error) {
    next();
  }
};


// 8. PASSWORD CONFIRMATION GUARD

const requirePasswordConfirmation = async (req, res, next) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password confirmation required for this operation',
        code: 'PASSWORD_REQUIRED'
      });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await SecurityLog.create({
        user: req.user.id,
        action: 'invalid_password_confirmation',
        ip: getClientIP(req),
        severity: 'warning'
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid password',
        code: 'INVALID_PASSWORD'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};



module.exports = {
  // Sanitization
  sanitizeData,
  mongoSanitizeMiddleware,
  
  // Rate limiters
  loginLimiter,
  apiLimiter,
  strictLimiter,
  authRateLimiter,
  apiRateLimiter,
  
  // Helpers
  getClientIP,
  getDeviceFingerprint,
  detectSuspiciousActivity,
  checkAccountLock,
  incrementFailedAttempts,
  resetFailedAttempts,
  
  // IP blacklist
  checkIPBlacklist,
  blockIP,
  middlewareCheckIP,
  
  // Session & Password
  validateSession,
  requirePasswordConfirmation
};