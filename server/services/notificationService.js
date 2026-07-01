const Notification = require('../models/Notification');
const logger = require('../config/logger');

// Database-backed notification creator
const sendNotification = async (userId, title, message) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
    });
    logger.info(`[Notification] Created for User ${userId}: ${title}`);
    return notification;
  } catch (error) {
    logger.error(`[Notification Error] Failed to create notification for User ${userId}: ${error.message}`);
  }
};

module.exports = {
  sendNotification,
};
