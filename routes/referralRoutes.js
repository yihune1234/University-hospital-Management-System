const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const authMiddleware = require('../middlewares/authMiddleware');
const rbac = require('../middlewares/rbacMiddleware');

// protected routes
router.use(authMiddleware);

// list all referrals
router.get('/', rbac(['Admin','HealthAdmin','Doctor','Nurse']), referralController.list);

// get single referral
router.get('/:id', rbac(['Admin','HealthAdmin','Doctor','Nurse']), referralController.get);

// create referral
router.post('/', rbac(['Doctor']), referralController.create);

// accept referral
router.put('/:id/accept', rbac(['Doctor','ClinicManager']), referralController.accept);

// reject referral
router.put('/:id/reject', rbac(['Doctor','ClinicManager']), referralController.reject);

// complete referral
router.put('/:id/complete', rbac(['Doctor']), referralController.complete);

module.exports = router;
