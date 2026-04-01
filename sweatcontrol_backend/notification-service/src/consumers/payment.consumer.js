@'
const { consumeEvents } = require('../config/kafka');
const emailService = require('../services/email.service');
const smsService = require('../services/sms.service');
const logger = require('../utils/logger');

class PaymentConsumer {
  async start() {
    await consumeEvents(['payment.completed'], async (topic, message) => {
      logger.info(`Processing payment event: ${topic}`, { orderId: message.orderId });
      
      const { orderId, transactionId, gateway, amount, customer, order } = message;
      
      if (topic === 'payment.completed') {
        const payment = {
          id: transactionId,
          transaction_reference: transactionId,
          gateway,
          amount,
          status: 'success',
          created_at: new Date().toISOString()
        };
        
        // Send payment receipt
        await emailService.sendPaymentReceipt(payment, order || { id: orderId }, customer);
        await smsService.sendPaymentReceipt(payment, order || { id: orderId }, customer);
        
        logger.info(`✅ Payment receipt sent for order ${orderId}`);
      }
    });
    
    logger.info('🎧 Payment consumer started - listening for payment events');
  }
}

module.exports = new PaymentConsumer();
'@ | Out-File -FilePath src\consumers\payment.consumer.js -Encoding utf8