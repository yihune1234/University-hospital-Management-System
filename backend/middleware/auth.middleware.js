const jwt = require('jsonwebtoken');
const { query } = require('../config/db.js');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user exists and is active
    const [user] = await query(
      'SELECT staff_id, role_id, clinic_id FROM staff WHERE staff_id = ? AND is_active = 1', 
      [decoded.staffId]
    );

    if (!user) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = {
      staffId: user.staff_id,
      roleId: user.role_id,
      clinicId: user.clinic_id
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Role-based authorization middleware
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.roleId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  checkRole
};