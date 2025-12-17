const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notification.controller');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

// Create notification
router.post('/notifications', 
  authMiddleware, 
  checkRole([1, 3, 4]), // Admin, Doctor, Nurse roles
  asyncHandler(NotificationController.createNotification)
);

// Search notifications
router.get('/notifications', 
  authMiddleware,
  asyncHandler(NotificationController.searchNotifications)
);

// Get notification by ID
router.get('/notifications/:notificationId', 
  authMiddleware,
  asyncHandler(NotificationController.getNotificationById)
);

// Update notification status
router.patch('/notifications/:notificationId/status', 
  authMiddleware,
  asyncHandler(NotificationController.updateNotificationStatus)
);

// Mark notifications as read
router.post('/notifications/mark-read', 
  authMiddleware,
  asyncHandler(NotificationController.markNotificationsAsRead)
);

// Send system-wide notification
router.post('/notifications/system-wide', 
  authMiddleware,
  checkRole([1]), // Admin role only
  asyncHandler(NotificationController.sendSystemWideNotification)
);

// Get unread notification count
router.get('/notifications/unread-count', 
  authMiddleware,
  asyncHandler(NotificationController.getUnreadNotificationCount)
);

// Process notification delivery
router.post('/notifications/:notificationId/deliver', 
  authMiddleware,
  checkRole([1]), // Admin role only
  asyncHandler(NotificationController.processNotificationDelivery)
);

// Create context-specific notification
router.post('/notifications/context', 
  authMiddleware,
  checkRole([1, 3, 4, 6]), // Admin, Doctor, Nurse, Pharmacist roles
  asyncHandler(NotificationController.createContextNotification)
);

// Get staff notifications
router.get('/notifications/staff', 
  authMiddleware,
  asyncHandler(NotificationController.getStaffNotifications)
);

module.exports = router;