const { pool } = require('../config/db');

const StaffModel = {

  // CREATE STAFF (Admin or HealthAdmin)
  async create({
    first_name,
    middle_name,
    last_name,
    role,
    qualification,
    license_no,
    contact,
    email,
    password_hash,
    campus_id,
    clinic_id,
    employment_status = 'active'
  }) {
    const [result] = await pool.query(
      `INSERT INTO staff 
        (first_name, middle_name, last_name, role, qualification, license_no, contact, email, password_hash, campus_id, clinic_id, employment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        middle_name,
        last_name,
        role,
        qualification,
        license_no,
        contact,
        email,
        password_hash,
        campus_id,
        clinic_id,
        employment_status
      ]
    );

    return {
      staff_id: result.insertId,
      first_name,
      last_name,
      role,
      email
    };
  },

  // LOGIN — FIND BY EMAIL
  async findByEmail(email) {
    const [rows] = await pool.query(
      `SELECT * FROM staff WHERE email = ? LIMIT 1`,
      [email]
    );
    return rows[0];
  },

  // FIND BY ID
  async findById(staff_id) {
    const [rows] = await pool.query(
      `SELECT * FROM staff WHERE staff_id = ?`,
      [staff_id]
    );
    return rows[0];
  },

  // LIST STAFF
  async getAll() {
    const [rows] = await pool.query(
      `SELECT 
         s.*,
         c.name AS campus_name,
         cl.name AS clinic_name
       FROM staff s
       LEFT JOIN campuses c ON s.campus_id = c.campus_id
       LEFT JOIN clinics cl ON s.clinic_id = cl.clinic_id
       ORDER BY s.created_at DESC`
    );
    return rows;
  },

  // UPDATE STAFF DETAILS
  async update(staff_id, fields = {}) {
    const {
      first_name,
      last_name,
      role,
      clinic_id,
      campus_id,
      employment_status
    } = fields;

    await pool.query(
      `UPDATE staff SET 
         first_name = COALESCE(?, first_name),
         last_name = COALESCE(?, last_name),
         role = COALESCE(?, role),
         clinic_id = COALESCE(?, clinic_id),
         campus_id = COALESCE(?, campus_id),
         employment_status = COALESCE(?, employment_status)
       WHERE staff_id = ?`,
      [
        first_name,
        last_name,
        role,
        clinic_id,
        campus_id,
        employment_status,
        staff_id
      ]
    );

    return this.findById(staff_id);
  },

  // ASSIGN ROLE
  async assignRole(staff_id, role) {
    await pool.query(
      `UPDATE staff SET role = ? WHERE staff_id = ?`,
      [role, staff_id]
    );

    return this.findById(staff_id);
  }
};

module.exports = StaffModel;
