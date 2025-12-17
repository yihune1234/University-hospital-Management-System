const { query, transaction } = require('../config/db');

class NotificationModel {
  // Create a new notification 
  async createNotification(notificationData) {
    const { 
      staff_id, 
      message, 
      is_read = 0 
    } = notificationData;

    const sql = `
      INSERT INTO notifications 
      (staff_id, message, is_read) 
      VALUES (?, ?, ?)
    `;

    const result = await query(sql, [staff_id, message, is_read]);
    return this.getNotificationById(result.insertId);
  }

  // Get notification by ID 
  async getNotificationById(notificationId) {
    const sql = `
      SELECT n.*, 
             CONCAT(s.first_name, ' ', s.last_name) AS staff_name,
             s.email AS staff_email
      FROM notifications n 
      JOIN staff s ON n.staff_id = s.staff_id 
      WHERE n.notification_id = ?
    `;
    
    const [notification] = await query(sql, [notificationId]);
    return notification;
  }

  // Search notifications 
  async searchNotifications(filters) {
    const { 
      staff_id, 
      is_read, 
      start_date, 
      end_date, 
      limit = 50, 
      offset = 0 
    } = filters;
    
    let sql = `
      SELECT 
        n.notification_id,
        n.staff_id,
        CONCAT(s.first_name, ' ', s.last_name) AS staff_name,
        n.message,
        n.is_read,
        n.created_at
      FROM notifications n
      JOIN staff s ON n.staff_id = s.staff_id
      WHERE 1=1
    `;
    const params = [];

    if (staff_id) {
      sql += ' AND n.staff_id = ?';
      params.push(staff_id);
    }
    if (is_read !== undefined) {
      sql += ' AND n.is_read = ?';
      params.push(is_read);
    }
    if (start_date) {
      sql += ' AND n.created_at >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND n.created_at <= ?';
      params.push(end_date);
    }

    sql += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return await query(sql, params);
  }

  // Update notification status 
  async updateNotificationStatus(notificationId, is_read) {
    const sql = `
      UPDATE notifications 
      SET is_read = ?
      WHERE notification_id = ?
    `;
    
    await query(sql, [is_read, notificationId]);
    return this.getNotificationById(notificationId);
  }

  // Mark notifications as read 
  async markNotificationsAsRead(notificationIds) {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      throw new Error('No notification IDs provided');
    }
    
    const placeholders = notificationIds.map(() => '?').join(',');
    const sql = `
      UPDATE notifications 
      SET is_read = 1
      WHERE notification_id IN (${placeholders})
    `;

    await query(sql, notificationIds);
    return { message: 'Notifications marked as read', count: notificationIds.length };
  }

  // Send system-wide notification 
  async sendSystemWideNotification(notificationData) {
    const { message, recipient_roles } = notificationData;
    
    // Find recipients based on roles
    const placeholders = recipient_roles.map(() => '?').join(',');
    const recipientsSql = `
      SELECT staff_id 
      FROM staff 
      WHERE role_id IN (${placeholders}) AND is_active = 1
    `;
    
    const recipients = await query(recipientsSql, recipient_roles);
    
    // Insert notifications for each recipient
    const insertPromises = recipients.map(recipient => {
      const sql = `
        INSERT INTO notifications (staff_id, message, is_read) 
        VALUES (?, ?, 0)
      `;
      return query(sql, [recipient.staff_id, message]);
    });

    await Promise.all(insertPromises);

    return {
      message: 'System-wide notification sent successfully',
      recipient_count: recipients.length
    };
  }

  // Get unread notification count 
  async getUnreadNotificationCount(staffId) {
    const sql = `
      SELECT COUNT(*) AS unread_count 
      FROM notifications 
      WHERE staff_id = ? AND is_read = 0
    `;
    
    const [result] = await query(sql, [staffId]);
    return result || { unread_count: 0 };
  }

  // Process notification delivery (simplified for basic schema)
  async processNotificationDelivery(notificationId, channel) {
    // For the basic schema, we'll just mark as read
    await this.updateNotificationStatus(notificationId, 1);
    
    return {
      message: `Notification delivered via ${channel}`,
      notification_id: notificationId
    };
  }
  // Create context-specific notifications 
  async createContextNotification(context) {
    const { context_type, entity_id, recipient_roles } = context;
    
    // Define notification templates based on context
    const notificationTemplates = {
      'low_stock': {
        message: 'Medication inventory is running low'
      },
      'prescription_refill': {
        message: 'Your prescription is ready for refill'
      },
      'appointment_reminder': {
        message: 'You have an upcoming appointment'
      },
      'lab_result_ready': {
        message: 'Your lab results are ready for review'
      },
      'referral_received': {
        message: 'You have received a new patient referral'
      }
    };

    const template = notificationTemplates[context_type];
    if (!template) {
      throw new Error('Invalid notification context');
    }

    // Create system-wide notification
    return this.sendSystemWideNotification({
      message: template.message,
      recipient_roles: recipient_roles
    });
  }

  // Get notifications for a specific staff member
  async getStaffNotifications(staffId, limit = 20) {
    const sql = `
      SELECT 
        notification_id,
        message,
        is_read,
        created_at
      FROM notifications 
      WHERE staff_id = ?
      ORDER BY created_at DESC 
      LIMIT ?
    `;
    
    return await query(sql, [staffId, limit]);
  }

  // Delete old notifications (cleanup)
  async deleteOldNotifications(daysOld = 30) {
    const sql = `
      DELETE FROM notifications 
      WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    
    const result = await query(sql, [daysOld]);
    return { deleted_count: result.affectedRows };
  }
}

module.exports = new NotificationModel();