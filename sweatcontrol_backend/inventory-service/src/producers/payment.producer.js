
const { sendEvent } = require('../config/kafka');
const logger = require('../utils/logger');

class PaymentProducer {
  async paymentInitiated(orderId, transactionId, gateway, amount) {
    await sendEvent('payment.initiated', {
      type: 'PAYMENT_INITIATED',
      orderId,
      transactionId,
      gateway,
      amount,
      status: 'pending',
      timestamp: new Date().toISOString()
    });
    logger.info(`📤 Payment initiated event sent: ${orderId}`);
  }
  
  async paymentCompleted(orderId, transactionId, gateway, amount, paymentIntentId) {
    await sendEvent('payment.completed', {
      type: 'PAYMENT_COMPLETED',
      orderId,
      transactionId,
      gateway,
      amount,
      paymentIntentId,
      timestamp: new Date().toISOString()
    });
    logger.info(`📤 Payment completed event sent: ${orderId}`);
  }
  
  async paymentFailed(orderId, transactionId, gateway, reason) {
    await sendEvent('payment.failed', {
      type: 'PAYMENT_FAILED',
      orderId,
      transactionId,
      gateway,
      reason,
      timestamp: new Date().toISOString()
    });
    logger.warn(`📤 Payment failed event sent: ${orderId} - ${reason}`);
  }
  
  async paymentRefunded(orderId, transactionId, refundId, amount) {
    await sendEvent('payment.refunded', {
      type: 'PAYMENT_REFUNDED',
      orderId,
      transactionId,
      refundId,
      amount,
      timestamp: new Date().toISOString()
    });
    logger.info(`📤 Payment refunded event sent: ${orderId}`);
  }
  
  async paymentExpired(orderId, transactionId) {
    await sendEvent('payment.expired', {
      type: 'PAYMENT_EXPIRED',
      orderId,
      transactionId,
      timestamp: new Date().toISOString()
    });
    logger.info(`📤 Payment expired event sent: ${orderId}`);
  }
}

module.exports = new PaymentProducer();
