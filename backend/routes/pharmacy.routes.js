const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const PharmacyController = require('../controllers/pharmacy.controller');

// Get all drugs (accessible to doctors, nurses, pharmacists)
router.get('/drugs', 
  authMiddleware, 
  checkRole([1, 3, 4, 6]), // Admin, Doctor, Nurse, Pharmacist
  asyncHandler(PharmacyController.getAllDrugs)
);

// Search drugs
router.get('/drugs/search', 
  authMiddleware, 
  checkRole([1, 3, 4, 6]),
  asyncHandler(PharmacyController.searchDrugs)
);

// Get low stock drugs
router.get('/drugs/low-stock', 
  authMiddleware, 
  checkRole([1, 6]), // Admin, Pharmacist
  asyncHandler(PharmacyController.getLowStockDrugs)
);

// Get drug by ID
router.get('/drugs/:drugId', 
  authMiddleware, 
  checkRole([1, 3, 4, 6]),
  asyncHandler(PharmacyController.getDrugById)
);

// Create new drug (Admin, Pharmacist only)
router.post('/drugs', 
  authMiddleware, 
  checkRole([1, 6]),
  asyncHandler(PharmacyController.createDrug)
);

// Update drug (Admin, Pharmacist only)
router.put('/drugs/:drugId', 
  authMiddleware, 
  checkRole([1, 6]),
  asyncHandler(PharmacyController.updateDrug)
);

// Update stock (Admin, Pharmacist only)
router.patch('/drugs/:drugId/stock', 
  authMiddleware, 
  checkRole([1, 6]),
  asyncHandler(PharmacyController.updateStock)
);

// Delete drug (Admin only)
router.delete('/drugs/:drugId', 
  authMiddleware, 
  checkRole([1]),
  asyncHandler(PharmacyController.deleteDrug)
);

module.exports = router;
