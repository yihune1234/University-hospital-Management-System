const express = require('express');
const router = express.Router();
const campusController = require('../controllers/campusController');
const authMiddleware = require('../middlewares/authMiddleware');
const rbac = require('../middlewares/rbacMiddleware');

// public list
router.get('/', authMiddleware, campusController.list);
router.get('/:id', authMiddleware, campusController.get);

// Only admin / health admin / clinic manager create/update/delete
router.post('/', authMiddleware, rbac(['Admin','HealthAdmin','ClinicManager']), campusController.create);
router.put('/:id', authMiddleware, rbac(['Admin','HealthAdmin','ClinicManager']), campusController.update);
router.delete('/:id', authMiddleware, rbac(['Admin','HealthAdmin']), campusController.remove);

module.exports = router;
