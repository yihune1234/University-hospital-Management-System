const { query } = require('../config/db');

class ClinicModel {
  // Create a new clinic
  async createClinic(clinicData) {
    const { 
      campus_id, 
      clinic_name, 
      clinic_type, 
      open_time, 
      close_time, 
      status = 'Active' 
    } = clinicData;

    const sql = `
      INSERT INTO clinics 
      (campus_id, clinic_name, clinic_type, open_time, close_time, status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      campus_id, 
      clinic_name, 
      clinic_type, 
      open_time, 
      close_time, 
      status
    ]);
    return result.insertId;
  }

  // Get clinics by campus
  async getClinicsByCampus(campusId) {
    const sql = `
      SELECT clinic_id, clinic_name, clinic_type, 
             open_time, close_time, status 
      FROM clinics 
      WHERE campus_id = ?
      ORDER BY clinic_name
    `;
    return await query(sql, [campusId]);
  }

  // Update clinic
  async updateClinic(clinicId, clinicData) {
    const { 
      campus_id, 
      clinic_name, 
      clinic_type, 
      open_time, 
      close_time, 
      status 
    } = clinicData;

    const sql = `
      UPDATE clinics 
      SET campus_id = ?, 
          clinic_name = ?, 
          clinic_type = ?, 
          open_time = ?, 
          close_time = ?, 
          status = ? 
      WHERE clinic_id = ?
    `;
    await query(sql, [
      campus_id, 
      clinic_name, 
      clinic_type, 
      open_time, 
      close_time, 
      status, 
      clinicId
    ]);
    return this.getClinicById(clinicId);
  }

  // Get clinic by ID
  async getClinicById(clinicId) {
    const sql = `
      SELECT clinic_id, campus_id, clinic_name, 
             clinic_type, open_time, close_time, status 
      FROM clinics 
      WHERE clinic_id = ?
    `;
    const [clinic] = await query(sql, [clinicId]);
    return clinic;
  }

  // Activate/Deactivate clinic
  async toggleClinicStatus(clinicId, status) {
    const sql = `
      UPDATE clinics 
      SET status = ? 
      WHERE clinic_id = ?
    `;
    await query(sql, [status, clinicId]);
    return this.getClinicById(clinicId);
  }
}

module.exports = new ClinicModel();