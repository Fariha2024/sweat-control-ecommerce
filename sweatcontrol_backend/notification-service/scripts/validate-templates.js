@'
#!/usr/bin/env node

/**
 * Template Validation Script
 * Validates all email and SMS templates
 */

const path = require('path');
const fs = require('fs');

console.log('🔍 Validating Notification Templates...\n');

// Load templates
const orderConfirmation = require('../src/services/templates/order-confirmation');
const paymentReceipt = require('../src/services/templates/payment-receipt');

// Mock data for testing
const mockOrder = {
  id: 12345,
  status: 'confirmed',
  final_amount: 2998.00,
  created_at: new Date().toISOString(),
  customer: {
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    phone_number: '1234567890',
    country_code: '+92',
    address_line1: '123 Test Street',
    city: 'Karachi',
    country: 'Pakistan',
    zip_code: '75000'
  },
  items: [
    {
      product_id: 1,
      product_name: 'SweatControl Gel',
      quantity: 2,
      price_at_purchase: 1499.00
    }
  ]
};

const mockPayment = {
  id: 67890,
  transaction_reference: 'txn_123456',
  gateway: 'stripe',
  amount: 2998.00,
  status: 'success',
  created_at: new Date().toISOString()
};

// Test Order Confirmation Templates
console.log('📧 Testing Order Confirmation Templates...');

try {
  const emailTemplate = orderConfirmation.generateOrderConfirmationEmail(mockOrder);
  console.log('  ✅ Order Confirmation Email generated');
  console.log(`     Subject: ${emailTemplate.subject}`);
  console.log(`     HTML Length: ${emailTemplate.html.length} chars`);
  console.log(`     SMS Length: ${emailTemplate.sms.length} chars`);
} catch (error) {
  console.error('  ❌ Order Confirmation Email failed:', error.message);
}

try {
  const smsTemplate = orderConfirmation.generateOrderConfirmationSMS(mockOrder);
  console.log('  ✅ Order Confirmation SMS generated');
  console.log(`     Message: ${smsTemplate.substring(0, 100)}...`);
} catch (error) {
  console.error('  ❌ Order Confirmation SMS failed:', error.message);
}

console.log('\n💳 Testing Payment Receipt Templates...');

try {
  const emailTemplate = paymentReceipt.generatePaymentReceiptEmail(mockPayment, mockOrder);
  console.log('  ✅ Payment Receipt Email generated');
  console.log(`     Subject: ${emailTemplate.subject}`);
  console.log(`     HTML Length: ${emailTemplate.html.length} chars`);
  console.log(`     SMS Length: ${emailTemplate.sms.length} chars`);
} catch (error) {
  console.error('  ❌ Payment Receipt Email failed:', error.message);
}

try {
  const smsTemplate = paymentReceipt.generatePaymentReceiptSMS(mockPayment, mockOrder);
  console.log('  ✅ Payment Receipt SMS generated');
  console.log(`     Message: ${smsTemplate.substring(0, 100)}...`);
} catch (error) {
  console.error('  ❌ Payment Receipt SMS failed:', error.message);
}

console.log('\n✅ Template validation complete!');
'@ | Out-File -FilePath scripts\validate-templates.js -Encoding utf8