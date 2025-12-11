const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

router.post('/login', asyncHandler(authController.login));
router.post('/change-password', authMiddleware, asyncHandler(authController.changePassword));

module.exports = router;