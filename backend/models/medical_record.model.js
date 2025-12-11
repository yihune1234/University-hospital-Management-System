const { query, transaction } = require('../config/db');

class MedicalRecordModel {

  // Create a new medical record
  async createMedicalRecord(recordData) {
    const { patient_id, doctor_id, appointment_id, diagnosis, symptoms, treatment, notes, vital_signs } = recordData;

    // Insert medical record
    const medicalRecordSql = `
      INSERT INTO medical_records 
      (patient_id, doctor_id, appointment_id, diagnosis, 
       symptoms, treatment, notes, visit_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const medicalRecordResult = await transaction(medicalRecordSql, [
      patient_id,
      doctor_id,
      appointment_id,
      diagnosis,
      symptoms,
      treatment,
      notes
    ]);
    const recordId = medicalRecordResult[0].insertId;

    // Insert vital signs if provided
    if (vital_signs) {
      const vitalSignsSql = `
        INSERT INTO vitals 
        (patient_id, record_id, blood_pressure, temperature, 
         pulse, weight, recorded_by, recorded_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      await transaction(vitalSignsSql, [
        patient_id,
        recordId,
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
      SELECT mr.*, p.full_name AS patient_name,
             s.first_name AS doctor_first_name,
             s.last_name AS doctor_last_name,
             v.blood_pressure, v.temperature,
             v.pulse, v.weight 
      FROM medical_records mr 
      JOIN patients p ON mr.patient_id = p.patient_id 
      JOIN staff s ON mr.doctor_id = s.staff_id 
      LEFT JOIN vitals v ON v.record_id = mr.record_id 
      WHERE mr.record_id = ?
    `;
    const [record] = await query(sql, [recordId]);
    return record;
  }

  // Search medical records
  async searchMedicalRecords(filters) {
    const { patient_id, doctor_id, start_date, end_date, diagnosis, limit = 50, offset = 0 } = filters;
    let sql = `
      SELECT mr.record_id, mr.patient_id, p.full_name AS patient_name,
             mr.doctor_id, s.first_name AS doctor_first_name,
             s.last_name AS doctor_last_name, mr.diagnosis, mr.visit_date
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.patient_id
      JOIN staff s ON mr.doctor_id = s.staff_id
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
    const { diagnosis, symptoms, treatment, notes, vital_signs } = recordData;

    const medicalRecordSql = `
      UPDATE medical_records 
      SET diagnosis = ?, symptoms = ?, treatment = ?, notes = ?, updated_at = NOW()
      WHERE record_id = ?
    `;
    await transaction(medicalRecordSql, [diagnosis, symptoms, treatment, notes, recordId]);

    if (vital_signs) {
      const vitalSignsSql = `
        UPDATE vitals 
        SET blood_pressure = ?, temperature = ?, pulse = ?, weight = ?, updated_at = NOW()
        WHERE record_id = ?
      `;
      await transaction(vitalSignsSql, [
        vital_signs.blood_pressure,
        vital_signs.temperature,
        vital_signs.pulse,
        vital_signs.weight,
        recordId
      ]);
    }

    return this.getMedicalRecordById(recordId);
  }

  // Add follow-up notes
  async addFollowUpNotes(recordId, followUpData) {
    const { doctor_id, follow_up_notes, next_follow_up_date } = followUpData;
    const sql = `
      UPDATE medical_records 
      SET follow_up_notes = ?, next_follow_up_date = ?, follow_up_doctor_id = ?, updated_at = NOW()
      WHERE record_id = ?
    `;
    await query(sql, [follow_up_notes, next_follow_up_date, doctor_id, recordId]);
    return this.getMedicalRecordById(recordId);
  }

  // Get detailed medical record
  async getMedicalRecordDetails(recordId) {
    const recordSql = `
      SELECT mr.*, p.full_name AS patient_name, p.university_id, p.gender, p.date_of_birth,
             s.first_name AS doctor_first_name, s.last_name AS doctor_last_name,
             v.blood_pressure, v.temperature, v.pulse, v.weight
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.patient_id
      JOIN staff s ON mr.doctor_id = s.staff_id
      LEFT JOIN vitals v ON v.record_id = mr.record_id
      WHERE mr.record_id = ?
    `;

    const prescriptionsSql = `
      SELECT p.*, d.drug_name, d.brand
      FROM prescriptions p
      JOIN pharmacy_inventory d ON p.drug_id = d.drug_id
      WHERE p.medical_record_id = ?
    `;

    const labRequestsSql = `
      SELECT lr.*, lres.result_data, lres.result_date, lres.status AS result_status
      FROM lab_requests lr
      LEFT JOIN lab_results lres ON lr.request_id = lres.request_id
      WHERE lr.medical_record_id = ?
    `;

    const [record] = await query(recordSql, [recordId]);
    const prescriptions = await query(prescriptionsSql, [recordId]);
    const labRequests = await query(labRequestsSql, [recordId]);

    return {
      ...record,
      prescriptions,
      lab_requests: labRequests
    };
  }

}

module.exports = new MedicalRecordModel();
