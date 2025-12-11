const { query } = require('../config/db');

class CampusModel {
  // Create a new campus
  async createCampus(campusData) {
    const { campus_name, location, status = 'Active' } = campusData;
    const sql = `
      INSERT INTO campuses 
      (campus_name, location, status) 
      VALUES (?, ?, ?)
    `;
    const result = await query(sql, [campus_name, location, status]);
    return result.insertId;
  }

  // Get all campuses
  async getAllCampuses() {
    const sql = `
      SELECT campus_id, campus_name, location, status 
      FROM campuses 
      ORDER BY campus_name
    `;
    return await query(sql);
  }

  // Get campus by ID
  async getCampusById(campusId) {
    const sql = `
      SELECT campus_id, campus_name, location, status 
      FROM campuses 
      WHERE campus_id = ?
    `;
    const [campus] = await query(sql, [campusId]);
    return campus;
  }

  // Update campus
  async updateCampus(campusId, campusData) {
    const { campus_name, location, status } = campusData;
    const sql = `
      UPDATE campuses 
      SET campus_name = ?, location = ?, status = ? 
      WHERE campus_id = ?
    `;
    await query(sql, [campus_name, location, status, campusId]);
    return this.getCampusById(campusId);
  }
}

module.exports = new CampusModel();