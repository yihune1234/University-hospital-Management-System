const express = require('express');
const router = express.Router();
const LabRequestController = require('../controllers/lab_request.controller');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

// Create lab request
router.post('/lab-requests', 
  authMiddleware, 
  checkRole([3, 4]), // Doctor and Nurse roles
  asyncHandler(LabRequestController.createLabRequest)
);

// Search lab requests
router.get('/lab-requests', 
  authMiddleware,
  checkRole([1, 3, 4, 5]), // Admin, Doctor, Nurse, Lab Technician roles
  asyncHandler(LabRequestController.searchLabRequests)
);

// Get lab request by ID
router.get('/lab-requests/:requestId', 
  authMiddleware,
  checkRole([1, 3, 4, 5]), // Admin, Doctor, Nurse, Lab Technician roles
  asyncHandler(LabRequestController.getLabRequestById)
);

// Get detailed lab request
router.get('/lab-requests/:requestId/details', 
  authMiddleware,
  checkRole([1, 3, 4, 5]), // Admin, Doctor, Nurse, Lab Technician roles
  asyncHandler(LabRequestController.getLabRequestDetails)
);

// Update lab request status
router.patch('/lab-requests/:requestId/status', 
  authMiddleware,
  checkRole([1, 5]), // Admin and Lab Technician roles
  asyncHandler(LabRequestController.updateLabRequestStatus)
);

// Add lab test results
router.post('/lab-requests/:requestId/results', 
  authMiddleware,
  checkRole([1, 5]), // Admin and Lab Technician roles
  asyncHandler(LabRequestController.addLabTestResults)
);

module.exports = router;