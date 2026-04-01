@'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const inventoryRoutes = require('./routes/inventory.routes');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
});
app.use('/api/', limiter);

// Request logging
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'inventory-service', timestamp: new Date().toISOString() });
});

// Ready check
app.get('/ready', (req, res) => {
  const { getPool } = require('./config/db');
  const pool = getPool();
  pool ? res.json({ status: 'ready' }) : res.status(503).json({ status: 'not ready' });
});

// API routes
app.use('/api/inventory', inventoryRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use(errorHandler);

module.exports = app;
'@ | Out-File -FilePath src\app.js -Encoding utf8