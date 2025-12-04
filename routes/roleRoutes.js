const express = require('express');
const router = express.Router();

const RoleController = require('../controllers/RoleController.js');
const auth = require('../middlewares/authMiddleware.js');
const rbac = require('../middlewares/rbacMiddleware.js');

// All routes below require authentication
router.use(auth);

// Only Admin-level roles can modify role structure
router.post('/', rbac(['Admin']), RoleController.create);
router.get('/', rbac(['Admin']), RoleController.getAll);
router.get('/:id', rbac(['Admin']), RoleController.getById);
router.put('/:id', rbac(['Admin']), RoleController.update);
router.delete('/:id', rbac(['Admin']), RoleController.remove);

module.exports = router;
