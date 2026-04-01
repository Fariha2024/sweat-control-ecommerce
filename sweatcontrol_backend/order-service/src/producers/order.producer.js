@'
const { sendEvent } = require('../config/kafka');
const logger = require('../utils/logger');

class OrderProducer {
  async orderCreated(orderData) {
    await sendEvent('order.created', {
      type: 'ORDER_CREATED',
      ...orderData,
      timestamp: new Date().toISOString()
    });
    logger.info(`📤 Order created event sent: ${orderData.orderId}`);
  }
  
  async orderPaid(orderId, transactionId) {
    await sendEvent('order.paid', {
      type: 'ORDER_PAID',
      orderId,
      transactionId,
      timestamp: new Date().toISOString()
    });
    logger.info(`📤 Order paid event sent: ${orderId}`);
  }
  
  async orderCancelled(orderId, reason) {
    await sendEvent('order.cancelled', {
      type: 'ORDER_CANCELLED',
      orderId,
      reason,
      timestamp: new Date().toISOString()
    });
    logger.info(`📤 Order cancelled event sent: ${orderId}`);
  }
  
  async orderShipped(orderId, trackingNumber) {
    await sendEvent('order.shipped', {
      type: 'ORDER_SHIPPED',
      orderId,
      trackingNumber,
      timestamp: new Date().toISOString()
    });
    logger.info(`📤 Order shipped event sent: ${orderId}`);
  }
  
  async orderDelivered(orderId) {
    await sendEvent('order.delivered', {
      type: 'ORDER_DELIVERED',
      orderId,
      timestamp: new Date().toISOString()
    });
    logger.info(`📤 Order delivered event sent: ${orderId}`);
  }
  
  async orderStatusUpdated(orderId, oldStatus, newStatus, reason) {
    await sendEvent('order.status.updated', {
      type: 'ORDER_STATUS_UPDATED',
      orderId,
      oldStatus,
      newStatus,
      reason,
      timestamp: new Date().toISOString()
    });
    logger.info(`📤 Order status updated event sent: ${orderId} (${oldStatus} → ${newStatus})`);
  }
}

module.exports = new OrderProducer();
'@ | Out-File -FilePath src\producers\order.producer.js -Encoding utf8