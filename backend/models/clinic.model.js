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

  // Get clinic by ID
  async getClinicById(clinicId) {
    const sql = `
      SELECT 
        c.*,
        ca.campus_name
      FROM clinics c
      JOIN campuses ca ON c.campus_id = ca.campus_id
      WHERE c.clinic_id = ?
    `;

    const [clinic] = await query(sql, [clinicId]);
    return clinic;
  }

  // Get clinics by campus
  async getClinicsByCampus(campusId) {
    const sql = `
      SELECT 
        c.*,
        ca.campus_name,
        (SELECT COUNT(*) FROM staff WHERE clinic_id = c.clinic_id) as staff_count,
        (SELECT COUNT(*) FROM work_areas WHERE clinic_id = c.clinic_id) as room_count
      FROM clinics c
      JOIN campuses ca ON c.campus_id = ca.campus_id
      WHERE c.campus_id = ?
      ORDER BY c.clinic_name
    `;

    return await query(sql, [campusId]);
  }

  // Get all clinics
  async getAllClinics() {
    const sql = `
      SELECT 
        c.*,
        ca.campus_name
      FROM clinics c
      JOIN campuses ca ON c.campus_id = ca.campus_id
      ORDER BY ca.campus_name, c.clinic_name
    `;

    return await query(sql);
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
      SET campus_id = ?, clinic_name = ?, clinic_type = ?, 
          open_time = ?, close_time = ?, status = ?
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

  // Toggle clinic status
  async toggleClinicStatus(clinicId, status) {
    const sql = `
      UPDATE clinics 
      SET status = ?
      WHERE clinic_id = ?
    `;

    await query(sql, [status, clinicId]);
    return this.getClinicById(clinicId);
  }

  // Search clinics
  async searchClinics(filters) {
    const { 
      campus_id, 
      clinic_type, 
      status, 
      search_term,
      limit = 50, 
      offset = 0 
    } = filters;

    let sql = `
      SELECT 
        c.*,
        ca.campus_name
      FROM clinics c
      JOIN campuses ca ON c.campus_id = ca.campus_id
      WHERE 1=1
    `;
    const params = [];

    if (campus_id) {
      sql += ' AND c.campus_id = ?';
      params.push(campus_id);
    }
    if (clinic_type) {
      sql += ' AND c.clinic_type = ?';
      params.push(clinic_type);
    }
    if (status) {
      sql += ' AND c.status = ?';
      params.push(status);
    }
    if (search_term) {
      sql += ' AND (c.clinic_name LIKE ? OR c.clinic_type LIKE ?)';
      params.push(`%${search_term}%`, `%${search_term}%`);
    }

    sql += ' ORDER BY ca.campus_name, c.clinic_name LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return await query(sql, params);
  }
}

module.exports = new ClinicModel();