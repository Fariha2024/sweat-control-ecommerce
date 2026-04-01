@'
const Transaction = require('../models/Transaction');
const IdempotencyKey = require('../models/IdempotencyKey');
const orderClient = require('./order.client');
const { sendEvent } = require('../config/kafka');
const stripeGateway = require('../config/gateways/stripe');
const easypaisaGateway = require('../config/gateways/easypaisa');
const jazzcashGateway = require('../config/gateways/jazzcash');
const { ValidationError, NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

class PaymentService {
  getGateway(gatewayName) {
    const gateways = {
      stripe: stripeGateway,
      easypaisa: easypaisaGateway,
      jazzcash: jazzcashGateway
    };
    
    if (!gateways[gatewayName]) {
      throw new ValidationError(`Unsupported gateway: ${gatewayName}`);
    }
    
    return gateways[gatewayName];
  }

  async initiatePayment(orderId, gatewayName, idempotencyKey, paymentDetails) {
    // Check idempotency
    const existing = await IdempotencyKey.findByKey(idempotencyKey);
    if (existing) {
      logger.info(`Duplicate payment attempt detected for key ${idempotencyKey}`);
      return { success: false, message: 'Duplicate payment request', existing: true };
    }
    
    // Get order details
    const order = await orderClient.getOrder(orderId);
    if (!order) {
      throw new NotFoundError(`Order ${orderId} not found`);
    }
    
    // Check if order already has payment
    const existingTransactions = await Transaction.findByOrderId(orderId);
    const successfulPayment = existingTransactions.find(t => t.status === 'success');
    if (successfulPayment) {
      throw new ValidationError('Order already has a successful payment');
    }
    
    const gateway = this.getGateway(gatewayName);
    
    // Create transaction record
    const transactionId = await Transaction.create({
      order_id: orderId,
      gateway: gatewayName,
      amount: order.final_amount || order.total_amount,
      currency: 'PKR',
      status: 'initiated',
      idempotency_key: idempotencyKey
    });
    
    // Store idempotency key
    await IdempotencyKey.create(idempotencyKey, orderId, gatewayName);
    
    // Process with gateway
    const paymentResult = await gateway.createPaymentIntent(
      order.final_amount || order.total_amount,
      'PKR',
      orderId,
      idempotencyKey
    );
    
    if (!paymentResult.success) {
      await Transaction.updateStatus(transactionId, 'failed', null, { error: paymentResult.error });
      throw new Error(paymentResult.error);
    }
    
    // Update transaction with gateway response
    await Transaction.updateStatus(
      transactionId,
      'pending',
      paymentResult.paymentIntentId,
      paymentResult
    );
    
    return {
      success: true,
      transactionId,
      paymentIntentId: paymentResult.paymentIntentId,
      clientSecret: paymentResult.clientSecret,
      gateway: gatewayName,
      status: 'pending'
    };
  }
  
  async handleWebhook(gatewayName, payload, signature = null) {
    const gateway = this.getGateway(gatewayName);
    
    // Verify webhook signature
    if (!gateway.verifyWebhook(payload, signature)) {
      throw new ValidationError('Invalid webhook signature');
    }
    
    const webhookData = JSON.parse(payload);
    const paymentIntentId = webhookData.payment_intent || webhookData.transaction_id;
    
    // Find transaction
    const transactions = await Transaction.findByOrderId(webhookData.order_id);
    const transaction = transactions.find(t => t.transaction_reference === paymentIntentId);
    
    if (!transaction) {
      logger.warn(`Transaction not found for payment intent: ${paymentIntentId}`);
      return { success: false, message: 'Transaction not found' };
    }
    
    const status = webhookData.status === 'succeeded' ? 'success' : 'failed';
    
    await Transaction.updateStatus(transaction.id, status, paymentIntentId, webhookData);
    
    if (status === 'success') {
      // Update order status
      await orderClient.updateOrderPaymentStatus(webhookData.order_id, 'paid', paymentIntentId);
      
      // Send payment success event
      await sendEvent('payment.completed', {
        type: 'PAYMENT_COMPLETED',
        orderId: webhookData.order_id,
        transactionId: transaction.id,
        paymentIntentId,
        gateway: gatewayName,
        amount: webhookData.amount
      });
      
      logger.info(`✅ Payment successful for order ${webhookData.order_id}`);
    } else {
      // Send payment failure event
      await sendEvent('payment.failed', {
        type: 'PAYMENT_FAILED',
        orderId: webhookData.order_id,
        transactionId: transaction.id,
        gateway: gatewayName,
        reason: webhookData.error || 'Payment failed'
      });
      
      logger.warn(`❌ Payment failed for order ${webhookData.order_id}`);
    }
    
    return { success: true, status };
  }
  
  async getPaymentStatus(transactionId) {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw new NotFoundError(`Transaction ${transactionId} not found`);
    }
    
    return {
      transactionId: transaction.id,
      orderId: transaction.order_id,
      gateway: transaction.gateway,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      reference: transaction.transaction_reference,
      createdAt: transaction.created_at
    };
  }
  
  async refundPayment(transactionId, amount = null) {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw new NotFoundError(`Transaction ${transactionId} not found`);
    }
    
    if (transaction.status !== 'success') {
      throw new ValidationError('Only successful transactions can be refunded');
    }
    
    const gateway = this.getGateway(transaction.gateway);
    const refundResult = await gateway.refundPayment(transaction.transaction_reference, amount);
    
    if (refundResult.success) {
      await Transaction.updateStatus(transactionId, 'refunded', transaction.transaction_reference, refundResult);
      
      await sendEvent('payment.refunded', {
        type: 'PAYMENT_REFUNDED',
        orderId: transaction.order_id,
        transactionId: transaction.id,
        refundId: refundResult.refundId,
        amount: amount || transaction.amount
      });
      
      logger.info(`✅ Refund processed for transaction ${transactionId}`);
    }
    
    return refundResult;
  }
}

module.exports = new PaymentService();
'@ | Out-File -FilePath src\services\payment.service.js -Encoding utf8