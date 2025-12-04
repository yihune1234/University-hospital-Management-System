const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');
const authMiddleware = require('../middlewares/authMiddleware');
const rbac = require('../middlewares/rbacMiddleware');

router.get('/', authMiddleware, clinicController.list);
router.get('/:id', authMiddleware, clinicController.get);

// create/update/delete: require elevated roles
router.post('/', authMiddleware, rbac(['Admin','HealthAdmin','ClinicManager']), clinicController.create);
router.put('/:id', authMiddleware, rbac(['Admin','HealthAdmin','ClinicManager']), clinicController.update);
router.delete('/:id', authMiddleware, rbac(['Admin','HealthAdmin']), clinicController.remove);

module.exports = router;
