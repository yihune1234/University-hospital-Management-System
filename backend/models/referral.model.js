const { query, transaction } = require('../config/db');

class ReferralModel {
  // Create a new referral
  async createReferral(referralData) {
    const { 
      patient_id,
      from_clinic_id, 
      to_clinic_id,
      referred_by,
      reason
    } = referralData;

    const sql = `
      INSERT INTO referrals 
      (patient_id, from_clinic_id, to_clinic_id, referred_by, reason, status) 
      VALUES (?, ?, ?, ?, ?, 'Pending')
    `;

    const result = await query(sql, [
      patient_id,
      from_clinic_id,
      to_clinic_id,
      referred_by,
      reason
    ]);

    return this.getReferralById(result.insertId);
  }


  // Get referral by ID with detailed information 
  async getReferralById(referralId) {
    const sql = `
      SELECT r.*, 
             CONCAT(p.first_name, ' ', p.last_name) AS patient_name, 
             p.university_id, 
             fc.clinic_name AS from_clinic_name, 
             tc.clinic_name AS to_clinic_name, 
             s.first_name AS referred_by_first_name, 
             s.last_name AS referred_by_last_name
      FROM referrals r 
      JOIN patients p ON r.patient_id = p.patient_id 
      JOIN clinics fc ON r.from_clinic_id = fc.clinic_id 
      JOIN clinics tc ON r.to_clinic_id = tc.clinic_id 
      LEFT JOIN staff s ON r.referred_by = s.staff_id 
      WHERE r.referral_id = ?
    `;
    
    const [referral] = await query(sql, [referralId]);
    return referral;
  }
  // Search referrals with advanced filtering 
  async searchReferrals(filters) {
    const { 
      patient_id, 
      from_clinic_id, 
      to_clinic_id, 
      referred_by,
      status, 
      start_date,
      end_date, 
      limit = 50, 
      offset = 0 
    } = filters;
    
    let sql = `
      SELECT 
        r.referral_id,
        r.patient_id,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        r.from_clinic_id,
        fc.clinic_name AS from_clinic_name,
        r.to_clinic_id,
        tc.clinic_name AS to_clinic_name,
        r.referred_by,
        s.first_name AS referred_by_first_name,
        s.last_name AS referred_by_last_name,
        r.status,
        r.referred_at
      FROM referrals r
      JOIN patients p ON r.patient_id = p.patient_id
      JOIN clinics fc ON r.from_clinic_id = fc.clinic_id
      JOIN clinics tc ON r.to_clinic_id = tc.clinic_id
      LEFT JOIN staff s ON r.referred_by = s.staff_id
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
    if (referred_by) {
      sql += ' AND r.referred_by = ?';
      params.push(referred_by);
    }
    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }
    if (start_date) {
      sql += ' AND r.referred_at >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND r.referred_at <= ?';
      params.push(end_date);
    }

    sql += ' ORDER BY r.referred_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return await query(sql, params);
  }
  // Update referral status 
  async updateReferralStatus(referralId, statusData) {
    const { status, notes } = statusData;
    
    const sql = `
      UPDATE referrals 
      SET status = ?
      WHERE referral_id = ?
    `;
    
    await query(sql, [status, referralId]);
    return this.getReferralById(referralId);
  }
  // Get referral tracking history (simplified - no separate tracking table)
  async getReferralTrackingHistory(referralId) {
    const sql = `
      SELECT 
        referral_id,
        status,
        referred_at as created_at,
        'System' as staff_name
      FROM referrals 
      WHERE referral_id = ?
    `;
    
    return await query(sql, [referralId]);
  }
      
  // Add tracking history entry (simplified)
  async addReferralTrackingEntry(referralId, trackingData) {
    const { status, notes } = trackingData;
    
    // For now, just update the referral status
    await this.updateReferralStatus(referralId, { status, notes });
    return referralId;
  }
}

module.exports = new ReferralModel();