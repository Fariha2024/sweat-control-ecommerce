@'
const { consumeEvents } = require('../config/kafka');
const inventoryService = require('../services/inventory.service');
const logger = require('../utils/logger');

class OrderConsumer {
  async start() {
    await consumeEvents(['order.created', 'order.cancelled', 'order.paid'], async (topic, message) => {
      logger.info(`Processing order event: ${topic}`, { orderId: message.orderId });
      
      if (topic === 'order.created') {
        // Reserve inventory when order is created
        await inventoryService.reserveStock(message.orderId, message.items);
        logger.info(`✅ Inventory reserved for order ${message.orderId}`);
      } 
      else if (topic === 'order.cancelled') {
        // Release inventory when order is cancelled
        await inventoryService.releaseReservation(message.orderId);
        logger.info(`✅ Inventory released for cancelled order ${message.orderId}`);
      }
      else if (topic === 'order.paid') {
        // Confirm inventory when order is paid
        await inventoryService.confirmReservation(message.orderId);
        logger.info(`✅ Inventory confirmed for paid order ${message.orderId}`);
      }
    });
    
    logger.info('🎧 Order consumer started - listening for order events');
  }
}

module.exports = new OrderConsumer();
'@ | Out-File -FilePath src\consumers\order.consumer.js -Encoding utf8