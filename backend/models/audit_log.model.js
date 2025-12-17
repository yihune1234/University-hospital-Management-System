const { query, transaction } = require('../config/db');

class AuditLogModel {
  // Create an audit log entry
  async createAuditLog(logData) {
    const { 
      staff_id, 
      action, 
      meta = null, 
      ip_address 
    } = logData;
    
    const sql = `
      INSERT INTO audit_logs 
      (staff_id, action, meta, ip_address) 
      VALUES (?, ?, ?, ?)
    `;

    const result = await query(sql, [
      staff_id,
      action,
      meta ? JSON.stringify(meta) : null,
      ip_address
    ]);

    return result.insertId;
  }

  // Search audit logs with advanced filtering
  async searchAuditLogs(filters) {
    const { 
      staff_id, 
      action, 
      start_date, 
      end_date, 
      ip_address,
      limit = 50, 
      offset = 0 
    } = filters;
    
    let sql = `
      SELECT 
        al.log_id,
        al.staff_id,
        CONCAT(s.first_name, ' ', s.last_name) as staff_name,
        s.email,
        al.action,
        al.meta,
        al.timestamp,
        al.ip_address
      FROM audit_logs al
      LEFT JOIN staff s ON al.staff_id = s.staff_id
      WHERE 1=1
    `;
    const params = [];

    if (staff_id) {
      sql += ' AND al.staff_id = ?';
      params.push(staff_id);
    }
    if (action) {
      sql += ' AND al.action LIKE ?';
      params.push(`%${action}%`);
    }
    if (start_date) {
      sql += ' AND al.timestamp >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND al.timestamp <= ?';
      params.push(end_date);
    }
    if (ip_address) {
      sql += ' AND al.ip_address = ?';
      params.push(ip_address);
    }

    sql += ' ORDER BY al.timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return await query(sql, params);
  }

  // Get audit log details by ID 
  async getAuditLogById(logId) {
    const sql = `
      SELECT 
        al.*, 
        CONCAT(s.first_name, ' ', s.last_name) as staff_name,
        s.email, 
        s.role_id 
      FROM audit_logs al 
      LEFT JOIN staff s ON al.staff_id = s.staff_id 
      WHERE al.log_id = ?
    `;
    
    const [auditLog] = await query(sql, [logId]);

    // Parse JSON data if exists
    if (auditLog && auditLog.meta) {
      try {
        auditLog.meta = JSON.parse(auditLog.meta);
      } catch (e) {
        auditLog.meta = null;
      }
    }

    return auditLog;
  }

  // Generate comprehensive audit report 
  async generateAuditReport(reportParams) {
    const { start_date, end_date, report_type = 'summary' } = reportParams;
    
    // Different report types
    const reportQueries = {
      summary: `
        SELECT 
          DATE(timestamp) as date,
          COUNT(*) AS total_actions,
          COUNT(DISTINCT staff_id) as unique_users,
          MIN(timestamp) AS first_action,
          MAX(timestamp) AS last_action
        FROM audit_logs
        WHERE timestamp BETWEEN ? AND ?
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
      `,
      user_activity: `
        SELECT 
          al.staff_id,
          CONCAT(s.first_name, ' ', s.last_name) as staff_name,
          s.email,
          COUNT(*) AS total_actions,
          MAX(al.timestamp) AS last_action_time
        FROM audit_logs al
        LEFT JOIN staff s ON al.staff_id = s.staff_id
        WHERE al.timestamp BETWEEN ? AND ?
        GROUP BY al.staff_id, s.first_name, s.last_name, s.email
        ORDER BY total_actions DESC
      `,
      actions: `
        SELECT 
          action,
          COUNT(*) AS count,
          MIN(timestamp) AS first_occurrence,
          MAX(timestamp) AS last_occurrence
        FROM audit_logs
        WHERE timestamp BETWEEN ? AND ?
        GROUP BY action
        ORDER BY count DESC
      `
    };

    // Select appropriate query
    const sql = reportQueries[report_type] || reportQueries['summary'];

    return await query(sql, [start_date, end_date]);
  }

  // Detect suspicious activities 
  async detectSuspiciousActivities(params) {
    const { time_window_hours = 1, action_threshold = 50 } = params;
    
    const sql = `
      SELECT 
        al.staff_id,
        CONCAT(s.first_name, ' ', s.last_name) as staff_name,
        s.email,
        COUNT(*) AS total_actions,
        COUNT(DISTINCT ip_address) as unique_ips,
        MIN(al.timestamp) as first_action,
        MAX(al.timestamp) as last_action
      FROM audit_logs al
      LEFT JOIN staff s ON al.staff_id = s.staff_id
      WHERE al.timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      GROUP BY al.staff_id, s.first_name, s.last_name, s.email
      HAVING total_actions > ?
      ORDER BY total_actions DESC
    `;

    return await query(sql, [time_window_hours, action_threshold]);
  }

  // Log system event (simplified - using audit_logs table)
  async logSystemEvent(eventData) {
    const { staff_id = null, action, meta = null, ip_address = null } = eventData;
    
    return this.createAuditLog({
      staff_id,
      action: `SYSTEM: ${action}`,
      meta,
      ip_address
    });
  }

  // Get recent audit logs
  async getRecentLogs(limit = 100) {
    const sql = `
      SELECT 
        al.log_id,
        al.staff_id,
        CONCAT(s.first_name, ' ', s.last_name) as staff_name,
        al.action,
        al.timestamp,
        al.ip_address
      FROM audit_logs al
      LEFT JOIN staff s ON al.staff_id = s.staff_id
      ORDER BY al.timestamp DESC
      LIMIT ?
    `;
    
    return await query(sql, [limit]);
  }

  // Get logs by staff
  async getLogsByStaff(staffId, limit = 50) {
    const sql = `
      SELECT 
        log_id,
        action,
        meta,
        timestamp,
        ip_address
      FROM audit_logs
      WHERE staff_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `;
    
    return await query(sql, [staffId, limit]);
  }

  // Delete old logs (cleanup)
  async deleteOldLogs(daysOld = 90) {
    const sql = `
      DELETE FROM audit_logs 
      WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    
    const result = await query(sql, [daysOld]);
    return { deleted_count: result.affectedRows };
  }
}

module.exports = new AuditLogModel();