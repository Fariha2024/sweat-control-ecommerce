
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

const initiatePaymentSchema = Joi.object({
  orderId: Joi.number().integer().positive().required(),
  gateway: Joi.string().valid('stripe', 'easypaisa', 'jazzcash').required(),
  idempotencyKey: Joi.string().uuid().required(),
  paymentDetails: Joi.object().optional()
});

const refundPaymentSchema = Joi.object({
  amount: Joi.number().positive().optional()
});

router.post('/initiate', validate(initiatePaymentSchema), paymentController.initiatePayment);
router.get('/status/:transactionId', paymentController.getPaymentStatus);
router.post('/refund/:transactionId', validate(refundPaymentSchema), paymentController.refundPayment);
router.get('/order/:orderId', paymentController.getOrderPayments);

module.exports = router;
