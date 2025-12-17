const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/appointment.controller');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');



// Create appointment
router.post('/appointments', 
  authMiddleware, 
  checkRole([1, 2, 3]), // Admin, Reception, Doctor roles
  asyncHandler(AppointmentController.createAppointment)
);

// Bulk create appointments
router.post('/appointments/bulk', 
  authMiddleware, 
  checkRole([1, 2]), // Admin, Reception roles
  asyncHandler(AppointmentController.bulkCreateAppointments)
);

// Search appointments
router.get('/appointments', 
  authMiddleware,
  checkRole([1, 2, 3, 4]), // Admin, Reception, Doctor, Nurse roles
  asyncHandler(AppointmentController.searchAppointments)
);

// Get appointment by ID
router.get('/appointments/:appointmentId', 
  authMiddleware,
  checkRole([1, 2, 3, 4]), // Admin, Reception, Doctor, Nurse roles
  asyncHandler(AppointmentController.getAppointmentById)
);

// Update appointment status
router.patch('/appointments/:appointmentId/status', 
  authMiddleware,
  checkRole([1, 2, 3]), // Admin, Reception, Doctor roles
  asyncHandler(AppointmentController.updateAppointmentStatus)
);

// Cancel appointment
router.post('/appointments/:appointmentId/cancel', 
  authMiddleware,
  checkRole([1, 2, 3]), // Admin, Reception, Doctor roles
  asyncHandler(AppointmentController.cancelAppointment)
);

// Get current queue for a clinic
router.get('/clinics/:clinicId/queue', 
  authMiddleware,
  checkRole([1, 2, 3, 4]), // Admin, Reception, Doctor, Nurse roles
  asyncHandler(AppointmentController.getCurrentQueue)
);

// Update queue status
router.patch('/queue/:queueId/status', 
  authMiddleware,
  checkRole([1, 2, 3, 4]), // Admin, Reception, Doctor, Nurse roles
  asyncHandler(AppointmentController.updateQueueStatus)
);

// Call next patient in queue
router.post('/clinics/:clinicId/queue/next', 
  authMiddleware,
  checkRole([1, 2, 3, 4]), // Admin, Reception, Doctor, Nurse roles
  asyncHandler(AppointmentController.callNextPatient)
);

// Add patient to queue manually
router.post('/queue/add', 
  authMiddleware,
  checkRole([1, 2]), // Admin, Reception roles
  asyncHandler(AppointmentController.addToQueue)
);

// Reassign room (for nurses)
router.patch('/appointments/:appointmentId/room', 
  authMiddleware,
  checkRole([1, 4]), // Admin, Nurse roles
  asyncHandler(AppointmentController.reassignRoom)
);

// Reassign doctor (for nurses)
router.patch('/appointments/:appointmentId/doctor', 
  authMiddleware,
  checkRole([1, 4]), // Admin, Nurse roles
  asyncHandler(AppointmentController.reassignDoctor)
);

module.exports = router;