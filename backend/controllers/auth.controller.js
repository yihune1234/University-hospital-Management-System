const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { AppError } = require('../middlewares/error.middleware');

class AuthController {
  async login(req, res) {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Find user by email
    const [user] = await query(
      'SELECT staff_id, first_name, last_name, email, role_id, password FROM staff WHERE email = ?', 
      [email]
    );

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
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
        roleId: user.role_id
      }
    });
  }

  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    const { staffId } = req.user;

    // Fetch current user's password
    const [user] = await query(
      'SELECT password FROM staff WHERE staff_id = ?', 
      [staffId]
    );

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