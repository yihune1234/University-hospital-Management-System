const jwt = require('jsonwebtoken');
const UserModel = require('../models/StaffModel.js');
require('dotenv').config();

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // No token? Block immediately
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    // Decode JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Validate user existence in DB
  const user = await UserModel.findById(payload.staff_id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token user' });
    }

    // Attach clean user object
    req.user = {
  staff_id: user.staff_id,
  full_name: `${user.first_name} ${user.middle_name || ''} ${user.last_name}`,
  role: user.role,
  email: user.email,
  campus_id: user.campus_id,
  clinic_id: user.clinic_id,
  employment_status: user.employment_status
};


    // Continue
    next();
  } catch (err) {
    console.error('Auth Error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
