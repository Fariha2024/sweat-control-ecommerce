/**
 * Health check script for Docker/Kubernetes
 * Returns exit code 0 if service is healthy, 1 if unhealthy
 */

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/health',
  method: 'GET',
  timeout: 3000, // 3 second timeout
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
          console.log('✅ Health check passed');
          process.exit(0);
        } else {
          console.error('❌ Health check failed: service unhealthy');
          process.exit(1);
        }
      } catch (err) {
        console.error('❌ Health check failed: invalid response', err.message);
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
  console.error('❌ Health check failed: timeout');
  request.destroy();
  process.exit(1);
});

request.end();