
const Transaction = require('../models/Transaction');
const { sendEvent } = require('../config/kafka');
const orderClient = require('./order.client');
const logger = require('../utils/logger');

class WebhookService {
  async processWebhook(gateway, payload, signature = null) {
    const webhookData = typeof payload === 'string' ? JSON.parse(payload) : payload;
    
    logger.info(`Processing webhook from ${gateway}`, { event: webhookData.type });
    
    // Extract common fields based on gateway
    let paymentIntentId, orderId, status, amount, errorMessage;
    
    switch (gateway) {
      case 'stripe':
        paymentIntentId = webhookData.data?.object?.id;
        orderId = webhookData.data?.object?.metadata?.orderId;
        status = webhookData.type === 'payment_intent.succeeded' ? 'success' : 
                 webhookData.type === 'payment_intent.payment_failed' ? 'failed' : 'pending';
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
    
    if (paymentIntentId) {
      const db = require('../config/db').getPool();
      const [rows] = await db.execute(
        'SELECT * FROM payment_transactions WHERE transaction_reference = ?',
        [paymentIntentId]
      );
      transaction = rows[0];
    }
    
    if (!transaction && orderId) {
      const transactions = await Transaction.findByOrderId(orderId);
      transaction = transactions.find(t => t.status === 'pending');
    }
    
    if (!transaction) {
      logger.warn(`No pending transaction found for webhook`, { gateway, orderId, paymentIntentId });
      return { success: false, message: 'Transaction not found' };
    }
    
    // Update transaction
    const newStatus = status === 'success' ? 'success' : 'failed';
    await Transaction.updateStatus(
      transaction.id,
      newStatus,
      paymentIntentId,
      { webhook: webhookData, processedAt: new Date().toISOString() }
    );
    
    if (newStatus === 'success') {
      // Update order status via order service
      await orderClient.updateOrderPaymentStatus(orderId, 'paid', paymentIntentId);
      
      // Send payment success event
      await sendEvent('payment.completed', {
        type: 'PAYMENT_COMPLETED',
        orderId: orderId,
        transactionId: transaction.id,
        paymentIntentId,
        gateway,
        amount,
        timestamp: new Date().toISOString()
      });
      
      logger.info(`✅ Webhook: Payment successful for order ${orderId}`);
    } else {
      // Send payment failure event
      await sendEvent('payment.failed', {
        type: 'PAYMENT_FAILED',
        orderId: orderId,
        transactionId: transaction.id,
        gateway,
        reason: errorMessage || 'Payment failed',
        timestamp: new Date().toISOString()
      });
      
      logger.warn(`❌ Webhook: Payment failed for order ${orderId}: ${errorMessage}`);
    }
    
    return {
      success: true,
      transactionId: transaction.id,
      orderId,
      status: newStatus,
      paymentIntentId
    };
  }
  
  async verifyWebhookSignature(gateway, payload, signature) {
    // In production, implement actual signature verification per gateway
    logger.debug(`Verifying webhook signature for ${gateway}`);
    
    switch (gateway) {
      case 'stripe':
        // Verify Stripe signature using stripe.webhooks.constructEvent
        return true;
      case 'easypaisa':
        // Verify EasyPaisa signature
        return true;
      case 'jazzcash':
        // Verify JazzCash signature
        return true;
      default:
        return false;
    }
  }
  
  async logWebhookRequest(gateway, payload, signature, ip) {
    const db = require('../config/db').getPool();
    await db.execute(
      `INSERT INTO payment_method_logs (order_id, gateway, ip_address, user_agent)
       VALUES (?, ?, ?, ?)`,
      [null, gateway, ip, JSON.stringify({ signature, payloadSize: JSON.stringify(payload).length })]
    );
  }
}

module.exports = new WebhookService();
