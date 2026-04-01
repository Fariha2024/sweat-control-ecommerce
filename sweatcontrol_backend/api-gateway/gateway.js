const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Logger setup
const logger = require('./src/utils/logger');

// ==================== Middleware ====================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true
}));

// Body parsing (for gateway-level requests)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(globalLimiter);

// ==================== Health Check ====================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ==================== Service Routes ====================

// Product Service Proxy
app.use('/api/products', createProxyMiddleware({
  target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/products': '/api/products'
  },
  onProxyReq: (proxyReq, req, res) => {
    logger.debug(`Proxying product request: ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    logger.error('Product Service Proxy Error:', err);
    res.status(503).json({ error: 'Product service unavailable' });
  }
}));

// Reviews are part of product service
app.use('/api/reviews', createProxyMiddleware({
  target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  onError: (err, req, res) => {
    logger.error('Review Service Proxy Error:', err);
    res.status(503).json({ error: 'Review service unavailable' });
  }
}));

// Cart Service Proxy
app.use('/api/cart', createProxyMiddleware({
  target: process.env.CART_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  onError: (err, req, res) => {
    logger.error('Cart Service Proxy Error:', err);
    res.status(503).json({ error: 'Cart service unavailable' });
  }
}));

// Order Service Proxy
app.use('/api/orders', createProxyMiddleware({
  target: process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  onError: (err, req, res) => {
    logger.error('Order Service Proxy Error:', err);
    res.status(503).json({ error: 'Order service unavailable' });
  }
}));

// Inventory Service Proxy
app.use('/api/inventory', createProxyMiddleware({
  target: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3004',
  changeOrigin: true,
  onError: (err, req, res) => {
    logger.error('Inventory Service Proxy Error:', err);
    res.status(503).json({ error: 'Inventory service unavailable' });
  }
}));

// Payment Service Proxy
app.use('/api/payments', createProxyMiddleware({
  target: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005',
  changeOrigin: true,
  onError: (err, req, res) => {
    logger.error('Payment Service Proxy Error:', err);
    res.status(503).json({ error: 'Payment service unavailable' });
  }
}));

// Notification Service Proxy
app.use('/api/notifications', createProxyMiddleware({
  target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006',
  changeOrigin: true,
  onError: (err, req, res) => {
    logger.error('Notification Service Proxy Error:', err);
    res.status(503).json({ error: 'Notification service unavailable' });
  }
}));

// ==================== Admin Routes ====================

// Status endpoint to check all services
app.get('/api/status', async (req, res) => {
  const services = {
    product: process.env.PRODUCT_SERVICE_URL,
    cart: process.env.CART_SERVICE_URL,
    order: process.env.ORDER_SERVICE_URL,
    inventory: process.env.INVENTORY_SERVICE_URL,
    payment: process.env.PAYMENT_SERVICE_URL,
    notification: process.env.NOTIFICATION_SERVICE_URL
  };
  
  res.json({
    gateway: 'running',
    services,
    timestamp: new Date().toISOString()
  });
});

// ==================== 404 Handler ====================

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// ==================== Error Handler ====================

app.use((err, req, res, next) => {
  logger.error('Gateway Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// ==================== Start Server ====================

app.listen(PORT, () => {
  logger.info(`🚀 API Gateway running on port ${PORT}`);
  logger.info(`📋 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  logger.info('\n📡 Proxying to services:');
  logger.info(`   Products: ${process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001'}`);
  logger.info(`   Cart: ${process.env.CART_SERVICE_URL || 'http://localhost:3002'}`);
  logger.info(`   Orders: ${process.env.ORDER_SERVICE_URL || 'http://localhost:3003'}`);
  logger.info(`   Inventory: ${process.env.INVENTORY_SERVICE_URL || 'http://localhost:3004'}`);
  logger.info(`   Payments: ${process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005'}`);
  logger.info(`   Notifications: ${process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006'}`);
});