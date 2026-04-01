@'
/**
 * Order Service Type Definitions
 * Shared types used across multiple services
 */

// Order Status Enum
const OrderStatus = {
  PENDING: 'pending',
  PAYMENT_PROCESSING: 'payment_processing',
  PAID: 'paid',
  CONFIRMED: 'confirmed',
  PACKED: 'packed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// Order Item Schema
class OrderItem {
  constructor(data) {
    this.product_id = data.product_id;
    this.product_name = data.product_name;
    this.quantity = data.quantity;
    this.price = data.price;
    this.total = data.quantity * data.price;
  }
}

// Order Schema
class Order {
  constructor(data) {
    this.id = data.id;
    this.customer_id = data.customer_id;
    this.guest_token = data.guest_token;
    this.status = data.status || OrderStatus.PENDING;
    this.total_amount = data.total_amount;
    this.discount_amount = data.discount_amount || 0;
    this.final_amount = data.final_amount;
    this.payment_method = data.payment_method;
    this.payment_status = data.payment_status || 'unpaid';
    this.transaction_id = data.transaction_id;
    this.items = data.items || [];
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  isPaid() {
    return this.payment_status === 'paid';
  }

  isCompleted() {
    return this.status === OrderStatus.DELIVERED;
  }

  canCancel() {
    return [OrderStatus.PENDING, OrderStatus.PAYMENT_PROCESSING, OrderStatus.PAID].includes(this.status);
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  }
}

// Customer Schema
class Customer {
  constructor(data) {
    this.id = data.id;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.country_code = data.country_code;
    this.phone_number = data.phone_number;
    this.email = data.email;
    this.address_line1 = data.address_line1;
    this.address_line2 = data.address_line2;
    this.city = data.city;
    this.country = data.country;
    this.zip_code = data.zip_code;
  }

  getFullName() {
    return `${this.first_name} ${this.last_name}`.trim();
  }

  getFullPhone() {
    return `${this.country_code}${this.phone_number}`;
  }
}

module.exports = {
  OrderStatus,
  OrderItem,
  Order,
  Customer
};
'@ | Out-File -FilePath types\order.types.js -Encoding utf8