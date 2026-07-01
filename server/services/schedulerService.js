const cron = require('node-cron');
const Job = require('../models/Job');
const logger = require('../config/logger');

// Scan and close expired jobs
const checkExpiredJobs = async () => {
  try {
    const now = new Date();
    const result = await Job.updateMany(
      {
        status: 'Open',
        deadline: { $lt: now },
        isDeleted: false,
      },
      {
        $set: { status: 'Closed' },
      }
    );
    if (result.modifiedCount > 0) {
      logger.info(`[Scheduler] Automatically closed ${result.modifiedCount} expired jobs.`);
    }
  } catch (error) {
    logger.error(`[Scheduler Error] Job expiry check failed: ${error.message}`);
  }
};

// Start cron job running every minute
const initScheduler = () => {
  cron.schedule('* * * * *', async () => {
    await checkExpiredJobs();
  });
  logger.info('[Scheduler] Job expiry check scheduler initialized (running every minute).');
};

module.exports = {
  initScheduler,
  checkExpiredJobs,
};
