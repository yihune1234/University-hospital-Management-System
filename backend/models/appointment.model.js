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
      status = 'Scheduled'
    } = appointmentData;

    const sql = `
      INSERT INTO appointments 
      (patient_id, clinic_id, staff_id, room_id,
       appointment_time, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      patient_id,
      clinic_id,
      staff_id,
      room_id,
      appointment_time,
      status
    ]);

    return result.insertId;
  }

  // Get appointment by ID
  async getAppointmentById(appointmentId) {
    const sql = `
      SELECT 
        a.*, 
        p.full_name AS patient_name, 
        c.clinic_name, 
        s.first_name AS staff_first_name, 
        s.last_name AS staff_last_name, 
        r.room_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN clinics c ON a.clinic_id = c.clinic_id
      JOIN staff s ON a.staff_id = s.staff_id
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
        p.full_name AS patient_name,
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
      JOIN staff s ON a.staff_id = s.staff_id
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
          cancellation_reason = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE appointment_id = ?
    `;

    await query(sql, [cancellationReason, appointmentId]);
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
    const sql = `
      INSERT INTO waiting_queue (appointment_id, queue_number, status)
      VALUES (
        ?,
        (SELECT COALESCE(MAX(queue_number), 0) + 1 
         FROM waiting_queue 
         WHERE appointment_id IN (
            SELECT appointment_id FROM appointments 
            WHERE clinic_id = (
              SELECT clinic_id FROM appointments WHERE appointment_id = ?
            )
         )),
        'Waiting'
      )
    `;

    const result = await query(sql, [appointmentId, appointmentId]);
    return result.insertId;
  }

  // Get queue for clinic
  async getCurrentQueue(clinicId) {
    const sql = `
      SELECT 
        wq.queue_id,
        wq.queue_number,
        wq.status,
        a.appointment_id,
        p.full_name AS patient_name,
        s.first_name AS staff_first_name,
        s.last_name AS staff_last_name
      FROM waiting_queue wq
      JOIN appointments a ON wq.appointment_id = a.appointment_id
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN staff s ON a.staff_id = s.staff_id
      WHERE a.clinic_id = ?
        AND wq.status IN ('Waiting', 'In-Service')
      ORDER BY wq.queue_number
    `;

    return await query(sql, [clinicId]);
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
           appointment_time, visit_type, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        params: [
          appointment.patient_id,
          appointment.clinic_id,
          appointment.staff_id,
          appointment.room_id,
          appointment.appointment_time,
          appointment.visit_type || 'Regular',
          appointment.status || 'Scheduled'
        ]
      });
    }

    return await transaction(queries);
  }
}

module.exports = new AppointmentModel();
