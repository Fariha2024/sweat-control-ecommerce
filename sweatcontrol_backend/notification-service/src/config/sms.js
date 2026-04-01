@'
const twilio = require('twilio');
const logger = require('../utils/logger');

let client = null;

async function connectSMS() {
  if (!process.env.ENABLE_SMS || process.env.ENABLE_SMS !== 'true') {
    logger.info('💬 SMS notifications disabled');
    return null;
  }

  try {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    logger.info('✅ SMS service connected');
    return client;

  } catch (error) {
    logger.error('❌ SMS connection failed:', error.message);
    return null;
  }
}

async function sendSMS(to, message) {
  if (!client) {
    logger.warn('SMS not configured, skipping send');
    return false;
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    logger.info(`💬 SMS sent to ${to}: ${result.sid}`);
    return { success: true, messageId: result.sid };

  } catch (error) {
    logger.error('SMS send error:', error.message);
    return { success: false, error: error.message };
  }
}

function getClient() {
  return client;
}

module.exports = { connectSMS, sendSMS, getClient };
'@ | Out-File -FilePath src\config\sms.js -Encoding utf8