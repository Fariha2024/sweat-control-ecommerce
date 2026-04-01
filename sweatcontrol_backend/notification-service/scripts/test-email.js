@'
#!/usr/bin/env node

/**
 * Test Email Script
 * Usage: node scripts/test-email.js recipient@example.com
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { sendEmail } = require('../src/config/email');

async function testEmail() {
  const recipient = process.argv[2];
  
  if (!recipient) {
    console.error('❌ Please provide a recipient email address');
    console.log('Usage: node scripts/test-email.js recipient@example.com');
    process.exit(1);
  }
  
  console.log(`📧 Sending test email to ${recipient}...`);
  
  const result = await sendEmail(
    recipient,
    'SweatControl Notification Service Test',
    `
    <h1>Test Email</h1>
    <p>This is a test email from SweatControl Notification Service.</p>
    <p>If you're receiving this, your email configuration is working correctly!</p>
    <hr>
    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
    <p><strong>Service:</strong> Notification Service v1.0</p>
    `
  );
  
  if (result.success) {
    console.log(`✅ Test email sent successfully!`);
    console.log(`📨 Message ID: ${result.messageId}`);
  } else {
    console.error(`❌ Failed to send email: ${result.error}`);
    process.exit(1);
  }
}

testEmail().catch(console.error);
'@ | Out-File -FilePath scripts\test-email.js -Encoding utf8