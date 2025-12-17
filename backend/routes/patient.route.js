const express = require('express');
const router = express.Router();
const PatientController = require('../controllers/Patient.controller');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

// Patient registration (for admin and reception)
router.post('/patients', 
  authMiddleware, 
  checkRole([1, 2]), // Admin and Reception roles
  asyncHandler(PatientController.registerPatient)
);

// Bulk patient import
router.post('/patients/bulk', 
  authMiddleware, 
  checkRole([1, 2]), // Admin and Reception roles
  asyncHandler(PatientController.bulkImportPatients)
);

// Search patients
router.get('/patients', 
  authMiddleware,
  checkRole([1, 2, 3, 4, 5, 6, 7]), // Admin, Reception, Doctor, Nurse, Lab Tech, Pharmacist, Cashier roles
  asyncHandler(PatientController.searchPatients)
);

// Get patient by ID
router.get('/patients/:patientId', 
  authMiddleware,
  checkRole([1, 2, 3, 4, 5, 6, 7]), // Admin, Reception, Doctor, Nurse, Lab Tech, Pharmacist, Cashier roles
  asyncHandler(PatientController.getPatientById)
);

// Update patient
router.put('/patients/:patientId', 
  authMiddleware, 
  checkRole([1, 2]), // Admin and Reception roles
  asyncHandler(PatientController.updatePatient)
);

// Get patient medical history
router.get('/patients/:patientId/medical-history', 
  authMiddleware,
  checkRole([1, 3, 4, 5]), // Admin, Doctor, Nurse, Lab Tech roles
  asyncHandler(PatientController.getPatientMedicalHistory)
);

module.exports = router;