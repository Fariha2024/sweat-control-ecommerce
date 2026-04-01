@'
const paymentService = require('../services/payment.service');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

class PaymentController {
  async initiatePayment(req, res, next) {
    try {
      const { orderId, gateway, idempotencyKey, paymentDetails } = req.body;
      
      if (!orderId || !gateway || !idempotencyKey) {
        return error(res, 'orderId, gateway, and idempotencyKey are required', 400);
      }
      
      const result = await paymentService.initiatePayment(orderId, gateway, idempotencyKey, paymentDetails);
      
      logger.info(`Payment initiated: order ${orderId}, gateway ${gateway}`);
      return success(res, result, 'Payment initiated successfully');
      
    } catch (err) {
      next(err);
    }
  }
  
  async getPaymentStatus(req, res, next) {
    try {
      const { transactionId } = req.params;
      const status = await paymentService.getPaymentStatus(parseInt(transactionId));
      return success(res, status, 'Payment status retrieved');
    } catch (err) {
      next(err);
    }
  }
  
  async refundPayment(req, res, next) {
    try {
      const { transactionId } = req.params;
      const { amount } = req.body;
      const result = await paymentService.refundPayment(parseInt(transactionId), amount);
      return success(res, result, 'Payment refunded successfully');
    } catch (err) {
      next(err);
    }
  }
  
  async getOrderPayments(req, res, next) {
    try {
      const { orderId } = req.params;
      const Transaction = require('../models/Transaction');
      const transactions = await Transaction.findByOrderId(orderId);
      return success(res, transactions, 'Order payments retrieved');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PaymentController();
'@ | Out-File -FilePath src\controllers\payment.controller.js -Encoding utf8