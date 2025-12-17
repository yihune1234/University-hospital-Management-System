const db = require('../config/db');

class QueueModel {
  // Get queue for a specific clinic with patient and appointment details
  static async getClinicQueue(clinicId) {
    const [queue] = await db.query(
      `SELECT 
        wq.queue_id,
        wq.queue_number,
        wq.status,
        wq.created_at as check_in_time,
        wq.updated_at as call_time,
        a.appointment_id,
        a.appointment_time,
        a.reason,
        a.room_id,
        p.patient_id,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.contact AS phone_number,
        s.staff_id,
        s.first_name as staff_first_name,
        s.last_name as staff_last_name,
        wa.room_name
      FROM waiting_queue wq
      JOIN appointments a ON wq.appointment_id = a.appointment_id
      JOIN patients p ON a.patient_id = p.patient_id
      LEFT JOIN staff s ON a.staff_id = s.staff_id
      LEFT JOIN work_areas wa ON a.room_id = wa.room_id
      WHERE a.clinic_id = ?
        AND DATE(a.appointment_time) = CURDATE()
      ORDER BY wq.queue_number ASC`,
      [clinicId]
    );
    
    return queue;
  }

  // Get queue statistics for a clinic
  static async getQueueStatistics(clinicId) {
    const [stats] = await db.query(
      `SELECT 
        COUNT(*) as total_queue,
        SUM(CASE WHEN wq.status = 'Waiting' THEN 1 ELSE 0 END) as waiting_count,
        SUM(CASE WHEN wq.status = 'In-Service' THEN 1 ELSE 0 END) as in_service_count,
        SUM(CASE WHEN wq.status = 'Completed' THEN 1 ELSE 0 END) as completed_count,
        AVG(CASE 
          WHEN wq.status != 'Waiting' AND wq.updated_at IS NOT NULL 
          THEN TIMESTAMPDIFF(MINUTE, wq.created_at, wq.updated_at)
          ELSE NULL 
        END) as avg_wait_time_minutes
      FROM waiting_queue wq
      JOIN appointments a ON wq.appointment_id = a.appointment_id
      WHERE a.clinic_id = ?
        AND DATE(a.appointment_time) = CURDATE()`,
      [clinicId]
    );
    
    return stats[0] || {
      total_queue: 0,
      waiting_count: 0,
      in_service_count: 0,
      completed_count: 0,
      avg_wait_time_minutes: 0
    };
  }

  // Add patient to queue
  static async addToQueue(appointmentId) {
    // Get the next queue number for today
    const [maxQueue] = await db.query(
      `SELECT COALESCE(MAX(wq.queue_number), 0) as max_number
       FROM waiting_queue wq
       JOIN appointments a ON wq.appointment_id = a.appointment_id
       WHERE DATE(a.appointment_time) = CURDATE()`
    );
    
    const nextQueueNumber = (maxQueue[0].max_number || 0) + 1;
    
    const [result] = await db.query(
      `INSERT INTO waiting_queue (appointment_id, queue_number, status)
       VALUES (?, ?, 'Waiting')`,
      [appointmentId, nextQueueNumber]
    );
    
    return {
      queue_id: result.insertId,
      queue_number: nextQueueNumber,
      status: 'Waiting'
    };
  }

  // Update queue status
  static async updateQueueStatus(queueId, status) {
    const [result] = await db.query(
      `UPDATE waiting_queue 
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE queue_id = ?`,
      [status, queueId]
    );
    
    return result.affectedRows > 0;
  }

  // Call next patient in queue
  static async callNextPatient(clinicId) {
    // Get the next waiting patient
    const [nextPatient] = await db.query(
      `SELECT 
        wq.queue_id,
        wq.queue_number,
        wq.appointment_id,
        p.patient_id,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name,
        p.contact AS phone_number,
        a.room_id,
        wa.room_name
      FROM waiting_queue wq
      JOIN appointments a ON wq.appointment_id = a.appointment_id
      JOIN patients p ON a.patient_id = p.patient_id
      LEFT JOIN work_areas wa ON a.room_id = wa.room_id
      WHERE a.clinic_id = ?
        AND wq.status = 'Waiting'
        AND DATE(a.appointment_time) = CURDATE()
      ORDER BY wq.queue_number ASC
      LIMIT 1`,
      [clinicId]
    );
    
    if (nextPatient.length === 0) {
      return null;
    }
    
    // Update status to In-Service
    await db.query(
      `UPDATE waiting_queue 
       SET status = 'In-Service', updated_at = CURRENT_TIMESTAMP
       WHERE queue_id = ?`,
      [nextPatient[0].queue_id]
    );
    
    return nextPatient[0];
  }

  // Get queue by ID
  static async getQueueById(queueId) {
    const [queue] = await db.query(
      `SELECT 
        wq.*,
        a.clinic_id,
        a.patient_id,
        CONCAT(p.first_name, ' ', p.last_name) as patient_name
      FROM waiting_queue wq
      JOIN appointments a ON wq.appointment_id = a.appointment_id
      JOIN patients p ON a.patient_id = p.patient_id
      WHERE wq.queue_id = ?`,
      [queueId]
    );
    
    return queue[0] || null;
  }

  // Remove from queue (cancel)
  static async removeFromQueue(queueId) {
    const [result] = await db.query(
      `DELETE FROM waiting_queue WHERE queue_id = ?`,
      [queueId]
    );
    
    return result.affectedRows > 0;
  }

  // Get patient's current queue position
  static async getPatientQueuePosition(patientId, clinicId) {
    const [position] = await db.query(
      `SELECT 
        wq.queue_id,
        wq.queue_number,
        wq.status,
        (SELECT COUNT(*) 
         FROM waiting_queue wq2
         JOIN appointments a2 ON wq2.appointment_id = a2.appointment_id
         WHERE a2.clinic_id = ?
           AND wq2.status = 'Waiting'
           AND wq2.queue_number < wq.queue_number
           AND DATE(a2.appointment_time) = CURDATE()
        ) as position_in_line
      FROM waiting_queue wq
      JOIN appointments a ON wq.appointment_id = a.appointment_id
      WHERE a.patient_id = ?
        AND a.clinic_id = ?
        AND DATE(a.appointment_time) = CURDATE()
        AND wq.status IN ('Waiting', 'In-Service')
      LIMIT 1`,
      [clinicId, patientId, clinicId]
    );
    
    return position[0] || null;
  }

  // Reorder queue (for manual ordering)
  static async reorderQueue(queueUpdates) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      for (const update of queueUpdates) {
        await connection.query(
          `UPDATE waiting_queue SET queue_number = ? WHERE queue_id = ?`,
          [update.queue_number, update.queue_id]
        );
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = QueueModel;
