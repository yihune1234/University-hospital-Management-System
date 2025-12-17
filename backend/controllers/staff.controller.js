const bcrypt = require('bcryptjs');
const StaffModel = require('../models/staff.model');
const { AppError } = require('../middleware/error.middleware');

class StaffController {
  async getAllStaff(req, res) {
    const staff = await StaffModel.getAllStaff();
    res.json(staff);
  }

  async getStaffById(req, res) {
    const { staffId } = req.params;
    const staff = await StaffModel.getStaffById(staffId);

    if (!staff) {
      throw new AppError('Staff member not found', 404);
    }

    res.json(staff);
  }

  async createStaff(req, res) {
    const {
      first_name,
      middle_name,
      last_name,
      role_id,
      clinic_id,
      contact,
      email,
      password,
      is_active
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !role_id || !email || !password) {
      throw new AppError('Missing required fields', 400);
    }

    // Check if email already exists
    const emailExists = await StaffModel.emailExists(email);
    if (emailExists) {
      throw new AppError('Email already exists', 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create staff
    const staffId = await StaffModel.createStaff({
      first_name,
      middle_name,
      last_name,
      role_id,
      clinic_id,
      contact,
      email,
      password: hashedPassword,
      is_active: is_active || 1
    });

    res.status(201).json({
      message: 'Staff member created successfully',
      staff_id: staffId
    });
  }

  async updateStaff(req, res) {
    const { staffId } = req.params;
    const {
      first_name,
      middle_name,
      last_name,
      role_id,
      clinic_id,
      contact,
      is_active
    } = req.body;

    // Check if staff exists
    const existing = await StaffModel.getStaffById(staffId);
    if (!existing) {
      throw new AppError('Staff member not found', 404);
    }

    // Update staff
    await StaffModel.updateStaff(staffId, {
      first_name,
      middle_name,
      last_name,
      role_id,
      clinic_id,
      contact,
      is_active
    });

    res.json({ message: 'Staff member updated successfully' });
  }

  async updateStaffStatus(req, res) {
    const { staffId } = req.params;
    const { is_active } = req.body;

    await StaffModel.updateStaffStatus(staffId, is_active);
    res.json({ message: 'Staff status updated successfully' });
  }

  async changeStaffPassword(req, res) {
    const { staffId } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await StaffModel.updateStaffPassword(staffId, hashedPassword);
    res.json({ message: 'Password changed successfully' });
  }

  async getAllRoles(req, res) {
    const roles = await StaffModel.getAllRoles();
    res.json(roles);
  }
}

module.exports = new StaffController();
