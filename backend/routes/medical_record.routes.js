const express = require('express');
const router = express.Router();
const MedicalRecordController = require('../controllers/medical_record.controller');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

// Create medical record
router.post('/medical-records', 
  authMiddleware, 
  checkRole([3, 4]), // Doctor and Nurse roles
  asyncHandler(MedicalRecordController.createMedicalRecord)
);

// Search medical records
router.get('/medical-records', 
  authMiddleware,
  checkRole([1, 3, 4, 5, 6]), // Admin, Doctor, Nurse, Lab Tech, Pharmacist roles
  asyncHandler(MedicalRecordController.searchMedicalRecords)
);

// Get medical record by ID
router.get('/medical-records/:recordId', 
  authMiddleware,
  checkRole([1, 3, 4, 5, 6]), // Admin, Doctor, Nurse, Lab Tech, Pharmacist roles
  asyncHandler(MedicalRecordController.getMedicalRecordById)
);

// Get detailed medical record
router.get('/medical-records/:recordId/details', 
  authMiddleware,
  checkRole([1, 3, 4, 5, 6]), // Admin, Doctor, Nurse, Lab Tech, Pharmacist roles
  asyncHandler(MedicalRecordController.getMedicalRecordDetails)
);

// Update medical record
router.put('/medical-records/:recordId', 
  authMiddleware,
  checkRole([3, 4]), // Doctor and Nurse roles
  asyncHandler(MedicalRecordController.updateMedicalRecord)
);

// Add follow-up notes
router.post('/medical-records/:recordId/follow-up', 
  authMiddleware,
  checkRole([3, 4]), // Doctor and Nurse roles
  asyncHandler(MedicalRecordController.addFollowUpNotes)
);

module.exports = router;