@'
const express = require('express');
const router = express.Router();
const webhookService = require('../services/webhook.service');
const logger = require('../utils/logger');

// Stripe webhook endpoint
router.post('/stripe', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const result = await webhookService.processWebhook('stripe', req.body, signature);
    res.json({ received: true, result });
  } catch (error) {
    logger.error('Stripe webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// EasyPaisa webhook endpoint
router.post('/easypaisa', async (req, res) => {
  try {
    const result = await webhookService.processWebhook('easypaisa', req.body);
    res.json({ received: true, result });
  } catch (error) {
    logger.error('EasyPaisa webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// JazzCash webhook endpoint
router.post('/jazzcash', async (req, res) => {
  try {
    const result = await webhookService.processWebhook('jazzcash', req.body);
    res.json({ received: true, result });
  } catch (error) {
    logger.error('JazzCash webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Generic webhook for testing
router.post('/test', async (req, res) => {
  try {
    logger.info('Test webhook received:', req.body);
    res.json({ received: true, body: req.body });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
'@ | Out-File -FilePath src\routes\webhook.routes.js -Encoding utf8