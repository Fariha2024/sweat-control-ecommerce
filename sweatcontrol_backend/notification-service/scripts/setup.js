@'
/**
 * Notification Service Setup Script
 * Run: npm run setup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\x1b[36m🔧 Setting up Notification Service...\x1b[0m\n');

// Create directories
const directories = ['logs', '.template-cache'];

directories.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created: ${dir}`);
  } else {
    console.log(`⚠️ Already exists: ${dir}`);
  }
});

console.log('\n\x1b[32m✅ Setup complete!\x1b[0m\n');
console.log('\x1b[33m📧 To enable email, configure EMAIL_USER and EMAIL_PASSWORD in .env\x1b[0m');
console.log('\x1b[33m💬 To enable SMS, configure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env\x1b[0m\n');
console.log('\x1b[36m🚀 Start the service with: npm run dev\x1b[0m');
console.log('\x1b[36m📧 Test email with: npm run test:email recipient@example.com\x1b[0m');
console.log('\x1b[36m💬 Test SMS with: npm run test:sms +923001234567\x1b[0m');
'@ | Out-File -FilePath scripts\setup.js -Encoding utf8