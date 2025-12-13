const express = require('express');
const router = express.Router();
const PrescriptionController = require('../controllers/prescription.controller');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

// Create prescription
router.post('/prescriptions', 
  // authMiddleware, 
  // checkRole([3]), // Doctor role
  asyncHandler(PrescriptionController.createPrescription)
);

// Search prescriptions
router.get('/prescriptions', 
  // authMiddleware,
  // checkRole([1, 3, 4, 6]), // Admin, Doctor, Nurse, Pharmacist roles
  asyncHandler(PrescriptionController.searchPrescriptions)
);

// Get prescription by ID
router.get('/prescriptions/:prescriptionId', 
  // authMiddleware,
  // checkRole([1, 3, 4, 6]), // Admin, Doctor, Nurse, Pharmacist roles
  asyncHandler(PrescriptionController.getPrescriptionById)
);

// Update prescription status
router.patch('/prescriptions/:prescriptionId/status', 
  // authMiddleware,
  // checkRole([3, 6]), // Doctor and Pharmacist roles
  asyncHandler(PrescriptionController.updatePrescriptionStatus)
);

// Add prescription refill
router.post('/prescriptions/:prescriptionId/refill', 
  // authMiddleware,
  // checkRole([3]), // Doctor role
  asyncHandler(PrescriptionController.addPrescriptionRefill)
);

// Check prescription fulfillment status
router.get('/prescriptions/:prescriptionId/fulfillment', 
  // authMiddleware,
  // checkRole([1, 3, 4, 6]), // Admin, Doctor, Nurse, Pharmacist roles
  asyncHandler(PrescriptionController.checkPrescriptionFulfillment)
);

module.exports = router;