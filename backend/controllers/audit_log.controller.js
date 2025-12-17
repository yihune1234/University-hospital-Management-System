

const AuditLogModel = require('../models/audit_log.model');
const { AppError } = require('../middleware/error.middleware');
const validator = require('../utils/validator');

class AuditLogController {
  // Create audit log entry
  async createAuditLog(req, res) {
    const { action, meta } = req.body;

    // Validate input
    if (!action) {
      throw new AppError('Action is required', 400);
    }

    // Create audit log
    const logId = await AuditLogModel.createAuditLog({
      staff_id: req.user.staffId,
      action,
      meta,
      ip_address: req.ip || req.connection.remoteAddress
    });

    res.status(201).json({
      log_id: logId,
      message: 'Audit log created successfully'
    });
  }

  // Search audit logs
  async searchAuditLogs(req, res) {
    const filters = req.query;

    const auditLogs = await AuditLogModel.searchAuditLogs(filters);
    res.json(auditLogs);
  }

  // Get audit log by ID
  async getAuditLogById(req, res) {
    const { logId } = req.params;

    const auditLog = await AuditLogModel.getAuditLogById(logId);
    if (!auditLog) {
      throw new AppError('Audit log not found', 404);
    }

    res.json(auditLog);
  }

  // Generate audit report
  async generateAuditReport(req, res) {
    const { start_date, end_date, report_type } = req.query;

    // Validate input
    if (!start_date || !end_date) {
      throw new AppError('Start date and end date are required', 400);
    }

    const auditReport = await AuditLogModel.generateAuditReport({
      start_date,
      end_date,
      report_type
    });
    
    res.json(auditReport);
  }

  // Detect suspicious activities
  async detectSuspiciousActivities(req, res) {
    const params = req.query;

    const suspiciousActivities = await AuditLogModel.detectSuspiciousActivities(params);
    res.json(suspiciousActivities);
  }

  // Log system event
  async logSystemEvent(req, res) {
    const { action, meta } = req.body;

    // Validate input
    if (!action) {
      throw new AppError('Action is required', 400);
    }

    const eventId = await AuditLogModel.logSystemEvent({
      staff_id: req.user ? req.user.staffId : null,
      action,
      meta,
      ip_address: req.ip || req.connection.remoteAddress
    });

    res.status(201).json({
      event_id: eventId,
      message: 'System event logged successfully'
    });
  }

  // Get recent logs
  async getRecentLogs(req, res) {
    const { limit } = req.query;

    const logs = await AuditLogModel.getRecentLogs(limit ? parseInt(limit) : 100);
    res.json(logs);
  }

  // Get logs by staff
  async getLogsByStaff(req, res) {
    const { staffId } = req.params;
    const { limit } = req.query;

    const logs = await AuditLogModel.getLogsByStaff(
      staffId, 
      limit ? parseInt(limit) : 50
    );
    
    res.json(logs);
  }
}

module.exports = new AuditLogController();