
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter = null;

async function connectEmail() {
  if (!process.env.ENABLE_EMAIL || process.env.ENABLE_EMAIL !== 'true') {
    logger.info('📧 Email notifications disabled');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection
    await transporter.verify();
    logger.info('✅ Email service connected');
    return transporter;

  } catch (error) {
    logger.error('❌ Email connection failed:', error.message);
    return null;
  }
}

async function sendEmail(to, subject, html, text = null) {
  if (!transporter) {
    logger.warn('Email not configured, skipping send');
    return false;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@sweatcontrol.com',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '')
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`📧 Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    logger.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
}

function getTransporter() {
  return transporter;
}

module.exports = { connectEmail, sendEmail, getTransporter };
