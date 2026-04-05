
const Transaction = require('../models/Transaction');
const { sendEvent } = require('../config/kafka');
const orderClient = require('./order.client');
const logger = require('../utils/logger');

class WebhookService {
  async processWebhook(gateway, payload, signature = null) {
    const webhookData = typeof payload === 'object' ? payload : JSON.parse(payload);
    
    logger.info(`Processing webhook from ${gateway}`, { event: webhookData.type });
    
    let paymentIntentId, orderId, status, amount, errorMessage;
    
    // Extract data based on gateway
    switch (gateway) {
      case 'stripe':
        paymentIntentId = webhookData.data?.object?.id;
        orderId = webhookData.data?.object?.metadata?.orderId;
        status = webhookData.type === 'payment_intent.succeeded' ? 'success' : 'failed';
        amount = webhookData.data?.object?.amount / 100;
        errorMessage = webhookData.data?.object?.last_payment_error?.message;
        break;
      case 'easypaisa':
        paymentIntentId = webhookData.transaction_id;
        orderId = webhookData.order_id;
        status = webhookData.status === 'completed' ? 'success' : 'failed';
        amount = webhookData.amount;
        errorMessage = webhookData.message;
        break;
      case 'jazzcash':
        paymentIntentId = webhookData.pp_TxnRefNo;
        orderId = webhookData.order_id;
        status = webhookData.pp_ResponseCode === '000' ? 'success' : 'failed';
        amount = webhookData.pp_Amount;
        errorMessage = webhookData.pp_ResponseMessage;
        break;
      default:
        throw new Error(`Unknown gateway: ${gateway}`);
    }
    
    // Find transaction
    let transaction = null;
    const transactions = await Transaction.findByOrderId(orderId);
    transaction = transactions.find(t => t.transaction_reference === paymentIntentId);
    
    if (!transaction) {
      logger.warn(`No transaction found for webhook`, { gateway, orderId, paymentIntentId });
      return { success: false, message: 'Transaction not found' };
    }
    
    // Update transaction
    const newStatus = status === 'success' ? 'success' : 'failed';
    await Transaction.updateStatus(transaction.id, newStatus, paymentIntentId, webhookData);
    
    if (newStatus === 'success') {
      await orderClient.updateOrderPaymentStatus(orderId, 'paid', paymentIntentId);
      
      await sendEvent('payment.completed', {
        type: 'PAYMENT_COMPLETED',
        orderId,
        transactionId: transaction.id,
        paymentIntentId,
        gateway,
        amount
      });
      
      logger.info(`✅ Payment successful for order ${orderId}`);
    } else {
      await sendEvent('payment.failed', {
        type: 'PAYMENT_FAILED',
        orderId,
        transactionId: transaction.id,
        gateway,
        reason: errorMessage || 'Payment failed'
      });
      
      logger.warn(`❌ Payment failed for order ${orderId}`);
    }
    
    return { success: true, status: newStatus };
  }
}

module.exports = new WebhookService();
