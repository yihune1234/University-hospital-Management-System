const express = require('express');
const router = express.Router();
const AuditLogController = require('../controllers/audit_log.controller');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

// Create audit log entry
router.post('/audit-logs', 
  authMiddleware, 
  checkRole([1]), // Admin role only
  asyncHandler(AuditLogController.createAuditLog)
);

// Search audit logs
router.get('/audit-logs', 
  authMiddleware,
  checkRole([1]), // Admin role only
  asyncHandler(AuditLogController.searchAuditLogs)
);

// Get audit log by ID
router.get('/audit-logs/:logId', 
  authMiddleware,
  checkRole([1]), // Admin role only
  asyncHandler(AuditLogController.getAuditLogById)
);

// Generate audit report
router.get('/audit-reports', 
  authMiddleware,
  checkRole([1]), // Admin role only
  asyncHandler(AuditLogController.generateAuditReport)
);

// Detect suspicious activities
router.get('/suspicious-activities', 
  authMiddleware,
  checkRole([1]), // Admin role only
  asyncHandler(AuditLogController.detectSuspiciousActivities)
);

// Log system event
router.post('/system-events', 
  authMiddleware,
  checkRole([1]), // Admin role only
  asyncHandler(AuditLogController.logSystemEvent)
);

// Get recent logs
router.get('/audit-logs/recent', 
  authMiddleware,
  checkRole([1]), // Admin role only
  asyncHandler(AuditLogController.getRecentLogs)
);

// Get logs by staff
router.get('/audit-logs/staff/:staffId', 
  authMiddleware,
  checkRole([1]), // Admin role only
  asyncHandler(AuditLogController.getLogsByStaff)
);

module.exports = router;