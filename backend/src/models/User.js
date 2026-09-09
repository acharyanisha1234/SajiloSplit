const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },

  // Role & Status
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  isSuspended: { type: Boolean, default: false },

  // KYC Verification
  kyc: {
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'not_submitted'], default: 'not_submitted' },
    documentType: { type: String, enum: ['citizenship', 'passport', 'driving_license'] },
    documentNumber: { type: String },
    documentFront: { type: String },
    documentBack: { type: String },
    selfie: { type: String },
    addressProof: { type: String },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
    submittedAt: { type: Date },
  },

  // 2FA
  twoFactor: {
    enabled: { type: Boolean, default: false },
    secret: { type: String },
    backupCodes: [{ type: String }],
  },

  // Security
  security: {
    lastLogin: { type: Date },
    lastLoginIP: { type: String },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    devices: [{
      deviceId: { type: String, required: true },
      deviceName: { type: String },
      deviceType: { type: String },
      browser: { type: String },
      os: { type: String },
      ip: { type: String },
      lastActive: { type: Date, default: Date.now },
      isTrusted: { type: Boolean, default: false },
    }],
    sessions: [{
      token: { type: String },
      expiresAt: { type: Date },
      createdAt: { type: Date, default: Date.now },
    }],
  },

  // Transaction PIN
  transactionPin: { type: String },
  pinAttempts: { type: Number, default: 0 },
  pinLockUntil: { type: Date },

  // ===== ✅ ADD THIS - User Settings (For Settings Page) =====
  settings: {
    // Theme preference
    theme: { 
      type: String, 
      enum: ['light', 'dark'], 
      default: 'light' 
    },
    // Language preference
    language: { 
      type: String, 
      default: 'English' 
    },
    // Currency preference
    currency: { 
      type: String, 
      default: 'NPR' 
    },
    // Notification settings
    notifications: { 
      type: Boolean, 
      default: true 
    },
    soundEffects: { 
      type: Boolean, 
      default: true 
    },
    emailNotifications: { 
      type: Boolean, 
      default: true 
    },
    smsNotifications: { 
      type: Boolean, 
      default: false 
    },
    pushNotifications: { 
      type: Boolean, 
      default: true 
    },
    // Security alert settings
    loginAlerts: { 
      type: Boolean, 
      default: true 
    },
    transactionAlerts: { 
      type: Boolean, 
      default: true 
    },
  },

  // Verification
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpire: { type: Date },

  // Password Reset
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },

}, { timestamps: true });

// Pre-save hooks
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Methods
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.isLocked = function() {
  return this.security.lockUntil && this.security.lockUntil > Date.now();
};

userSchema.methods.incrementLoginAttempts = async function() {
  this.security.loginAttempts += 1;
  if (this.security.loginAttempts >= 5) {
    this.security.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
  }
  await this.save();
};

userSchema.methods.resetLoginAttempts = async function() {
  this.security.loginAttempts = 0;
  this.security.lockUntil = null;
  await this.save();
};

// ===== ADD THIS - Get settings method =====
userSchema.methods.getSettings = function() {
  return this.settings;
};

// ===== ADD THIS - Update settings method =====
userSchema.methods.updateSettings = function(updates) {
  const allowed = [
    'theme', 'language', 'currency', 'notifications', 'soundEffects',
    'emailNotifications', 'smsNotifications', 'pushNotifications',
    'loginAlerts', 'transactionAlerts'
  ];
  
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      this.settings[key] = updates[key];
    }
  }
  return this.save();
};

//  ADD THIS - Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ 'security.devices.deviceId': 1 });

module.exports = mongoose.model('User', userSchema);