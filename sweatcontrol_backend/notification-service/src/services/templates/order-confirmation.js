@'
function generateOrderConfirmationEmail(order) {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name || `Product #${item.product_id}`}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">PKR ${item.price_at_purchase || item.price}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">PKR ${(item.quantity * (item.price_at_purchase || item.price)).toFixed(2)}</td>
    </tr>
  `).join('');

  return {
    subject: `Order Confirmation #${order.id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px; background: #4CAF50; color: white; border-radius: 5px;">
            <h1>Order Confirmed! 🎉</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Dear ${order.customer?.first_name || 'Customer'},</p>
            <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> #${order.id}</p>
              <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
              <p><strong>Status:</strong> ${order.status}</p>
            </div>
            
            <h3>Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr><th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right; border-top: 2px solid #ddd;"><strong>Total:</strong></td>
                  <td style="padding: 10px; text-align: right; border-top: 2px solid #ddd;"><strong>PKR ${order.final_amount}</strong></td>
                </tr>
              </tfoot>
            </table>
            
            <div style="margin-top: 20px;">
              <h3>Shipping Address</h3>
              <p>
                ${order.customer?.address_line1}<br>
                ${order.customer?.city}, ${order.customer?.country}<br>
                ${order.customer?.zip_code}<br>
                Phone: ${order.customer?.phone_number}
              </p>
            </div>
            
            <p>You can track your order status using your order ID and phone number on our website.</p>
            <p>If you have any questions, please contact our support team.</p>
            
            <p style="margin-top: 30px;">Thank you for choosing SweatControl!</p>
            <p>Best regards,<br>SweatControl Team</p>
          </div>
        </div>
      </body>
      </html>
    `,
    sms: `Order #${order.id} confirmed! Total: PKR ${order.final_amount}. Track your order at sweatcontrol.com/track/${order.id}. Thank you!`
  };
}

function generateOrderConfirmationSMS(order) {
  return `Order #${order.id} confirmed! Total: PKR ${order.final_amount}. Track at sweatcontrol.com/track/${order.id}. Thank you!`;
}

module.exports = { generateOrderConfirmationEmail, generateOrderConfirmationSMS };
'@ | Out-File -FilePath src\services\templates\order-confirmation.js -Encoding utf8