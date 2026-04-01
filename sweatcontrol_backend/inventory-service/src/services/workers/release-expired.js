@'
const cron = require('node-cron');
const reservationService = require('../reservation.service');
const logger = require('../../utils/logger');

class ReleaseExpiredWorker {
  start() {
    const cronExpression = process.env.RELEASE_EXPIRED_CRON || '*/1 * * * *';
    
    cron.schedule(cronExpression, async () => {
      try {
        logger.debug('Running expired reservations cleanup...');
        const result = await reservationService.releaseExpiredReservations();
        
        if (result.released > 0) {
          logger.info(`Released ${result.released} expired reservations`);
        }
      } catch (error) {
        logger.error('Error in release expired worker:', error);
      }
    });
    
    logger.info(`🕐 Expired reservations worker started (${cronExpression})`);
  }
}

module.exports = new ReleaseExpiredWorker();
'@ | Out-File -FilePath src\services\workers\release-expired.js -Encoding utf8