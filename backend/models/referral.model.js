const { query, transaction } = require('../config/db');

class ReferralModel {
     // Create a new referral
      async createReferral(referralData) 
      { 
        const { patient_id,
             from_clinic_id, to_clinic_id,
              referring_doctor_id,
               receiving_doctor_id, 
               referral_reason, medical_record_id,
                urgency = 'Normal', additional_notes } = referralData;
                const connection = await query.getConnection();

try {
  await connection.beginTransaction();

  // Insert referral
  const referralSql = `
    INSERT INTO referrals 
    (patient_id, from_clinic_id, to_clinic_id, 
     referring_doctor_id, receiving_doctor_id, 
     referral_reason, medical_record_id, 
     urgency, additional_notes, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
  `;
  const referralResult = await connection.query(referralSql, [
    patient_id,
    from_clinic_id,
    to_clinic_id,
    referring_doctor_id,
    receiving_doctor_id,
    referral_reason,
    medical_record_id,
    urgency,
    additional_notes
  ]);
  const referralId = referralResult[0].insertId;

  // Commit transaction
  await connection.commit();

  // Retrieve and return the full referral
  return this.getReferralById(referralId);
} catch (error) {
  // Rollback transaction in case of error
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
      }
// Get referral by ID with detailed information 
async getReferralById(referralId) 
{ const sql =` SELECT r.*, p.full_name AS patient_name, 
    p.university_id, fc.clinic_name AS from_clinic_name, 
    tc.clinic_name AS to_clinic_name, 
    sd_referring.first_name AS referring_doctor_first_name, 
    sd_referring.last_name AS referring_doctor_last_name,
     sd_receiving.first_name AS receiving_doctor_first_name,
      sd_receiving.last_name AS
     receiving_doctor_last_name,
 mr.diagnosis AS original_diagnosis FROM referrals r 
JOIN patients p ON r.patient_id = p.patient_id JOIN clinics fc ON r.from_clinic_id = fc.clinic_id JOIN 
clinics tc ON r.to_clinic_id = tc.clinic_id JOIN staff sd_referring ON r.referring_doctor_id = sd_referring.staff_id LEFT JOIN 
staff sd_receiving ON r.receiving_doctor_id = sd_receiving.staff_id LEFT JOIN medical_records mr ON r.medical_record_id = mr.record_id WHERE r.referral_id = ? `;
const [referral] = await query(sql, [referralId]);

// Get associated medical records if any
const medicalRecordsSql = `
  SELECT 
    record_id,
    diagnosis,
    treatment,
    visit_date
  FROM medical_records
  WHERE patient_id = ? AND record_id <= ?
  ORDER BY visit_date DESC
  LIMIT 3
`;
const medicalRecords = await query(medicalRecordsSql, [
  referral.patient_id, 
  referral.medical_record_id
]);

return {
  ...referral,
  recent_medical_records: medicalRecords
};
}
      
    
// Search referrals with advanced filtering 
async searchReferrals(filters) 
{ 
    const { patient_id, 
        from_clinic_id, 
        to_clinic_id, referring_doctor_id,
         receiving_doctor_id, status, urgency, start_date,
 end_date, limit = 50, offset = 0 } = filters;
 let sql = `
  SELECT 
    r.referral_id,
    r.patient_id,
    p.full_name AS patient_name,
    r.from_clinic_id,
    fc.clinic_name AS from_clinic_name,
    r.to_clinic_id,
    tc.clinic_name AS to_clinic_name,
    r.referring_doctor_id,
    sd_referring.first_name AS referring_doctor_first_name,
    sd_referring.last_name AS referring_doctor_last_name,
    r.receiving_doctor_id,
    sd_receiving.first_name AS receiving_doctor_first_name,
    sd_receiving.last_name AS receiving_doctor_last_name,
    r.status,
    r.urgency,
    r.created_at
  FROM referrals r
  JOIN patients p ON r.patient_id = p.patient_id
  JOIN clinics fc ON r.from_clinic_id = fc.clinic_id
  JOIN clinics tc ON r.to_clinic_id = tc.clinic_id
  JOIN staff sd_referring ON r.referring_doctor_id = sd_referring.staff_id
  LEFT JOIN staff sd_receiving ON r.receiving_doctor_id = sd_receiving.staff_id
  WHERE 1=1
`;
const params = [];

if (patient_id) {
  sql += ' AND r.patient_id = ?';
  params.push(patient_id);
}
if (from_clinic_id) {
  sql += ' AND r.from_clinic_id = ?';
  params.push(from_clinic_id);
}
if (to_clinic_id) {
  sql += ' AND r.to_clinic_id = ?';
  params.push(to_clinic_id);
}
if (referring_doctor_id) {
  sql += ' AND r.referring_doctor_id = ?';
  params.push(referring_doctor_id);
}
if (receiving_doctor_id) {
  sql += ' AND r.receiving_doctor_id = ?';
  params.push(receiving_doctor_id);
}
if (status) {
  sql += ' AND r.status = ?';
  params.push(status);
}
if (urgency) {
  sql += ' AND r.urgency = ?';
  params.push(urgency);
}
if (start_date) {
  sql += ' AND r.created_at >= ?';
  params.push(start_date);
}
if (end_date) {
  sql += ' AND r.created_at <= ?';
  params.push(end_date);
}

sql += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
params.push(limit, offset);

return await query(sql, params);
}
      

// Update referral status 
async updateReferralStatus(referralId, statusData) 
{ const { status, receiving_doctor_id, notes } = statusData;
const connection = await query.getConnection();

try {
  await connection.beginTransaction();

  // Update referral status
  const updateSql = `
    UPDATE referrals 
    SET status = ?, 
        receiving_doctor_id = ?, 
        status_notes = ?, 
        updated_at = NOW()
    WHERE referral_id = ?
  `;
  await connection.query(updateSql, [
    status, 
    receiving_doctor_id, 
    notes, 
    referralId
  ]);

  // If status is 'Accepted', create a new appointment
  if (status === 'Accepted') {
    const referralDetails = await this.getReferralById(referralId);

    const appointmentSql = `
      INSERT INTO appointments 
      (patient_id, clinic_id, staff_id, appointment_time, 
       visit_type, status, referral_id) 
      VALUES (?, ?, ?, NOW(), 'Referral', 'Scheduled', ?)
    `;
    await connection.query(appointmentSql, [
      referralDetails.patient_id,
      referralDetails.to_clinic_id,
      referralDetails.receiving_doctor_id,
      referralId
    ]);
  }

  // Commit transaction
  await connection.commit();

  // Retrieve and return the updated referral
  return this.getReferralById(referralId);
} catch (error) {
  // Rollback transaction in case of error
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
}
      
// Get referral tracking history 
async getReferralTrackingHistory(referralId) 
{ const sql =` SELECT rt.tracking_id, rt.referral_id, rt.status, rt.notes, rt.created_at, s.first_name, 
s.last_name, s.role_id FROM referral_tracking_history rt LEFT JOIN staff s ON rt.staff_id = s.staff_id WHERE rt.referral_id = ? ORDER BY rt.created_at ASC` ;
return await query(sql, [referralId]);
}
      
// Add tracking history entry 
async addReferralTrackingEntry(referralId, trackingData) 
{ const { staff_id, status, notes } = trackingData;
const sql = `
  INSERT INTO referral_tracking_history 
  (referral_id, staff_id, status, notes) 
  VALUES (?, ?, ?, ?)
`;

const result = await query(sql, [
  referralId,
  staff_id,
  status,
  notes
]);

return result.insertId;
} }

module.exports = new ReferralModel();