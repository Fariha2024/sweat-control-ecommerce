@'
const express = require('express');
const router = express.Router();
const emailService = require('../services/email.service');
const smsService = require('../services/sms.service');
const { authenticateService } = require('../middleware/auth');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

// Test endpoints (admin only)
router.post('/test/email', authenticateService, async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    if (!to || !subject || !message) {
      return error(res, 'to, subject, and message are required', 400);
    }
    
    const result = await emailService.sendTestEmail(to, subject, message);
    return success(res, result, 'Test email sent');
  } catch (err) {
    logger.error('Test email error:', err);
    error(res, err.message);
  }
});

router.post('/test/sms', authenticateService, async (req, res) => {
  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return error(res, 'to and message are required', 400);
    }
    
    const result = await smsService.sendTestSMS(to, message);
    return success(res, result, 'Test SMS sent');
  } catch (err) {
    logger.error('Test SMS error:', err);
    error(res, err.message);
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    services: {
      email: process.env.ENABLE_EMAIL === 'true',
      sms: process.env.ENABLE_SMS === 'true'
    }
  });
});

module.exports = router;
'@ | Out-File -FilePath src\routes\notification.routes.js -Encoding utf8