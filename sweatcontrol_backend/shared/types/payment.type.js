@'
/**
 * Payment Service Type Definitions
 * Shared types used across multiple services
 */

// Payment Gateway Enum
const PaymentGateway = {
  STRIPE: 'stripe',
  EASYPAISA: 'easypaisa',
  JAZZCASH: 'jazzcash'
};

// Payment Status Enum
const PaymentStatus = {
  INITIATED: 'initiated',
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CHARGEBACK: 'chargeback'
};

// Transaction Schema
class Transaction {
  constructor(data) {
    this.id = data.id;
    this.order_id = data.order_id;
    this.gateway = data.gateway;
    this.amount = data.amount;
    this.currency = data.currency || 'PKR';
    this.status = data.status || PaymentStatus.INITIATED;
    this.transaction_reference = data.transaction_reference;
    this.idempotency_key = data.idempotency_key;
    this.created_at = data.created_at;
  }

  isSuccessful() {
    return this.status === PaymentStatus.SUCCESS;
  }

  isFailed() {
    return this.status === PaymentStatus.FAILED;
  }

  canRefund() {
    return this.isSuccessful() && this.status !== PaymentStatus.REFUNDED;
  }
}

// Payment Request Schema
class PaymentRequest {
  constructor(data) {
    this.order_id = data.order_id;
    this.gateway = data.gateway;
    this.amount = data.amount;
    this.currency = data.currency || 'PKR';
    this.idempotency_key = data.idempotency_key;
    this.customer = data.customer;
    this.return_url = data.return_url;
    this.webhook_url = data.webhook_url;
  }

  validate() {
    if (!this.order_id) throw new Error('order_id is required');
    if (!this.gateway) throw new Error('gateway is required');
    if (!this.amount || this.amount <= 0) throw new Error('amount must be positive');
    if (!this.idempotency_key) throw new Error('idempotency_key is required');
    return true;
  }
}

// Webhook Payload Schema
class WebhookPayload {
  constructor(gateway, rawPayload) {
    this.gateway = gateway;
    this.raw = rawPayload;
    this.processed = this.process(gateway, rawPayload);
  }

  process(gateway, payload) {
    switch (gateway) {
      case PaymentGateway.STRIPE:
        return {
          event_type: payload.type,
          payment_intent_id: payload.data?.object?.id,
          status: payload.type === 'payment_intent.succeeded' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
          amount: payload.data?.object?.amount / 100,
          currency: payload.data?.object?.currency,
          order_id: payload.data?.object?.metadata?.orderId
        };
      case PaymentGateway.EASYPAISA:
        return {
          event_type: payload.event,
          transaction_id: payload.transaction_id,
          status: payload.status === 'completed' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
          amount: payload.amount,
          order_id: payload.order_id
        };
      case PaymentGateway.JAZZCASH:
        return {
          event_type: payload.pp_ResponseCode === '000' ? 'payment.succeeded' : 'payment.failed',
          transaction_id: payload.pp_TxnRefNo,
          status: payload.pp_ResponseCode === '000' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
          amount: payload.pp_Amount,
          order_id: payload.order_id
        };
      default:
        return payload;
    }
  }
}

module.exports = {
  PaymentGateway,
  PaymentStatus,
  Transaction,
  PaymentRequest,
  WebhookPayload
};
'@ | Out-File -FilePath types\payment.types.js -Encoding utf8