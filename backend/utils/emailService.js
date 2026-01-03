const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // For development/testing, use Ethereal (fake SMTP)
  // For production, use real SMTP (Gmail, SendGrid, etc.)

  if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Gmail configuration (for testing)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }

  // Fallback: Log to console (development without email setup)
  return null;
};

const transporter = createTransporter();

// Send verification email
const sendVerificationEmail = async (email, firstName, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Dayflow HRMS" <noreply@dayflow.com>',
    to: email,
    subject: 'Verify Your Email - Dayflow HRMS',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .code { background: #e5e7eb; padding: 10px 20px; border-radius: 4px; font-family: monospace; font-size: 18px; letter-spacing: 2px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Dayflow HRMS</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>Thank you for registering with Dayflow HRMS. Please verify your email address to complete your registration.</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #7c3aed;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Dayflow HRMS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Verification email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
  } else {
    // Development mode - log to console
    console.log('\n========== VERIFICATION EMAIL ==========');
    console.log(`To: ${email}`);
    console.log(`Subject: Verify Your Email - Dayflow HRMS`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log('==========================================\n');
    return { success: true, dev: true, verificationUrl };
  }
};

// Generate verification token
const generateVerificationToken = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  sendVerificationEmail,
  generateVerificationToken
};
