@'
const { sendSMS } = require('../config/sms');
const { generateOrderConfirmationSMS } = require('./templates/order-confirmation');
const { generatePaymentReceiptSMS } = require('./templates/payment-receipt');
const logger = require('../utils/logger');

class SMSService {
  async sendOrderConfirmation(order, customer) {
    if (!process.env.ENABLE_SMS || process.env.ENABLE_SMS !== 'true') {
      logger.info('SMS disabled, skipping order confirmation');
      return false;
    }

    if (!customer?.phone_number) {
      logger.warn('No phone number for order confirmation');
      return false;
    }

    const message = generateOrderConfirmationSMS(order);
    const fullNumber = customer.country_code 
      ? `${customer.country_code}${customer.phone_number}`
      : customer.phone_number;

    const result = await sendSMS(fullNumber, message);

    if (result.success) {
      logger.info(`Order confirmation SMS sent to ${fullNumber}`);
    }

    return result;
  }

  async sendPaymentReceipt(payment, order, customer) {
    if (!process.env.ENABLE_SMS || process.env.ENABLE_SMS !== 'true') {
      logger.info('SMS disabled, skipping payment receipt');
      return false;
    }

    if (!customer?.phone_number) {
      logger.warn('No phone number for payment receipt');
      return false;
    }

    const message = generatePaymentReceiptSMS(payment, order);
    const fullNumber = customer.country_code 
      ? `${customer.country_code}${customer.phone_number}`
      : customer.phone_number;

    const result = await sendSMS(fullNumber, message);

    if (result.success) {
      logger.info(`Payment receipt SMS sent to ${fullNumber}`);
    }

    return result;
  }

  async sendOrderShipped(order, customer, trackingNumber) {
    if (!process.env.ENABLE_SMS || process.env.ENABLE_SMS !== 'true') return false;

    const message = `Order #${order.id} shipped! Tracking: ${trackingNumber}. Track at sweatcontrol.com/track/${order.id}`;
    const fullNumber = `${customer.country_code}${customer.phone_number}`;

    return await sendSMS(fullNumber, message);
  }

  async sendOrderDelivered(order, customer) {
    if (!process.env.ENABLE_SMS || process.env.ENABLE_SMS !== 'true') return false;

    const message = `Order #${order.id} delivered! Thank you for shopping with SweatControl!`;
    const fullNumber = `${customer.country_code}${customer.phone_number}`;

    return await sendSMS(fullNumber, message);
  }
}

module.exports = new SMSService();
'@ | Out-File -FilePath src\services\sms.service.js -Encoding utf8