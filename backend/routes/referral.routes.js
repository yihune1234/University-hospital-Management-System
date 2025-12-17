const express = require('express');
const router = express.Router();
const ReferralController = require('../controllers/referral.controller');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

// Create referral (doctors only)
router.post('/referrals', 
  authMiddleware, 
  checkRole([3]), // Doctor role only
  asyncHandler(ReferralController.createReferral)
);

// Search referrals
router.get('/referrals', 
  authMiddleware,
  checkRole([1, 3, 4]), // Admin, Doctor, Nurse roles
  asyncHandler(ReferralController.searchReferrals)
);

// Get referral by ID
router.get('/referrals/:referralId', 
  authMiddleware,
  checkRole([1, 3, 4]), // Admin, Doctor, Nurse roles
  asyncHandler(ReferralController.getReferralById)
);

// Update referral status (doctors only)
router.patch('/referrals/:referralId/status', 
  authMiddleware,
  checkRole([3]), // Doctor role only
  asyncHandler(ReferralController.updateReferralStatus)
);

// Get referral tracking history
router.get('/referrals/:referralId/tracking-history', 
  authMiddleware,
  checkRole([1, 3, 4]), // Admin, Doctor, Nurse roles
  asyncHandler(ReferralController.getReferralTrackingHistory)
);

// Add referral tracking entry (doctors only)
router.post('/referrals/:referralId/tracking-history', 
  authMiddleware,
  checkRole([3]), // Doctor role only
  asyncHandler(ReferralController.addReferralTrackingEntry)
);

module.exports = router;