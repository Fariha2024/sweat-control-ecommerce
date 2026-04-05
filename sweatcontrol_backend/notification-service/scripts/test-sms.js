

/**
 * Test SMS Script
 * Usage: node scripts/test-sms.js +923001234567
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { sendSMS } = require('../src/config/sms');

async function testSMS() {
  const recipient = process.argv[2];
  
  if (!recipient) {
    console.error('❌ Please provide a recipient phone number');
    console.log('Usage: node scripts/test-sms.js +923001234567');
    process.exit(1);
  }
  
  console.log(`💬 Sending test SMS to ${recipient}...`);
  
  const result = await sendSMS(
    recipient,
    `SweatControl Test SMS\n\nThis is a test message from SweatControl Notification Service.\nTimestamp: ${new Date().toISOString()}`
  );
  
  if (result.success) {
    console.log(`✅ Test SMS sent successfully!`);
    console.log(`📨 Message SID: ${result.messageId}`);
  } else {
    console.error(`❌ Failed to send SMS: ${result.error}`);
    process.exit(1);
  }
}

testSMS().catch(console.error);
