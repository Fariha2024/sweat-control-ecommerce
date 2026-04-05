
const cron = require('node-cron');
const Stock = require('../../models/Stock');
const { invalidateStockCache } = require('../../config/redis');
const logger = require('../../utils/logger');

class SyncStockWorker {
  start() {
    const cronExpression = process.env.SYNC_STOCK_CRON || '*/5 * * * *';
    
    cron.schedule(cronExpression, async () => {
      try {
        logger.debug('Running stock sync...');
        
        const db = require('../../config/db').getPool();
        const [products] = await db.execute('SELECT product_id FROM stock');
        
        for (const product of products) {
          await invalidateStockCache(product.product_id);
        }
        
        logger.info(`Stock cache invalidated for ${products.length} products`);
        
      } catch (error) {
        logger.error('Error in stock sync worker:', error);
      }
    });
    
    logger.info(`🕐 Stock sync worker started (${cronExpression})`);
  }
}

module.exports = new SyncStockWorker();
