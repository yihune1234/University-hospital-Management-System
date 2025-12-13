const express = require('express');
const router = express.Router();
const BillingController = require('../controllers/billing.controller');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

// Create bill
router.post('/bills', 
  authMiddleware, 
  checkRole([1, 2, 7]), // Admin, Reception, Cashier roles
  asyncHandler(BillingController.createBill)
);

// Search bills
router.get('/bills', 
  authMiddleware,
  checkRole([1, 2, 7]), // Admin, Reception, Cashier roles
  asyncHandler(BillingController.searchBills)
);

// Get bill by ID
router.get('/bills/:billId', 
  authMiddleware,
  checkRole([1, 2, 7]), // Admin, Reception, Cashier roles
  asyncHandler(BillingController.getBillById)
);

// Process bill payment
router.post('/bills/:billId/payments', 
  authMiddleware,
  checkRole([1, 2, 7]), // Admin, Reception, Cashier roles
  asyncHandler(BillingController.processBillPayment)
);

// Update bill status
router.patch('/bills/:billId/status', 
  authMiddleware,
  checkRole([1, 2, 7]), // Admin, Reception, Cashier roles
  asyncHandler(BillingController.updateBillStatus)
);

// Generate financial report
router.get('/financial-reports', 
  authMiddleware,
  checkRole([1, 7]), // Admin and Cashier roles
  asyncHandler(BillingController.generateFinancialReport)
);

// Get outstanding bills
router.get('/outstanding-bills', 
  authMiddleware,
  checkRole([1, 2, 7]), // Admin, Reception, Cashier roles
  asyncHandler(BillingController.getOutstandingBills)
);

module.exports = router;