const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email function
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `SajiloSplit <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error(' Email send error:', error.message);
    // Don't throw error, just log it
    return null;
  }
};

// Send verification email
const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f6f0; border-radius: 12px;">
      <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background: #0EA5A5; color: white; padding: 10px 20px; border-radius: 8px; font-size: 24px; font-weight: bold;">
            SajiloSplit
          </div>
        </div>
        <h2 style="color: #1A2E4A; text-align: center;">Verify Your Email</h2>
        <p style="color: #4a5568; font-size: 16px;">Hello ${name},</p>
        <p style="color: #4a5568; font-size: 16px;">Thank you for registering with SajiloSplit. Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: #0EA5A5; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(14,165,165,0.3);">
            Verify Email
          </a>
        </div>
        <p style="color: #718096; font-size: 14px; text-align: center;">Or copy and paste this link in your browser:</p>
        <p style="color: #4a5568; font-size: 12px; text-align: center; word-break: break-all; background: #f8f6f0; padding: 10px; border-radius: 6px;">${verificationUrl}</p>
        <p style="color: #a0aec0; font-size: 12px; text-align: center; margin-top: 20px;">This link will expire in 24 hours.</p>
        <hr style="border: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #a0aec0; font-size: 12px; text-align: center;">If you didn't create an account, please ignore this email.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your SajiloSplit Account',
    html
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f6f0; border-radius: 12px;">
      <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background: #0EA5A5; color: white; padding: 10px 20px; border-radius: 8px; font-size: 24px; font-weight: bold;">
            SajiloSplit
          </div>
        </div>
        <h2 style="color: #1A2E4A; text-align: center;">Reset Your Password</h2>
        <p style="color: #4a5568; font-size: 16px;">Hello ${name},</p>
        <p style="color: #4a5568; font-size: 16px;">You requested to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #0EA5A5; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(14,165,165,0.3);">
            Reset Password
          </a>
        </div>
        <p style="color: #718096; font-size: 14px; text-align: center;">Or copy and paste this link in your browser:</p>
        <p style="color: #4a5568; font-size: 12px; text-align: center; word-break: break-all; background: #f8f6f0; padding: 10px; border-radius: 6px;">${resetUrl}</p>
        <p style="color: #a0aec0; font-size: 12px; text-align: center; margin-top: 20px;">This link will expire in 10 minutes.</p>
        <hr style="border: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #a0aec0; font-size: 12px; text-align: center;">If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your SajiloSplit Password',
    html
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail
};