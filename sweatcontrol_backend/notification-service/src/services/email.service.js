@'
const { sendEmail } = require('../config/email');
const { generateOrderConfirmationEmail } = require('./templates/order-confirmation');
const { generatePaymentReceiptEmail } = require('./templates/payment-receipt');
const logger = require('../utils/logger');

class EmailService {
  async sendOrderConfirmation(order, customer) {
    if (!process.env.ENABLE_EMAIL || process.env.ENABLE_EMAIL !== 'true') {
      logger.info('Email disabled, skipping order confirmation');
      return false;
    }

    if (!customer?.email) {
      logger.warn('No email address for order confirmation');
      return false;
    }

    const emailData = generateOrderConfirmationEmail({
      ...order,
      customer
    });

    const result = await sendEmail(
      customer.email,
      emailData.subject,
      emailData.html
    );

    if (result.success) {
      logger.info(`Order confirmation email sent to ${customer.email}`);
    }

    return result;
  }

  async sendPaymentReceipt(payment, order, customer) {
    if (!process.env.ENABLE_EMAIL || process.env.ENABLE_EMAIL !== 'true') {
      logger.info('Email disabled, skipping payment receipt');
      return false;
    }

    if (!customer?.email) {
      logger.warn('No email address for payment receipt');
      return false;
    }

    const emailData = generatePaymentReceiptEmail(payment, {
      ...order,
      customer
    });

    const result = await sendEmail(
      customer.email,
      emailData.subject,
      emailData.html
    );

    if (result.success) {
      logger.info(`Payment receipt email sent to ${customer.email}`);
    }

    return result;
  }

  async sendOrderShipped(order, customer, trackingNumber) {
    if (!process.env.ENABLE_EMAIL || process.env.ENABLE_EMAIL !== 'true') return false;

    const subject = `Order #${order.id} Has Been Shipped!`;
    const html = `
      <h2>Your order has been shipped! 🚚</h2>
      <p>Order #${order.id} is on its way to you.</p>
      <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
      <p>Estimated delivery: 3-5 business days.</p>
    `;

    return await sendEmail(customer.email, subject, html);
  }

  async sendOrderDelivered(order, customer) {
    if (!process.env.ENABLE_EMAIL || process.env.ENABLE_EMAIL !== 'true') return false;

    const subject = `Order #${order.id} Delivered!`;
    const html = `
      <h2>Your order has been delivered! 📦</h2>
      <p>Order #${order.id} has been delivered.</p>
      <p>Thank you for shopping with SweatControl!</p>
    `;

    return await sendEmail(customer.email, subject, html);
  }
}

module.exports = new EmailService();
'@ | Out-File -FilePath src\services\email.service.js -Encoding utf8