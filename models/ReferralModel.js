const { pool } = require('../config/db');

const ReferralModel = {

  async create({ patient_id, from_clinic_id, to_clinic_id, reason, referring_doctor_id, receiving_doctor_id = null }) {
    const [result] = await pool.query(
      `INSERT INTO referrals 
      (patient_id, from_clinic_id, to_clinic_id, reason, referring_doctor_id, receiving_doctor_id)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [patient_id, from_clinic_id, to_clinic_id, reason, referring_doctor_id, receiving_doctor_id]
    );

    return { referral_id: result.insertId };
  },

  async findById(referral_id) {
    const [rows] = await pool.query(
      `SELECT r.*, 
        p.first_name AS patient_first_name, p.last_name AS patient_last_name,
        fc.name AS from_clinic_name,
        tc.name AS to_clinic_name,
        sd.first_name AS referring_doctor_first_name,
        rd.first_name AS receiving_doctor_first_name
      FROM referrals r
      LEFT JOIN patients p ON r.patient_id = p.patient_id
      LEFT JOIN clinics fc ON r.from_clinic_id = fc.clinic_id
      LEFT JOIN clinics tc ON r.to_clinic_id = tc.clinic_id
      LEFT JOIN staff sd ON r.referring_doctor_id = sd.staff_id
      LEFT JOIN staff rd ON r.receiving_doctor_id = rd.staff_id
      WHERE r.referral_id = ?`,
      [referral_id]
    );
    return rows[0];
  },

  async findAll() {
    const [rows] = await pool.query(`
      SELECT r.*, 
      p.first_name, p.last_name,
      fc.name AS from_clinic,
      tc.name AS to_clinic
      FROM referrals r
      LEFT JOIN patients p USING (patient_id)
      LEFT JOIN clinics fc ON r.from_clinic_id = fc.clinic_id
      LEFT JOIN clinics tc ON r.to_clinic_id = tc.clinic_id
      ORDER BY r.created_at DESC
    `);
    return rows;
  },

  async updateStatus(referral_id, status, receiving_doctor_id = null) {
    const acceptedAt = status === 'Accepted' ? new Date() : null;

    await pool.query(
      `UPDATE referrals 
       SET status = ?, 
           receiving_doctor_id = COALESCE(?, receiving_doctor_id),
           accepted_at = COALESCE(?, accepted_at)
       WHERE referral_id = ?`,
      [status, receiving_doctor_id, acceptedAt, referral_id]
    );

    return this.findById(referral_id);
  }
};

module.exports = ReferralModel;
