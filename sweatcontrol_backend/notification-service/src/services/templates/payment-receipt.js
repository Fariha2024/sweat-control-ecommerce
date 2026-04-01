@'
function generatePaymentReceiptEmail(payment, order) {
  return {
    subject: `Payment Receipt - Order #${order.id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Receipt</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px; background: #2196F3; color: white; border-radius: 5px;">
            <h1>Payment Receipt</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Dear ${order.customer?.first_name || 'Customer'},</p>
            <p>Thank you for your payment! Your payment has been successfully processed.</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Payment Details</h3>
              <p><strong>Order ID:</strong> #${order.id}</p>
              <p><strong>Transaction ID:</strong> ${payment.transaction_reference || payment.id}</p>
              <p><strong>Payment Method:</strong> ${payment.gateway?.toUpperCase()}</p>
              <p><strong>Amount Paid:</strong> PKR ${payment.amount}</p>
              <p><strong>Payment Date:</strong> ${new Date(payment.created_at).toLocaleString()}</p>
              <p><strong>Status:</strong> ${payment.status}</p>
            </div>
            
            <p>You can view your order details and tracking information on our website.</p>
            <p>If you have any questions, please contact our support team.</p>
            
            <p style="margin-top: 30px;">Thank you for shopping with SweatControl!</p>
            <p>Best regards,<br>SweatControl Team</p>
          </div>
        </div>
      </body>
      </html>
    `,
    sms: `Payment received for order #${order.id}: PKR ${payment.amount}. Transaction ID: ${payment.transaction_reference}. Thank you!`
  };
}

function generatePaymentReceiptSMS(payment, order) {
  return `Payment received for order #${order.id}: PKR ${payment.amount}. Transaction ID: ${payment.transaction_reference}. Thank you for shopping with SweatControl!`;
}

module.exports = { generatePaymentReceiptEmail, generatePaymentReceiptSMS };
'@ | Out-File -FilePath src\services\templates\payment-receipt.js -Encoding utf8