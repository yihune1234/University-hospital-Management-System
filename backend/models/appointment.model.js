const { query, transaction } = require('../config/db');

class AppointmentModel {

  // Create a new appointment
  async createAppointment(appointmentData) {
    const {
      patient_id,
      clinic_id,
      staff_id,
      room_id,
      appointment_time,
      reason,
      status = 'Scheduled'
    } = appointmentData;

    const sql = `
      INSERT INTO appointments 
      (patient_id, clinic_id, staff_id, room_id,
       appointment_time, reason, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      patient_id,
      clinic_id,
      staff_id || null,
      room_id || null,
      appointment_time,
      reason || null,
      status
    ]);

    return result.insertId;
  }

  // Get appointment by ID
  async getAppointmentById(appointmentId) {
    const sql = `
      SELECT 
        a.*, 
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name, 
        c.clinic_name, 
        s.first_name AS staff_first_name, 
        s.last_name AS staff_last_name, 
        r.room_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN clinics c ON a.clinic_id = c.clinic_id
      LEFT JOIN staff s ON a.staff_id = s.staff_id
      LEFT JOIN work_areas r ON a.room_id = r.room_id
      WHERE a.appointment_id = ?
    `;
    const [appointment] = await query(sql, [appointmentId]);
    return appointment;
  }

  // Search appointments with advanced filtering
  async searchAppointments(filters) {
    const {
      patient_id,
      clinic_id,
      staff_id,
      status,
      start_date,
      end_date,
      limit = 50,
      offset = 0
    } = filters;

    let sql = `
      SELECT 
        a.appointment_id,
        a.patient_id,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        a.clinic_id,
        c.clinic_name,
        a.staff_id,
        s.first_name AS staff_first_name,
        s.last_name AS staff_last_name,
        a.appointment_time,
        a.status
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN clinics c ON a.clinic_id = c.clinic_id
      LEFT JOIN staff s ON a.staff_id = s.staff_id
      WHERE 1=1
    `;

    const params = [];

    if (patient_id) {
      sql += ' AND a.patient_id = ?';
      params.push(patient_id);
    }
    if (clinic_id) {
      sql += ' AND a.clinic_id = ?';
      params.push(clinic_id);
    }
    if (staff_id) {
      sql += ' AND a.staff_id = ?';
      params.push(staff_id);
    }
    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }
  
    if (start_date) {
      sql += ' AND a.appointment_time >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND a.appointment_time <= ?';
      params.push(end_date);
    }

    sql += ' ORDER BY a.appointment_time DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return await query(sql, params);
  }

  // Update appointment status
  async updateAppointmentStatus(appointmentId, status) {
    const sql = `
      UPDATE appointments
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE appointment_id = ?
    `;

    await query(sql, [status, appointmentId]);
    return this.getAppointmentById(appointmentId);
  }

  // Cancel appointment
  async cancelAppointment(appointmentId, cancellationReason) {
    const sql = `
      UPDATE appointments
      SET status = 'Cancelled',
          reason = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE appointment_id = ?
    `;

    await query(sql, [cancellationReason, appointmentId]);
    return this.getAppointmentById(appointmentId);
  }

  // Update appointment room
  async updateAppointmentRoom(appointmentId, roomId) {
    const sql = `
      UPDATE appointments
      SET room_id = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE appointment_id = ?
    `;

    await query(sql, [roomId, appointmentId]);
    return this.getAppointmentById(appointmentId);
  }

  // Update appointment doctor/staff
  async updateAppointmentDoctor(appointmentId, staffId) {
    const sql = `
      UPDATE appointments
      SET staff_id = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE appointment_id = ?
    `;

    await query(sql, [staffId, appointmentId]);
    return this.getAppointmentById(appointmentId);
  }

  // Check scheduling conflicts
  async checkAppointmentConflicts(appointmentData) {
  const { staff_id, appointment_time, clinic_id } = appointmentData;

  const sql = `
    SELECT * FROM appointments
    WHERE staff_id = ?
      AND clinic_id = ?
      AND DATE(appointment_time) = DATE(?)
      AND status NOT IN ('Cancelled', 'Completed')
      AND ABS(TIMESTAMPDIFF(MINUTE, appointment_time, ?)) < 20
  `;

  const conflicts = await query(sql, [
    staff_id,
    clinic_id,
    appointment_time,
    appointment_time
  ]);

  return conflicts.length > 0;
}

  // Create waiting queue entry
  async createWaitingQueueEntry(appointmentId) {
    // Get clinic_id for the appointment
    const [appointment] = await query(
      'SELECT clinic_id FROM appointments WHERE appointment_id = ?',
      [appointmentId]
    );

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Get next queue number for this clinic today
    const [maxQueue] = await query(`
      SELECT COALESCE(MAX(wq.queue_number), 0) as max_number
      FROM waiting_queue wq
      JOIN appointments a ON wq.appointment_id = a.appointment_id
      WHERE a.clinic_id = ?
        AND DATE(a.appointment_time) = CURDATE()
    `, [appointment.clinic_id]);

    const nextQueueNumber = (maxQueue?.max_number || 0) + 1;

    const sql = `
      INSERT INTO waiting_queue (appointment_id, queue_number, status)
      VALUES (?, ?, 'Waiting')
    `;

    const result = await query(sql, [appointmentId, nextQueueNumber]);
    return result.insertId;
  }

  // Add patient to queue manually (walk-in)
  async addToQueue(queueData) {
    const { appointment_id, clinic_id } = queueData;

    // Get next queue number for this clinic today
    const [maxQueue] = await query(`
      SELECT COALESCE(MAX(wq.queue_number), 0) as max_number
      FROM waiting_queue wq
      JOIN appointments a ON wq.appointment_id = a.appointment_id
      WHERE a.clinic_id = ?
        AND DATE(a.appointment_time) = CURDATE()
    `, [clinic_id]);

    const nextQueueNumber = (maxQueue?.max_number || 0) + 1;

    const sql = `
      INSERT INTO waiting_queue (appointment_id, queue_number, status)
      VALUES (?, ?, 'Waiting')
    `;

    const result = await query(sql, [appointment_id, nextQueueNumber]);
    return result.insertId;
  }

  // Get queue for clinic
  async getCurrentQueue(clinicId, date = null) {
    let sql = `
      SELECT 
        wq.queue_id,
        wq.queue_number,
        wq.status,
        wq.created_at as queue_time,
        a.appointment_id,
        a.patient_id,
        a.appointment_time,
        a.reason,
        CONCAT(p.first_name, ' ', COALESCE(p.middle_name, ''), ' ', p.last_name) AS patient_name,
        p.contact AS phone_number,
        s.first_name AS staff_first_name,
        s.last_name AS staff_last_name,
        r.room_name
      FROM waiting_queue wq
      JOIN appointments a ON wq.appointment_id = a.appointment_id
      JOIN patients p ON a.patient_id = p.patient_id
      LEFT JOIN staff s ON a.staff_id = s.staff_id
      LEFT JOIN work_areas r ON a.room_id = r.room_id
      WHERE a.clinic_id = ?
    `;

    const params = [clinicId];

    if (date) {
      sql += ' AND DATE(a.appointment_time) = ?';
      params.push(date);
    } else {
      sql += ' AND DATE(a.appointment_time) = CURDATE()';
    }

    sql += ' AND wq.status IN ("Waiting", "In-Service")';
    sql += ' ORDER BY wq.queue_number ASC';

    return await query(sql, params);
  }

  // Get queue statistics
  async getQueueStatistics(clinicId, date = null) {
    let sql = `
      SELECT 
        COUNT(*) as total_queue,
        SUM(CASE WHEN wq.status = 'Waiting' THEN 1 ELSE 0 END) as waiting_count,
        SUM(CASE WHEN wq.status = 'In-Service' THEN 1 ELSE 0 END) as in_service_count,
        SUM(CASE WHEN wq.status = 'Completed' THEN 1 ELSE 0 END) as completed_count,
        AVG(CASE 
          WHEN wq.status = 'Completed' 
          THEN TIMESTAMPDIFF(MINUTE, wq.created_at, wq.updated_at) 
          ELSE NULL 
        END) as avg_wait_time_minutes
      FROM waiting_queue wq
      JOIN appointments a ON wq.appointment_id = a.appointment_id
      WHERE a.clinic_id = ?
    `;

    const params = [clinicId];

    if (date) {
      sql += ' AND DATE(a.appointment_time) = ?';
      params.push(date);
    } else {
      sql += ' AND DATE(a.appointment_time) = CURDATE()';
    }

    const [stats] = await query(sql, params);
    return stats || {
      total_queue: 0,
      waiting_count: 0,
      in_service_count: 0,
      completed_count: 0,
      avg_wait_time_minutes: 0
    };
  }

  // Get next patient in queue
  async getNextInQueue(clinicId) {
    const sql = `
      SELECT 
        wq.queue_id,
        wq.queue_number,
        a.appointment_id,
        a.patient_id,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name
      FROM waiting_queue wq
      JOIN appointments a ON wq.appointment_id = a.appointment_id
      JOIN patients p ON a.patient_id = p.patient_id
      WHERE a.clinic_id = ?
        AND wq.status = 'Waiting'
        AND DATE(a.appointment_time) = CURDATE()
      ORDER BY wq.queue_number ASC
      LIMIT 1
    `;

    const [nextPatient] = await query(sql, [clinicId]);
    return nextPatient;
  }

  // Call next patient (move to In-Service)
  async callNextPatient(clinicId) {
    const nextPatient = await this.getNextInQueue(clinicId);
    
    if (!nextPatient) {
      return null;
    }

    await this.updateQueueStatus(nextPatient.queue_id, 'In-Service');
    return nextPatient;
  }

  // Update queue status
  async updateQueueStatus(queueId, status) {
    const sql = `
      UPDATE waiting_queue
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE queue_id = ?
    `;

    await query(sql, [status, queueId]);

    const queueSql = `SELECT * FROM waiting_queue WHERE queue_id = ?`;
    const [queueEntry] = await query(queueSql, [queueId]);

    return queueEntry;
  }

  // Bulk create appointments
  async bulkCreateAppointments(appointments) {
    const queries = [];

    // Check conflicts
    for (const appointment of appointments) {
      const hasConflict = await this.checkAppointmentConflicts(appointment);
      if (hasConflict) {
        throw new Error(
          `Scheduling conflict for staff ${appointment.staff_id} at ${appointment.appointment_time}`
        );
      }
    }

    // Prepare transaction queries
    for (const appointment of appointments) {
      queries.push({
        sql: `
          INSERT INTO appointments 
          (patient_id, clinic_id, staff_id, room_id,
           appointment_time, reason, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        params: [
          appointment.patient_id,
          appointment.clinic_id,
          appointment.staff_id || null,
          appointment.room_id || null,
          appointment.appointment_time,
          appointment.reason || 'Regular appointment',
          appointment.status || 'Scheduled'
        ]
      });
    }

    return await transaction(queries);
  }
}

module.exports = new AppointmentModel();
