

const NotificationModel = require('../models/notification.model');
const { AppError } = require('../middleware/error.middleware');
const validator = require('../utils/validator');

class NotificationController {
  // Create a new notification
  async createNotification(req, res) {
    const { staff_id, message } = req.body;

    // Validate input
    if (!staff_id || !message) {
      throw new AppError('Staff ID and message are required', 400);
    }

    // Create notification
    const notification = await NotificationModel.createNotification({
      staff_id,
      message,
      is_read: 0
    });

    res.status(201).json(notification);
  }

  // Search notifications
  async searchNotifications(req, res) {
    const filters = req.query;

    // If no staff_id specified, use authenticated user
    if (!filters.staff_id) {
      filters.staff_id = req.user.staffId;
    }

    const notifications = await NotificationModel.searchNotifications(filters);
    res.json(notifications);
  }

  // Get notification by ID
  async getNotificationById(req, res) {
    const { notificationId } = req.params;

    const notification = await NotificationModel.getNotificationById(notificationId);
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    res.json(notification);
  }

  // Update notification status
  async updateNotificationStatus(req, res) {
    const { notificationId } = req.params;
    const { is_read } = req.body;

    // Validate is_read
    if (is_read !== 0 && is_read !== 1) {
      throw new AppError('is_read must be 0 or 1', 400);
    }

    const updatedNotification = await NotificationModel.updateNotificationStatus(
      notificationId, 
      is_read
    );

    res.json(updatedNotification);
  }

  // Mark notifications as read
  async markNotificationsAsRead(req, res) {
    const { notification_ids } = req.body;

    // Validate input
    if (!Array.isArray(notification_ids) || notification_ids.length === 0) {
      throw new AppError('Invalid notification IDs', 400);
    }

    const updatedNotifications = await NotificationModel.markNotificationsAsRead(
      notification_ids
    );

    res.json(updatedNotifications);
  }

  // Send system-wide notification
  async sendSystemWideNotification(req, res) {
    const { message, recipient_roles } = req.body;

    // Validate input
    if (!message || !Array.isArray(recipient_roles) || recipient_roles.length === 0) {
      throw new AppError('Message and recipient roles are required', 400);
    }

    const result = await NotificationModel.sendSystemWideNotification({
      message,
      recipient_roles
    });

    res.status(201).json(result);
  }

  // Get unread notification count
  async getUnreadNotificationCount(req, res) {
    const staffId = req.user.staffId;

    const unreadCount = await NotificationModel.getUnreadNotificationCount(staffId);
    res.json(unreadCount);
  }

  // Process notification delivery
  async processNotificationDelivery(req, res) {
    const { notificationId } = req.params;
    const { channel } = req.body;

    // Validate channel
    const validChannels = ['system', 'email', 'sms', 'push'];
    if (!validChannels.includes(channel)) {
      throw new AppError('Invalid notification channel', 400);
    }

    const result = await NotificationModel.processNotificationDelivery(
      notificationId, 
      channel
    );

    res.json(result);
  }

  // Create context-specific notification
  async createContextNotification(req, res) {
    const { context_type, entity_id, recipient_roles } = req.body;

    // Validate input
    if (!context_type || !recipient_roles || !Array.isArray(recipient_roles)) {
      throw new AppError('Context type and recipient roles are required', 400);
    }

    const result = await NotificationModel.createContextNotification({
      context_type,
      entity_id,
      recipient_roles
    });

    res.status(201).json(result);
  }

  // Get staff notifications
  async getStaffNotifications(req, res) {
    const staffId = req.user.staffId;
    const { limit } = req.query;

    const notifications = await NotificationModel.getStaffNotifications(
      staffId, 
      limit ? parseInt(limit) : 20
    );

    res.json(notifications);
  }
}

module.exports = new NotificationController();