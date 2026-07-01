const Notification = require('../models/Notification');
const { sendResponse } = require('../utils/response');
const { NotFoundError, ForbiddenError } = require('../utils/customError');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort('-createdAt');
    return sendResponse(res, 200, 'Notifications retrieved successfully.', notifications);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:notificationId/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new NotFoundError('Notification not found.');
    }
    if (notification.userId.toString() !== req.user.id.toString()) {
      throw new ForbiddenError('You are not authorized to mark this notification.');
    }
    notification.isRead = true;
    await notification.save();
    return sendResponse(res, 200, 'Notification marked as read.', notification);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    return sendResponse(res, 200, 'All notifications marked as read.');
  } catch (error) {
    next(error);
  }
};
