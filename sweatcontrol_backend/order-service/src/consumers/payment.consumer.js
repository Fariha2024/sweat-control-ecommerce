
const { consumeEvents } = require('../config/kafka');
const orderService = require('../services/order.service');
const logger = require('../utils/logger');

class PaymentConsumer {
  async start() {
    await consumeEvents(['payment.completed', 'payment.failed'], async (topic, message) => {
      logger.info(`Processing payment event: ${topic}`, { orderId: message.orderId });
      
      if (topic === 'payment.completed') {
        await orderService.handlePaymentSuccess(message.orderId, message.transactionId);
        logger.info(`✅ Payment success handled for order ${message.orderId}`);
      } 
      else if (topic === 'payment.failed') {
        await orderService.handlePaymentFailure(message.orderId, message.reason);
        logger.warn(`❌ Payment failure handled for order ${message.orderId}`);
      }
    });
    
    logger.info('🎧 Payment consumer started - listening for payment.completed and payment.failed');
  }
}

module.exports = new PaymentConsumer();
