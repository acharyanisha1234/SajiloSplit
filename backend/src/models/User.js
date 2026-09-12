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

  // ===== KYC VERIFICATION (Enhanced) =====
  kyc: {
    status: {
      type: String,
      enum: ['not_submitted', 'pending', 'approved', 'rejected'],
      default: 'not_submitted'
    },
    documentType: {
      type: String,
      enum: ['citizenship', 'passport', 'driving_license', null]
    },
    documentNumber: { type: String },
    documentFront: { type: String },
    documentBack: { type: String },
    selfie: { type: String },
    addressProof: { type: String },
    
    // Personal Info (from document)
    fullName: { type: String },
    dateOfBirth: { type: Date },
    address: { type: String },
    
    // Verification
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
      deviceId: { type: String },
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

  // User Settings
  settings: {
    theme: { type: String, default: 'light' },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'NPR' },
    notifications: { type: Boolean, default: true },
    soundEffects: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: true },
    loginAlerts: { type: Boolean, default: true },
    transactionAlerts: { type: Boolean, default: true },
  },

  // Profile
  profileImage: { type: String },
  address: { type: String },
  dob: { type: Date },

  // Verification
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpire: { type: Date },

  // Password Reset
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },

}, { timestamps: true });

// ===== Pre-save Hook =====
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ===== Methods =====
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.isLocked = function() {
  return this.security?.lockUntil && this.security.lockUntil > Date.now();
};

userSchema.methods.incrementLoginAttempts = async function() {
  if (!this.security) this.security = {};
  this.security.loginAttempts = (this.security.loginAttempts || 0) + 1;
  if (this.security.loginAttempts >= 5) {
    this.security.lockUntil = Date.now() + 30 * 60 * 1000;
  }
  await this.save();
};

userSchema.methods.resetLoginAttempts = async function() {
  if (!this.security) this.security = {};
  this.security.loginAttempts = 0;
  this.security.lockUntil = null;
  await this.save();
};

userSchema.methods.getSettings = function() {
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
  return { ...defaultSettings, ...(this.settings || {}) };
};

// ===== KYC Helper Methods =====
userSchema.methods.isKYCVerified = function() {
  return this.kyc?.status === 'approved';
};

userSchema.methods.canTransact = function() {
  return this.isActive && 
         !this.isSuspended && 
         this.kyc?.status === 'approved';
};

userSchema.methods.getKYCStatus = function() {
  return this.kyc?.status || 'not_submitted';
};

// ===== Indexes =====
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ 'kyc.status': 1 });
userSchema.index({ 'security.devices.deviceId': 1 });

module.exports = mongoose.model('User', userSchema);