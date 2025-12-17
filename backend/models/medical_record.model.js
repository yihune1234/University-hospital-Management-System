const { query, transaction } = require('../config/db');

class MedicalRecordModel {

  // Create a new medical record
  async createMedicalRecord(recordData) {
    const { patient_id, doctor_id, diagnosis, treatment, notes, vital_signs } = recordData;

    // Insert medical record
    const medicalRecordSql = `
      INSERT INTO medical_records 
      (patient_id, doctor_id, diagnosis, treatment, notes, visit_date) 
      VALUES (?, ?, ?, ?, ?, CURDATE())
    `;
    const medicalRecordResult = await transaction(medicalRecordSql, [
      patient_id,
      doctor_id,
      diagnosis,
      treatment,
      notes
    ]);
    const recordId = medicalRecordResult[0].insertId;

    // Insert vital signs if provided
    if (vital_signs) {
      const vitalSignsSql = `
        INSERT INTO vitals 
        (patient_id, blood_pressure, temperature, 
         pulse, weight, recorded_by, recorded_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;
      await transaction(vitalSignsSql, [
        patient_id,
        vital_signs.blood_pressure,
        vital_signs.temperature,
        vital_signs.pulse,
        vital_signs.weight,
        doctor_id
      ]);
    }

    // Return the full medical record
    return this.getMedicalRecordById(recordId);
  }

  // Get medical record by ID
  async getMedicalRecordById(recordId) {
    const sql = `
      SELECT mr.*, 
             CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
             s.first_name AS doctor_first_name,
             s.last_name AS doctor_last_name
      FROM medical_records mr 
      JOIN patients p ON mr.patient_id = p.patient_id 
      LEFT JOIN staff s ON mr.doctor_id = s.staff_id 
      WHERE mr.record_id = ?
    `;
    const [record] = await query(sql, [recordId]);
    return record;
  }

  // Search medical records
  async searchMedicalRecords(filters) {
    const { patient_id, doctor_id, start_date, end_date, diagnosis, limit = 50, offset = 0 } = filters;
    let sql = `
      SELECT mr.record_id, mr.patient_id, 
             CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
             mr.doctor_id, s.first_name AS doctor_first_name,
             s.last_name AS doctor_last_name, mr.diagnosis, mr.visit_date
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.patient_id
      LEFT JOIN staff s ON mr.doctor_id = s.staff_id
      WHERE 1=1
    `;
    const params = [];

    if (patient_id) {
      sql += ' AND mr.patient_id = ?';
      params.push(patient_id);
    }
    if (doctor_id) {
      sql += ' AND mr.doctor_id = ?';
      params.push(doctor_id);
    }
    if (start_date) {
      sql += ' AND mr.visit_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND mr.visit_date <= ?';
      params.push(end_date);
    }
    if (diagnosis) {
      sql += ' AND mr.diagnosis LIKE ?';
      params.push(`%${diagnosis}%`);
    }

    sql += ' ORDER BY mr.visit_date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return await query(sql, params);
  }

  // Update medical record
  async updateMedicalRecord(recordId, recordData) {
    const { diagnosis, treatment, notes } = recordData;

    const medicalRecordSql = `
      UPDATE medical_records 
      SET diagnosis = ?, treatment = ?, notes = ?
      WHERE record_id = ?
    `;
    await query(medicalRecordSql, [diagnosis, treatment, notes, recordId]);

    return this.getMedicalRecordById(recordId);
  }

  // Add follow-up notes
  async addFollowUpNotes(recordId, followUpData) {
    const { notes } = followUpData;
    const sql = `
      UPDATE medical_records 
      SET notes = CONCAT(COALESCE(notes, ''), '\n\nFollow-up: ', ?)
      WHERE record_id = ?
    `;
    await query(sql, [notes, recordId]);
    return this.getMedicalRecordById(recordId);
  }

  // Get detailed medical record
  async getMedicalRecordDetails(recordId) {
    const recordSql = `
      SELECT mr.*, 
             CONCAT(p.first_name, ' ', p.last_name) AS patient_name, 
             p.university_id, p.gender, p.date_of_birth,
             s.first_name AS doctor_first_name, s.last_name AS doctor_last_name
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.patient_id
      LEFT JOIN staff s ON mr.doctor_id = s.staff_id
      WHERE mr.record_id = ?
    `;

    const vitalsSql = `
      SELECT * FROM vitals 
      WHERE patient_id = (SELECT patient_id FROM medical_records WHERE record_id = ?)
      ORDER BY recorded_at DESC LIMIT 1
    `;

    const [record] = await query(recordSql, [recordId]);
    const vitals = await query(vitalsSql, [recordId]);

    return {
      ...record,
      vitals: vitals[0] || null
    };
  }

}

module.exports = new MedicalRecordModel();
