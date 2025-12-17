const { query, transaction } = require('../config/db');

class PatientModel {
async registerPatient(patientData) {
  const {
    university_id,
    first_name,
    middle_name,
    last_name,
    gender,
    date_of_birth,
    contact,
    email,
    campus_id,
    is_active = 1
  } = patientData;

  const sql = `
    INSERT INTO patients 
    (university_id, first_name, middle_name, last_name, gender, date_of_birth, 
     contact, email, campus_id, is_active) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const result = await query(sql, [
    university_id ?? null,
    first_name ?? null,
    middle_name ?? null,
    last_name ?? null,
    gender ?? null,
    date_of_birth ?? null,
    contact ?? null,
    email ?? null,
    campus_id ?? null,
    is_active
  ]);

  return result.insertId;
}

  // Get patient by ID
  async getPatientById(patientId) {
    const sql = `
      SELECT p.*, c.campus_name 
      FROM patients p 
      LEFT JOIN campuses c ON p.campus_id = c.campus_id 
      WHERE p.patient_id = ?
    `;
    const [patient] = await query(sql, [patientId]);
    return patient;
  }

  // Get patient by university ID
  async getPatientByUniversityId(universityId) {
    const sql = `
      SELECT p.*, c.campus_name 
      FROM patients p 
      LEFT JOIN campuses c ON p.campus_id = c.campus_id 
      WHERE p.university_id = ?
    `;
    const [patient] = await query(sql, [universityId]);
    return patient;
  }

  // Search patients
  async searchPatients(filters) {
    const {
      first_name,
      middle_name,
      last_name,
      university_id,
      campus_id,
      patient_type,
      is_active,
      limit = 50,
      offset = 0
    } = filters;

    let sql = `
      SELECT p.*, c.campus_name
      FROM patients p
      LEFT JOIN campuses c ON p.campus_id = c.campus_id
      WHERE 1=1
    `;

    const params = [];

    if (first_name) {
      sql += ' AND p.first_name LIKE ?';
      params.push(`%${first_name}%`);
    }
    if (middle_name) {
      sql += ' AND p.middle_name LIKE ?';
      params.push(`%${middle_name}%`);
    }
    if (last_name) {
      sql += ' AND p.last_name LIKE ?';
      params.push(`%${last_name}%`);
    }
    if (university_id) {
      sql += ' AND p.university_id = ?';
      params.push(university_id);
    }
    if (campus_id) {
      sql += ' AND p.campus_id = ?';
      params.push(campus_id);
    }
    if (patient_type) {
      sql += ' AND p.patient_type = ?';
      params.push(patient_type);
    }
    if (is_active !== undefined) {
      sql += ' AND p.is_active = ?';
      params.push(is_active);
    }

    sql += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    return await query(sql, params);
  }

  // Update patient information
  async updatePatient(patientId, patientData) {
    const {
      first_name,
      middle_name,
      last_name,
      gender,
      date_of_birth,
      contact,
      email,
      campus_id,
      patient_type,
      is_active
    } = patientData;

    const sql = `
      UPDATE patients 
      SET 
        first_name = ?,
        middle_name = ?,
        last_name = ?,
        gender = ?, 
        date_of_birth = ?, 
        contact = ?, 
        email = ?, 
        campus_id = ?, 
        patient_type = ?, 
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE patient_id = ?
    `;

    await query(sql, [
      first_name ?? null,
      middle_name ?? null,
      last_name ?? null,
      gender ?? null,
      date_of_birth ?? null,
      contact ?? null,
      email ?? null,
      campus_id ?? null,
      patient_type ?? null,
      is_active ?? null,
      patientId
    ]);

    return this.getPatientById(patientId);
  }

  // Get patient medical history
  async getPatientMedicalHistory(patientId) {
    const medicalRecordsSql = `
      SELECT 
        mr.record_id, 
        mr.diagnosis, 
        mr.treatment, 
        mr.notes, 
        mr.visit_date, 
        s.first_name AS doctor_first_name, 
        s.last_name AS doctor_last_name 
      FROM medical_records mr 
      JOIN staff s ON mr.doctor_id = s.staff_id 
      WHERE mr.patient_id = ? 
      ORDER BY mr.visit_date DESC
    `;

    const labResultsSql = `
  SELECT 
    lr.result_id,
    lr.request_id,
    lr.result_data,
    lr.result_date,
    s.first_name AS doctor_first_name,
    s.last_name AS doctor_last_name
  FROM lab_results lr
  JOIN lab_requests lr_req ON lr.request_id = lr_req.request_id
  JOIN staff s ON lr_req.doctor_id = s.staff_id
  WHERE lr_req.patient_id = ?
  ORDER BY lr.result_date DESC
`;


    const prescriptionsSql = `
      SELECT 
        p.prescription_id,
        p.dosage,
        p.frequency,
        p.duration_days,
        p.date_issued,
        d.drug_name,
        s.first_name AS doctor_first_name,
        s.last_name AS doctor_last_name
      FROM prescriptions p
      JOIN pharmacy_inventory d ON p.drug_id = d.drug_id
      JOIN staff s ON p.doctor_id = s.staff_id
      WHERE p.patient_id = ?
      ORDER BY p.date_issued DESC
    `;

    const [medicalRecords, labResults, prescriptions] = await Promise.all([
      query(medicalRecordsSql, [patientId]),
      query(labResultsSql, [patientId]),
      query(prescriptionsSql, [patientId])
    ]);

    return {
      medical_records: medicalRecords,
      lab_results: labResults,
      prescriptions: prescriptions
    };
  }

  async bulkImportPatients(patients) {
  const queries = patients.map(patient => ({
    sql: `
      INSERT INTO patients 
      (university_id, first_name, middle_name, last_name, gender, date_of_birth, contact, email, campus_id, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        first_name = VALUES(first_name),
        middle_name = VALUES(middle_name),
        last_name = VALUES(last_name),
        gender = VALUES(gender),
        date_of_birth = VALUES(date_of_birth),
        contact = VALUES(contact),
        email = VALUES(email),
        campus_id = VALUES(campus_id),
        is_active = VALUES(is_active)
    `,
    params: [
      patient.university_id,
      patient.first_name,
      patient.middle_name,
      patient.last_name,
      patient.gender,
      patient.date_of_birth,
      patient.contact,
      patient.email,
      patient.campus_id,
      patient.is_active ?? 1
    ]
  }));

  return await transaction(queries);
}

}

module.exports = new PatientModel();
