const { pool } = require('../config/db');

const RoleModel = {
  // ============================
  // CREATE ROLE
  // ============================
  async create({ role_name, description, permission_level }) {
    // Prevent duplicate roles
    const existing = await this.findByName(role_name);
    if (existing) return null;

    const [result] = await pool.query(
      `INSERT INTO roles (role_name, description, permission_level)
       VALUES (?, ?, ?)`,
      [role_name, description, permission_level]
    );

    return {
      role_id: result.insertId,
      role_name,
      description,
      permission_level
    };
  },

  // ============================
  // FIND BY NAME
  // ============================
  async findByName(role_name) {
    const [rows] = await pool.query(
      `SELECT * FROM roles WHERE role_name = ? LIMIT 1`,
      [role_name]
    );
    return rows[0];
  },

  // ============================
  // FIND BY ID
  // ============================
  async findById(role_id) {
    const [rows] = await pool.query(
      `SELECT * FROM roles WHERE role_id = ? LIMIT 1`,
      [role_id]
    );
    return rows[0];
  },

  // ============================
  // GET ALL ROLES
  // ============================
  async getAll() {
    const [rows] = await pool.query(
      `SELECT * FROM roles ORDER BY permission_level DESC`
    );
    return rows;
  },

  // ============================
  // UPDATE ROLE
  // ============================
  async update(role_id, fields = {}) {
    const { role_name, description, permission_level } = fields;

    await pool.query(
      `UPDATE roles SET
        role_name = COALESCE(?, role_name),
        description = COALESCE(?, description),
        permission_level = COALESCE(?, permission_level)
       WHERE role_id = ?`,
      [role_name, description, permission_level, role_id]
    );

    return this.findById(role_id);
  },

  // ============================
  // DELETE ROLE (HARD DELETE)
  // ============================
  async remove(role_id) {
    await pool.query(`DELETE FROM roles WHERE role_id = ?`, [role_id]);
    return { message: 'Role deleted successfully' };
  }
};

module.exports = RoleModel;
