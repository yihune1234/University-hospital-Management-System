const StaffModel = require('../models/StaffModel');
const { hashPassword, comparePassword } = require('../utils/hash.js');
const jwt = require('jsonwebtoken');

module.exports = {

  // ===========================
  // REGISTER STAFF WITH VALIDATION
  // ===========================
  async register(req, res) {
    try {
      const {
        first_name,
        middle_name,
        last_name,
        role,
        qualification,
        license_no,
        contact,
        email,
        password,
        campus_id,
        clinic_id,
        employment_status
      } = req.body;

      // ---------- REQUIRED FIELDS ----------
      const requiredFields = {
        first_name, last_name, role, contact,
        email, password, campus_id, clinic_id,
        employment_status
      };
      for (const [key, value] of Object.entries(requiredFields)) {
        if (!value || value.toString().trim() === "") {
          return res.status(400).json({ message: `${key} is required` });
        }
      }

      // ---------- STRING LENGTH VALIDATION ----------
      if (first_name.length < 2) return res.status(400).json({ message: "First name too short" });
      if (last_name.length < 2) return res.status(400).json({ message: "Last name too short" });

      // ---------- EMAIL FORMAT ----------
      const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailReg.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // ---------- CHECK DUPLICATE EMAIL ----------
      const exists = await StaffModel.findByEmail(email);
      if (exists) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // ---------- CONTACT/PHONE FORMAT ----------
      const phoneReg = /^(\+251|0)[0-9]{9}$/;
      if (!phoneReg.test(contact)) {
        return res.status(400).json({ message: "Invalid phone format (e.g. 0912345678)" });
      }

      // ---------- PASSWORD STRENGTH ----------
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      // ---------- ROLE CHECK ----------
      const validRoles = ["Admin", "Doctor", "Nurse", "Pharmacist", "Lab", "Reception"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: `Invalid role. Allowed: ${validRoles.join(", ")}` });
      }

      // ---------- EMPLOYMENT STATUS ----------
      const validStatus = ["active", "inactive"];
      if (!validStatus.includes(employment_status)) {
        return res.status(400).json({ message: `Invalid employment status` });
      }

      // ---------- CAMPUS/CLINIC NUMERIC ----------
      if (isNaN(campus_id)) return res.status(400).json({ message: "Campus ID must be a number" });
      if (isNaN(clinic_id)) return res.status(400).json({ message: "Clinic ID must be a number" });

      // ---------- HASH PASSWORD ----------
      const password_hash = await hashPassword(password);

      // ---------- CREATE STAFF ----------
      const staff = await StaffModel.create({
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
      });

      return res.status(201).json({
        message: "Staff registered successfully",
        staff
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },

  // ===========================
  // LOGIN WITH VALIDATION
  // ===========================
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const staff = await StaffModel.findByEmail(email);
      if (!staff) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const valid = await comparePassword(password, staff.password_hash);
      if (!valid) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { staff_id: staff.staff_id, role: staff.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return res.json({
        message: "Login successful",
        token,
        staff
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },

  // ===========================
  async getAll(req, res) {
    try {
      const staff = await StaffModel.getAll();
      res.json(staff);
    } catch {
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  },

  // ===========================
  async getById(req, res) {
    try {
      const staff = await StaffModel.findById(req.params.id);
      if (!staff) return res.status(404).json({ message: "Staff not found" });
      res.json(staff);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  },

  // ===========================
  async update(req, res) {
    try {
      const updated = await StaffModel.update(req.params.id, req.body);
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Failed to update staff" });
    }
  },

  // ===========================
  async assignRole(req, res) {
    try {
      const { role } = req.body;
      // ---------- ROLE CHECK ----------
      const validRoles = ["Admin", "Doctor", "Nurse", "Pharmacist", "Lab", "Reception"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: `Invalid role. Allowed: ${validRoles.join(", ")}` });
      }
      const updated = await StaffModel.assignRole(req.params.id, role);
      res.json({
        message: "Role updated successfully",
        staff: updated
      });

    } catch {
      res.status(500).json({ message: "Failed to assign role" });
    }
  }

};
