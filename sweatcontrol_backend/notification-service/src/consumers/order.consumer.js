
const { consumeEvents } = require('../config/kafka');
const emailService = require('../services/email.service');
const smsService = require('../services/sms.service');
const logger = require('../utils/logger');

class OrderConsumer {
  async start() {
    await consumeEvents(['order.created', 'order.shipped', 'order.delivered'], async (topic, message) => {
      logger.info(`Processing order event: ${topic}`, { orderId: message.orderId });
      
      const { orderId, customer, order } = message;
      
      if (topic === 'order.created') {
        // Send order confirmation
        await emailService.sendOrderConfirmation(order || { id: orderId }, customer);
        await smsService.sendOrderConfirmation(order || { id: orderId }, customer);
        logger.info(`✅ Order confirmation sent for ${orderId}`);
      }
      else if (topic === 'order.shipped') {
        // Send shipping notification
        await emailService.sendOrderShipped(order || { id: orderId }, customer, message.trackingNumber);
        await smsService.sendOrderShipped(order || { id: orderId }, customer, message.trackingNumber);
        logger.info(`✅ Shipping notification sent for ${orderId}`);
      }
      else if (topic === 'order.delivered') {
        // Send delivery confirmation
        await emailService.sendOrderDelivered(order || { id: orderId }, customer);
        await smsService.sendOrderDelivered(order || { id: orderId }, customer);
        logger.info(`✅ Delivery confirmation sent for ${orderId}`);
      }
    });
    
    logger.info('🎧 Order consumer started - listening for order events');
  }
}

module.exports = new OrderConsumer();
