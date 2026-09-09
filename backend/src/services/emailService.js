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
      html: options.html,
      text: options.text || options.html?.replace(/<[^>]*>/g, '')
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw error;
  }
};

// Send verification email
const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #16a34a;">SajiloSplit</h1>
      <h2>Verify Your Email</h2>
      <p>Hello ${name},</p>
      <p>Thank you for registering with SajiloSplit. Please click the button below to verify your email address:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #16a34a;">SajiloSplit</h1>
      <h2>Reset Your Password</h2>
      <p>Hello ${name},</p>
      <p>You requested to reset your password. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p>This link will expire in 10 minutes.</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your SajiloSplit Password',
    html
  });
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #16a34a;">SajiloSplit</h1>
      <h2>Welcome to SajiloSplit! 🎉</h2>
      <p>Hello ${name},</p>
      <p>Thank you for joining SajiloSplit - Nepal's smart money management platform!</p>
      <p>With SajiloSplit, you can:</p>
      <ul style="color: #555;">
        <li>💰 Manage your digital wallet</li>
        <li>👥 Create groups and share expenses</li>
        <li>📊 Track your budgets and bills</li>
        <li>🔒 Lock funds for specific purposes</li>
        <li>📱 Send and receive money instantly</li>
      </ul>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/dashboard" 
           style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Go to Dashboard
        </a>
      </div>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">Need help? Contact us at support@sajilosplit.com</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to SajiloSplit!',
    html
  });
};

// Send notification email
const sendNotificationEmail = async (email, name, subject, message) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #16a34a;">SajiloSplit</h1>
      <h2>${subject}</h2>
      <p>Hello ${name},</p>
      <p>${message}</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/notifications" 
           style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Notifications
        </a>
      </div>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">This is an automated message from SajiloSplit.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: subject,
    html
  });
};

// Send money received email
const sendMoneyReceivedEmail = async (email, name, amount, from) => {
  return sendNotificationEmail(
    email,
    name,
    `💰 Money Received - Rs. ${amount}`,
    `You have received Rs. ${amount} from ${from}. Your wallet balance has been updated.`
  );
};

// Send money sent email
const sendMoneySentEmail = async (email, name, amount, to) => {
  return sendNotificationEmail(
    email,
    name,
    `💸 Money Sent - Rs. ${amount}`,
    `You have sent Rs. ${amount} to ${to}. Your wallet balance has been updated.`
  );
};

// Send group invitation email
const sendGroupInviteEmail = async (email, name, groupName, inviter) => {
  return sendNotificationEmail(
    email,
    name,
    `👥 Group Invitation - ${groupName}`,
    `${inviter} has invited you to join the group "${groupName}". Click the button below to view the invitation.`
  );
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendNotificationEmail,
  sendMoneyReceivedEmail,
  sendMoneySentEmail,
  sendGroupInviteEmail
};