@'
#!/usr/bin/env node

/**
 * Health Check Script for Docker/Kubernetes
 * Returns exit code 0 if service is healthy
 */

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3006,
  path: '/health',
  method: 'GET',
  timeout: 3000
};

const request = http.request(options, (response) => {
  let data = '';
  
  response.on('data', (chunk) => {
    data += chunk;
  });
  
  response.on('end', () => {
    if (response.statusCode === 200) {
      try {
        const healthData = JSON.parse(data);
        if (healthData.status === 'healthy') {
          console.log('✅ Notification Service healthy');
          process.exit(0);
        } else {
          console.error('❌ Service unhealthy');
          process.exit(1);
        }
      } catch (err) {
        console.error('❌ Invalid health response');
        process.exit(1);
      }
    } else {
      console.error(`❌ Health check failed: HTTP ${response.statusCode}`);
      process.exit(1);
    }
  });
});

request.on('error', (err) => {
  console.error(`❌ Health check failed: ${err.message}`);
  process.exit(1);
});

request.on('timeout', () => {
  console.error('❌ Health check timeout');
  request.destroy();
  process.exit(1);
});

request.end();
'@ | Out-File -FilePath scripts\health-check.js -Encoding utf8