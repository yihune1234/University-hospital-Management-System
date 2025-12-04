const { pool } = require('../config/db');

const ClinicModel = {
  async create({ campus_id, name, type = 'General', status = 'active' }) {
    const [result] = await pool.query(
      `INSERT INTO clinics (campus_id, name, type, status) VALUES (?, ?, ?, ?)`,
      [campus_id, name, type, status]
    );
    return { clinic_id: result.insertId, campus_id, name, type, status };
  },

  async getAll() {
    const [rows] = await pool.query(`SELECT c.*, cp.name as campus_name FROM clinics c LEFT JOIN campuses cp USING (campus_id) ORDER BY c.created_at DESC`);
    return rows;
  },

  async getById(clinic_id) {
    const [rows] = await pool.query(`SELECT * FROM clinics WHERE clinic_id = ?`, [clinic_id]);
    return rows[0];
  },

  async update(clinic_id, { campus_id, name, type, status }) {
    await pool.query(
      `UPDATE clinics SET campus_id = COALESCE(?, campus_id), name = COALESCE(?, name), type = COALESCE(?, type), status = COALESCE(?, status) WHERE clinic_id = ?`,
      [campus_id, name, type, status, clinic_id]
    );
    return this.getById(clinic_id);
  },

  async remove(clinic_id) {
    await pool.query(`DELETE FROM clinics WHERE clinic_id = ?`, [clinic_id]);
    return true;
  }
};

module.exports = ClinicModel;
