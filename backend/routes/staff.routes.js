const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const StaffController = require('../controllers/staff.controller');

// Get all staff (Admin only)
router.get('/staff', 
  authMiddleware,  
  asyncHandler(StaffController.getAllStaff)
);

// Get staff by ID
router.get('/staff/:staffId', 
  authMiddleware, 
  asyncHandler(StaffController.getStaffById)
);

// Create new staff (Admin only)
router.post('/staff', 
  authMiddleware, 
  checkRole([1]), 
  asyncHandler(StaffController.createStaff)
);

// Update staff (Admin only)
router.put('/staff/:staffId', 
  authMiddleware, 
  checkRole([1]), 
  asyncHandler(StaffController.updateStaff)
);

// Update staff status (Admin only)
router.patch('/staff/:staffId/status', 
  authMiddleware, 
  checkRole([1]), 
  asyncHandler(StaffController.updateStaffStatus)
);

// Change staff password (Admin only)
router.patch('/staff/:staffId/password', 
  authMiddleware, 
  checkRole([1]), 
  asyncHandler(StaffController.changeStaffPassword)
);

// Get all roles
router.get('/roles', 
  authMiddleware, 
  asyncHandler(StaffController.getAllRoles)
);

module.exports = router;
