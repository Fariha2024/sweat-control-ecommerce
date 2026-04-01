@'
const orderService = require('../../services/order.service');
const { Order } = require('../../models/Order');

jest.mock('../../models/Order');
jest.mock('../../services/cart.client');
jest.mock('../../services/inventory.client');

describe('Order Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const mockCart = {
        items: [{ product_id: 1, quantity: 2, price_snapshot: 1499 }],
        total: 2998
      };
      
      const mockCustomer = { id: 1, email: 'test@example.com' };
      const mockOrderId = 123;
      
      require('../../services/cart.client').getCart.mockResolvedValue(mockCart);
      require('../../services/inventory.client').checkStock.mockResolvedValue({ available: true });
      require('../../models/Customer').findOrCreate.mockResolvedValue(mockCustomer);
      Order.create.mockResolvedValue(mockOrderId);
      require('../../services/inventory.client').reserveStock.mockResolvedValue({ success: true });
      
      const result = await orderService.createOrder('test-token', { email: 'test@example.com', phone_number: '1234567890' });
      
      expect(result.orderId).toBe(mockOrderId);
      expect(result.status).toBe('pending');
    });
  });
});
'@ | Out-File -FilePath tests\unit\order.service.test.js -Encoding utf8