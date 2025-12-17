const db = require('../config/db');

class ReportsModel {
  // Patient Reports
  static async getPatientOverview(startDate, endDate) {
    const [totalPatients] = await db.query(
      'SELECT COUNT(*) as total FROM patients WHERE created_at BETWEEN ? AND ?',
      [startDate, endDate]
    );
    
    const [newPatients] = await db.query(
      'SELECT COUNT(*) as total FROM patients WHERE created_at BETWEEN ? AND ?',
      [startDate, endDate]
    );
    
    const [activePatients] = await db.query(
      `SELECT COUNT(DISTINCT patient_id) as total FROM appointments 
       WHERE appointment_date BETWEEN ? AND ?`,
      [startDate, endDate]
    );
    
    return {
      totalPatients: totalPatients[0].total,
      newPatients: newPatients[0].total,
      activePatients: activePatients[0].total
    };
  }

  static async getPatientDemographics() {
    const [genderData] = await db.query(
      `SELECT gender, COUNT(*) as count FROM patients GROUP BY gender`
    );
    
    const [ageGroups] = await db.query(
      `SELECT 
        CASE 
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) < 18 THEN 'Under 18'
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 18 AND 25 THEN '18-25'
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 26 AND 35 THEN '26-35'
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 36 AND 50 THEN '36-50'
          ELSE 'Over 50'
        END as age_group,
        COUNT(*) as count
      FROM patients
      GROUP BY age_group`
    );
    
    return { genderData, ageGroups };
  }

  static async getPatientRegistrations(startDate, endDate, dateFormat) {
    const [registrations] = await db.query(
      `SELECT DATE_FORMAT(created_at, ?) as period, COUNT(*) as count
       FROM patients
       WHERE created_at BETWEEN ? AND ?
       GROUP BY period
       ORDER BY period`,
      [dateFormat, startDate, endDate]
    );
    
    return registrations;
  }

  static async getPatientVisits(startDate, endDate) {
    const [visits] = await db.query(
      `SELECT 
        p.patient_id,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        COUNT(a.appointment_id) as visit_count,
        MAX(a.appointment_date) as last_visit
       FROM patients p
       LEFT JOIN appointments a ON p.patient_id = a.patient_id
       WHERE a.appointment_date BETWEEN ? AND ?
       GROUP BY p.patient_id
       ORDER BY visit_count DESC
       LIMIT 100`,
      [startDate, endDate]
    );
    
    return visits;
  }

  // Financial Reports
  static async getFinancialOverview(startDate, endDate) {
    const [revenue] = await db.query(
      `SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(amount_paid), 0) as total_collected,
        COALESCE(SUM(total_amount - amount_paid), 0) as total_outstanding,
        COUNT(*) as total_bills
       FROM billing
       WHERE created_at BETWEEN ? AND ?`,
      [startDate, endDate]
    );
    
    return revenue[0];
  }

  static async getRevenueReport(startDate, endDate, dateFormat) {
    const [revenue] = await db.query(
      `SELECT 
        DATE_FORMAT(created_at, ?) as period,
        COALESCE(SUM(total_amount), 0) as revenue,
        COALESCE(SUM(amount_paid), 0) as collected,
        COUNT(*) as bill_count
       FROM billing
       WHERE created_at BETWEEN ? AND ?
       GROUP BY period
       ORDER BY period`,
      [dateFormat, startDate, endDate]
    );
    
    return revenue;
  }

  static async getPaymentReport(startDate, endDate) {
    const [payments] = await db.query(
      `SELECT 
        payment_method,
        COUNT(*) as transaction_count,
        COALESCE(SUM(amount_paid), 0) as total_amount
       FROM billing
       WHERE payment_date BETWEEN ? AND ? AND payment_status = 'Paid'
       GROUP BY payment_method`,
      [startDate, endDate]
    );
    
    return payments;
  }

  static async getOutstandingBills() {
    const [outstanding] = await db.query(
      `SELECT 
        b.bill_id,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        b.total_amount,
        b.amount_paid,
        (b.total_amount - b.amount_paid) as outstanding,
        b.created_at as bill_date,
        DATEDIFF(CURDATE(), b.created_at) as days_outstanding
       FROM billing b
       JOIN patients p ON b.patient_id = p.patient_id
       WHERE b.payment_status != 'Paid' AND (b.total_amount - b.amount_paid) > 0
       ORDER BY days_outstanding DESC
       LIMIT 100`
    );
    
    return outstanding;
  }

  // Appointment Reports
  static async getAppointmentOverview(startDate, endDate) {
    const [overview] = await db.query(
      `SELECT 
        COUNT(*) as total_appointments,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'No-Show' THEN 1 ELSE 0 END) as no_shows,
        SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) as scheduled
       FROM appointments
       WHERE appointment_date BETWEEN ? AND ?`,
      [startDate, endDate]
    );
    
    return overview[0];
  }

