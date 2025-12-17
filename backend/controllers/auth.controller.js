const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { AppError } = require('../middleware/error.middleware');

class AuthController {
  async login(req, res) {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Find user by email with role information
    const users = await query(
      `SELECT s.staff_id, s.first_name, s.last_name, s.email, s.role_id, s.password, s.clinic_id,
              r.role_name
       FROM staff s
       JOIN roles r ON s.role_id = r.role_id
       WHERE s.email = ? AND s.is_active = 1`, 
      [email]
    );

    if (!users || users.length === 0) {
      throw new AppError('Invalid credentials', 401);
    }

    const user = users[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch)
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        staffId: user.staff_id, 
        roleId: user.role_id 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    res.json({
      token,
      user: {
        staffId: user.staff_id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        roleId: user.role_id,
        role: user.role_name,
        clinicId: user.clinic_id
      }
    });
  }

  async getCurrentUser(req, res) {
    const { staffId } = req.user;

    // Fetch user with role information
    const users = await query(
      `SELECT s.staff_id, s.first_name, s.last_name, s.email, s.role_id, s.clinic_id,
              r.role_name
       FROM staff s
       JOIN roles r ON s.role_id = r.role_id
       WHERE s.staff_id = ? AND s.is_active = 1`, 
      [staffId]
    );

    if (!users || users.length === 0) {
      throw new AppError('User not found', 404);
    }

    const user = users[0];

    res.json({
      user: {
        staffId: user.staff_id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        roleId: user.role_id,
        role: user.role_name,
        clinicId: user.clinic_id
      }
    });
  }

  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    const { staffId } = req.user;

    // Fetch current user's password
    const users = await query(
      'SELECT password FROM staff WHERE staff_id = ?', 
      [staffId]
    );

    if (!users || users.length === 0) {
      throw new AppError('User not found', 404);
    }

    const user = users[0];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await query(
      'UPDATE staff SET password = ? WHERE staff_id = ?', 
      [hashedPassword, staffId]
    );

    res.json({ message: 'Password changed successfully' });
  }
}

module.exports = new AuthController();