const { pool } = require('../config/db');

const CampusModel = {
  async create({ name, address, contact, status = 'active' }) {
    const [result] = await pool.query(
      `INSERT INTO campuses (name, address, contact, status) VALUES (?, ?, ?, ?)`,
      [name, address, contact, status]
    );
    return { campus_id: result.insertId, name, address, contact, status };
  },

  async getAll() {
    const [rows] = await pool.query(`SELECT * FROM campuses ORDER BY created_at DESC`);
    return rows;
  },

  async getById(campus_id) {
    const [rows] = await pool.query(`SELECT * FROM campuses WHERE campus_id = ?`, [campus_id]);
    return rows[0];
  },

  async update(campus_id, { name, address, contact, status }) {
    await pool.query(
      `UPDATE campuses SET name = COALESCE(?, name), address = COALESCE(?, address), contact = COALESCE(?, contact), status = COALESCE(?, status) WHERE campus_id = ?`,
      [name, address, contact, status, campus_id]
    );
    return this.getById(campus_id);
  },

  async remove(campus_id) {
    await pool.query(`DELETE FROM campuses WHERE campus_id = ?`, [campus_id]);
    return true;
  }
};

module.exports = CampusModel;
