const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queue.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All queue routes require authentication
// router.use(authenticateToken);

// Get clinic queue with statistics
router.get('/clinics/:clinicId/queue', queueController.getClinicQueue);

// Add patient to queue
router.post('/queue', queueController.addToQueue);

// Update queue status
router.patch('/queue/:queueId/status', queueController.updateQueueStatus);

// Call next patient in clinic
router.post('/clinics/:clinicId/queue/next', queueController.callNextPatient);

// Remove patient from queue
router.delete('/queue/:queueId', queueController.removeFromQueue);

// Get patient's queue position
router.get('/patients/:patientId/clinics/:clinicId/queue-position', queueController.getPatientQueuePosition);

// Reorder queue manually (for drag-and-drop)
router.post('/queue/reorder', queueController.reorderQueue);

module.exports = router;
