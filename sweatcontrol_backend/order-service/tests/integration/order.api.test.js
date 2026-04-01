@'
const request = require('supertest');
const app = require('../../src/app');

describe('Order API Integration Tests', () => {
  describe('POST /api/orders', () => {
    it('should return 400 when guestToken is missing', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({ customer: {} });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
    
    it('should return 400 when customer is missing', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({ guestToken: 'test-token' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
'@ | Out-File -FilePath tests\integration\order.api.test.js -Encoding utf8n