@'
const express = require('express');
const router = express.Router();
const paymentService = require('../services/payment.service');
const logger = require('../utils/logger');

// Webhook endpoints for each gateway
router.post('/stripe', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const result = await paymentService.handleWebhook('stripe', JSON.stringify(req.body), signature);
    res.json({ received: true, result });
  } catch (error) {
    logger.error('Stripe webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/easypaisa', async (req, res) => {
  try {
    const result = await paymentService.handleWebhook('easypaisa', JSON.stringify(req.body));
    res.json({ received: true, result });
  } catch (error) {
    logger.error('EasyPaisa webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/jazzcash', async (req, res) => {
  try {
    const result = await paymentService.handleWebhook('jazzcash', JSON.stringify(req.body));
    res.json({ received: true, result });
  } catch (error) {
    logger