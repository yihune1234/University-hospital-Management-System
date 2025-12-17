const { query, transaction } = require('../config/db');

class StaffModel {
  // Get all staff with role information
  async getAllStaff() {
    const sql = `
      SELECT s.*, r.role_name 
      FROM staff s
      LEFT JOIN roles r ON s.role_id = r.role_id
      ORDER BY s.created_at DESC
    `;
    return await query(sql);
  }

  // Get staff by ID
  async getStaffById(staffId) {
    const sql = `
      SELECT s.*, r.role_name 
      FROM staff s
      LEFT JOIN roles r ON s.role_id = r.role_id
      WHERE s.staff_id = ?
    `;
    const results = await query(sql, [staffId]);
    return results[0];
  }

  // Get staff by email
  async getStaffByEmail(email) {
    const sql = `
      SELECT s.*, r.role_name 
      FROM staff s
      LEFT JOIN roles r ON s.role_id = r.role_id
      WHERE s.email = ?
    `;
    const results = await query(sql, [email]);
    return results[0];
  }

  // Check if email exists
  async emailExists(email, excludeStaffId = null) {
    let sql = 'SELECT staff_id FROM staff WHERE email = ?';
    const params = [email];
    
    if (excludeStaffId) {
      sql += ' AND staff_id != ?';
      params.push(excludeStaffId);
    }
    
    const results = await query(sql, params);
    return results.length > 0;
  }

  // Create new staff
  async createStaff(staffData) {
    const {
      first_name,
      middle_name,
      last_name,
      role_id,
      clinic_id,
      contact,
      email,
      password,
      is_active = 1
    } = staffData;

    const sql = `
      INSERT INTO staff 
      (first_name, middle_name, last_name, role_id, clinic_id, contact, email, password, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      first_name,
      middle_name || null,
      last_name,
      role_id,
      clinic_id || null,
      contact || null,
      email,
      password,
      is_active
    ]);

    return result.insertId;
  }

  // Update staff information
  async updateStaff(staffId, staffData) {
    const {
      first_name,
      middle_name,
      last_name,
      role_id,
      clinic_id,
      contact,
      is_active
    } = staffData;

    const sql = `
      UPDATE staff 
      SET 
        first_name = ?,
        middle_name = ?,
        last_name = ?,
        role_id = ?,
        clinic_id = ?,
        contact = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE staff_id = ?
    `;

    await query(sql, [
      first_name,
      middle_name || null,
      last_name,
      role_id,
      clinic_id || null,
      contact || null,
      is_active,
      staffId
    ]);

    return this.getStaffById(staffId);
  }

  // Update staff status
  async updateStaffStatus(staffId, isActive) {
    const sql = 'UPDATE staff SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE staff_id = ?';
    await query(sql, [isActive, staffId]);
    return this.getStaffById(staffId);
  }

  // Update staff password
  async updateStaffPassword(staffId, hashedPassword) {
    const sql = 'UPDATE staff SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE staff_id = ?';
    await query(sql, [hashedPassword, staffId]);
  }

  // Get staff by role
  async getStaffByRole(roleId) {
    const sql = `
      SELECT s.*, r.role_name 
      FROM staff s
      LEFT JOIN roles r ON s.role_id = r.role_id
      WHERE s.role_id = ? AND s.is_active = 1
      ORDER BY s.first_name, s.last_name
    `;
    return await query(sql, [roleId]);
  }

  // Get staff by clinic
  async getStaffByClinic(clinicId) {
    const sql = `
      SELECT s.*, r.role_name 
      FROM staff s
      LEFT JOIN roles r ON s.role_id = r.role_id
      WHERE s.clinic_id = ? AND s.is_active = 1
      ORDER BY s.first_name, s.last_name
    `;
    return await query(sql, [clinicId]);
  }

  // Search staff with filters
  async searchStaff(filters) {
    const {
      role_id,
      clinic_id,
      is_active,
      search_term,
      limit = 100,
      offset = 0
    } = filters;

    let sql = `
      SELECT s.*, r.role_name 
      FROM staff s
      LEFT JOIN roles r ON s.role_id = r.role_id
      WHERE 1=1
    `;
    const params = [];

    if (role_id) {
      sql += ' AND s.role_id = ?';
      params.push(role_id);
    }

    if (clinic_id) {
      sql += ' AND s.clinic_id = ?';
      params.push(clinic_id);
    }

    if (is_active !== undefined) {
      sql += ' AND s.is_active = ?';
      params.push(is_active);
    }

    if (search_term) {
      sql += ' AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.email LIKE ?)';
      const searchPattern = `%${search_term}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    sql += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    return await query(sql, params);
  }

  // Get all roles
  async getAllRoles() {
    const sql = 'SELECT * FROM roles ORDER BY role_name';
    return await query(sql);
  }

  // Get role by ID
  async getRoleById(roleId) {
    const sql = 'SELECT * FROM roles WHERE role_id = ?';
    const results = await query(sql, [roleId]);
    return results[0];
  }

  // Get staff statistics
  async getStaffStatistics() {
    const sql = `
      SELECT 
        COUNT(*) as total_staff,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_staff,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_staff
      FROM staff
    `;
    const results = await query(sql);
    return results[0];
  }

  // Get staff count by role
  async getStaffCountByRole() {
    const sql = `
      SELECT r.role_name, COUNT(s.staff_id) as count
      FROM roles r
      LEFT JOIN staff s ON r.role_id = s.role_id AND s.is_active = 1
      GROUP BY r.role_id, r.role_name
      ORDER BY r.role_name
    `;
    return await query(sql);
  }
}

module.exports = new StaffModel();