  static async getAppointmentTrends(startDate, endDate, dateFormat) {
    const [trends] = await db.query(
      `SELECT 
        DATE_FORMAT(appointment_date, ?) as period,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled
       FROM appointments
       WHERE appointment_date BETWEEN ? AND ?
       GROUP BY period
       ORDER BY period`,
      [dateFormat, startDate, endDate]
    );
    
    return trends;
  }

  static async getNoShowReport(startDate, endDate) {
    const [noShows] = await db.query(
      `SELECT 
        p.patient_id,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        COUNT(*) as no_show_count,
        MAX(a.appointment_date) as last_no_show
       FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id
       WHERE a.status = 'No-Show' AND a.appointment_date BETWEEN ? AND ?
       GROUP BY p.patient_id
       ORDER BY no_show_count DESC
       LIMIT 50`,
      [startDate, endDate]
    );
    
    return noShows;
  }

  static async getWaitTimeReport(startDate, endDate) {
    const [waitTimes] = await db.query(
      `SELECT 
        c.clinic_name,
        AVG(TIMESTAMPDIFF(MINUTE, q.check_in_time, q.call_time)) as avg_wait_minutes,
        MIN(TIMESTAMPDIFF(MINUTE, q.check_in_time, q.call_time)) as min_wait_minutes,
        MAX(TIMESTAMPDIFF(MINUTE, q.check_in_time, q.call_time)) as max_wait_minutes,
        COUNT(*) as patient_count
       FROM queue q
       JOIN clinics c ON q.clinic_id = c.clinic_id
       WHERE q.check_in_time BETWEEN ? AND ? AND q.call_time IS NOT NULL
       GROUP BY c.clinic_id
       ORDER BY avg_wait_minutes DESC`,
      [startDate, endDate]
    );
    
    return waitTimes;
  }

  // Staff Reports
  static async getStaffPerformance(startDate, endDate) {
    const [performance] = await db.query(
      `SELECT 
        s.staff_id,
        CONCAT(s.first_name, ' ', s.last_name) as staff_name,
        r.role_name,
        COUNT(DISTINCT a.appointment_id) as appointments_handled,
        COUNT(DISTINCT mr.record_id) as records_created,
        AVG(TIMESTAMPDIFF(MINUTE, a.appointment_time, mr.created_at)) as avg_consultation_time
       FROM staff s
       JOIN roles r ON s.role_id = r.role_id
       LEFT JOIN appointments a ON s.staff_id = a.doctor_id
       LEFT JOIN medical_records mr ON a.appointment_id = mr.appointment_id
       WHERE a.appointment_date BETWEEN ? AND ?
       GROUP BY s.staff_id
       ORDER BY appointments_handled DESC
       LIMIT 50`,
      [startDate, endDate]
    );
    
    return performance;
  }

  static async getStaffUtilization(startDate, endDate) {
    const [utilization] = await db.query(
      `SELECT 
        s.staff_id,
        CONCAT(s.first_name, ' ', s.last_name) as staff_name,
        r.role_name,
        COUNT(DISTINCT ss.schedule_id) as scheduled_shifts,
        COUNT(DISTINCT a.appointment_id) as appointments,
        ROUND(COUNT(DISTINCT a.appointment_id) / NULLIF(COUNT(DISTINCT ss.schedule_id), 0), 2) as utilization_rate
       FROM staff s
       JOIN roles r ON s.role_id = r.role_id
       LEFT JOIN staff_schedules ss ON s.staff_id = ss.staff_id
       LEFT JOIN appointments a ON s.staff_id = a.doctor_id AND DATE(a.appointment_date) = ss.shift_date
       WHERE ss.shift_date BETWEEN ? AND ?
       GROUP BY s.staff_id
       ORDER BY utilization_rate DESC`,
      [startDate, endDate]
    );
    
    return utilization;
  }

  static async getScheduleReport(startDate, endDate) {
    const [schedules] = await db.query(
      `SELECT 
        DATE_FORMAT(shift_date, '%Y-%m-%d') as date,
        c.clinic_name,
        COUNT(DISTINCT ss.staff_id) as staff_count,
        GROUP_CONCAT(DISTINCT r.role_name) as roles
       FROM staff_schedules ss
       JOIN clinics c ON ss.clinic_id = c.clinic_id
       JOIN staff s ON ss.staff_id = s.staff_id
       JOIN roles r ON s.role_id = r.role_id
       WHERE ss.shift_date BETWEEN ? AND ?
       GROUP BY shift_date, c.clinic_id
       ORDER BY shift_date DESC`,
      [startDate, endDate]
    );
    
    return schedules;
  }

  // Clinic Reports
  static async getClinicUtilization(startDate, endDate) {
    const [utilization] = await db.query(
      `SELECT 
        c.clinic_id,
        c.clinic_name,
        COUNT(DISTINCT a.appointment_id) as total_appointments,
        COUNT(DISTINCT q.queue_id) as total_patients,
        COUNT(DISTINCT ss.staff_id) as staff_assigned,
        AVG(TIMESTAMPDIFF(MINUTE, q.check_in_time, q.call_time)) as avg_wait_time
       FROM clinics c
       LEFT JOIN appointments a ON c.clinic_id = a.clinic_id AND a.appointment_date BETWEEN ? AND ?
       LEFT JOIN queue q ON c.clinic_id = q.clinic_id AND q.check_in_time BETWEEN ? AND ?
       LEFT JOIN staff_schedules ss ON c.clinic_id = ss.clinic_id AND ss.shift_date BETWEEN ? AND ?
       GROUP BY c.clinic_id
       ORDER BY total_appointments DESC`,
      [startDate, endDate, startDate, endDate, startDate, endDate]
    );
    
    return utilization;
  }

