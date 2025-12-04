const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const auth = require('../middlewares/authMiddleware.js');
const routRole=require('../middlewares/rbacMiddleware.js')

// Public
router.post('/register', staffController.register);
router.post('/login', staffController.login);

// Protected
router.get('/', auth,routRole('Admin'), staffController.getAll);
router.get('/:id', auth,routRole('Admin'), staffController.getById);
router.put('/:id', auth,routRole('Admin'), staffController.update);
router.put('/:id/role', auth,routRole('Admin'), staffController.assignRole);

module.exports = router;