  static async getClinicPerformance(startDate, endDate) {
    const [performance] = await db.query(
      `SELECT 
        c.clinic_name,
        COUNT(DISTINCT a.appointment_id) as appointments,
        SUM(CASE WHEN a.status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN a.status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
        ROUND(SUM(CASE WHEN a.status = 'Completed' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) * 100, 2) as completion_rate
       FROM clinics c
       LEFT JOIN appointments a ON c.clinic_id = a.clinic_id
       WHERE a.appointment_date BETWEEN ? AND ?
       GROUP BY c.clinic_id
       ORDER BY completion_rate DESC`,
      [startDate, endDate]
    );
    
    return performance;
  }

  // Lab Reports
  static async getLabOverview(startDate, endDate) {
    const [overview] = await db.query(
      `SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress
       FROM lab_requests
       WHERE created_at BETWEEN ? AND ?`,
      [startDate, endDate]
    );
    
    return overview[0];
  }

  static async getLabTurnaroundTime(startDate, endDate) {
    const [turnaround] = await db.query(
      `SELECT 
        test_type,
        AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_hours,
        MIN(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as min_hours,
        MAX(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as max_hours,
        COUNT(*) as test_count
       FROM lab_requests
       WHERE status = 'Completed' AND created_at BETWEEN ? AND ?
       GROUP BY test_type
       ORDER BY avg_hours DESC`,
      [startDate, endDate]
    );
    
    return turnaround;
  }

  // Pharmacy Reports
  static async getPharmacyOverview(startDate, endDate) {
    const [overview] = await db.query(
      `SELECT 
        COUNT(DISTINCT p.prescription_id) as total_prescriptions,
        SUM(CASE WHEN p.status = 'Dispensed' THEN 1 ELSE 0 END) as dispensed,
        SUM(CASE WHEN p.status = 'Pending' THEN 1 ELSE 0 END) as pending,
        COUNT(DISTINCT pm.medication_id) as unique_medications
       FROM prescriptions p
       LEFT JOIN prescription_medications pm ON p.prescription_id = pm.prescription_id
       WHERE p.created_at BETWEEN ? AND ?`,
      [startDate, endDate]
    );
    
    return overview[0];
  }

  static async getInventoryReport() {
    const [inventory] = await db.query(
      `SELECT 
        medication_name,
        quantity_in_stock,
        reorder_level,
        CASE 
          WHEN quantity_in_stock <= reorder_level THEN 'Low Stock'
          WHEN quantity_in_stock <= reorder_level * 1.5 THEN 'Warning'
          ELSE 'Adequate'
        END as stock_status,
        expiry_date,
        DATEDIFF(expiry_date, CURDATE()) as days_to_expiry
       FROM pharmacy_inventory
       ORDER BY 
         CASE 
           WHEN quantity_in_stock <= reorder_level THEN 1
           WHEN DATEDIFF(expiry_date, CURDATE()) <= 30 THEN 2
           ELSE 3
         END,
         quantity_in_stock ASC
       LIMIT 100`
    );
    
    return inventory;
  }

  // Audit Logs
  static async getAuditLogs(filters) {
    const { startDate, endDate, userId, action, limit = 100, offset = 0 } = filters;
    
    let query = `
      SELECT 
        al.log_id,
        al.user_id,
        CONCAT(s.first_name, ' ', s.last_name) as user_name,
        r.role_name,
        al.action,
        al.table_name,
        al.record_id,
        al.old_values,
        al.new_values,
        al.ip_address,
        al.created_at
      FROM audit_logs al
      LEFT JOIN staff s ON al.user_id = s.staff_id
      LEFT JOIN roles r ON s.role_id = r.role_id
      WHERE al.created_at BETWEEN ? AND ?
    `;
    
    const params = [startDate, endDate];
    
    if (userId) {
      query += ' AND al.user_id = ?';
      params.push(userId);
    }
    
    if (action) {
      query += ' AND al.action = ?';
      params.push(action);
    }
    
    query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [logs] = await db.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM audit_logs WHERE created_at BETWEEN ? AND ?';
    const countParams = [startDate, endDate];
    
    if (userId) {
      countQuery += ' AND user_id = ?';
      countParams.push(userId);
    }
    
    if (action) {
      countQuery += ' AND action = ?';
      countParams.push(action);
    }
    
    const [countResult] = await db.query(countQuery, countParams);
    
    return {
      logs,
      total: countResult[0].total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };
  }
}

module.exports = ReportsModel;
