const express = require('express');
const router = express.Router();
const { 
  CampusController, 
  ClinicController, 
  StaffScheduleController 
} = require('../controllers/campus-clinics.controller.js');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware.js');
const asyncHandler = require('../utils/asyncHandler.js');

// Campus routes
router.post('/campuses', 
  authMiddleware, 
  checkRole([1]), // Assuming role_id 1 is admin
  asyncHandler(CampusController.createCampus)
);

router.get('/campuses', 
  authMiddleware,
  asyncHandler(CampusController.getAllCampuses)
);

router.get('/campuses/:campusId', 
  authMiddleware,
  asyncHandler(CampusController.getCampusById)
);

router.put('/campuses/:campusId', 
  authMiddleware, 
  checkRole([1]),
  asyncHandler(CampusController.updateCampus)
);

// Clinic routes
router.post('/clinics', 
  authMiddleware, 
  checkRole([1]),
  asyncHandler(ClinicController.createClinic)
);

router.get('/campuses/:campusId/clinics', 
  authMiddleware,
  asyncHandler(ClinicController.getClinicsByCampus)
);

router.put('/clinics/:clinicId', 
  authMiddleware, 
  checkRole([1]),
  asyncHandler(ClinicController.updateClinic)
);

router.patch('/clinics/:clinicId/status', 
  authMiddleware, 
  checkRole([1]),
  asyncHandler(ClinicController.toggleClinicStatus)
);

// Staff Schedule routes
router.post('/staff-schedules', 
  authMiddleware, 
  checkRole([1]),
  asyncHandler(StaffScheduleController.createStaffSchedule)
);

router.get('/staff-schedules', 
  authMiddleware,
  asyncHandler(StaffScheduleController.getStaffSchedules)
);

router.put('/staff-schedules/:scheduleId', 
  authMiddleware, 
  checkRole([1]),
  asyncHandler(StaffScheduleController.updateSchedule)
);

router.delete('/staff-schedules/:scheduleId', 
  authMiddleware, 
  checkRole([1]),
  asyncHandler(StaffScheduleController.deleteSchedule)
);

router.patch('/staff-schedules/:scheduleId/status', 
  authMiddleware, 
  checkRole([1]),
  asyncHandler(StaffScheduleController.updateScheduleStatus)
);

router.post('/staff-schedules/check-conflicts', 
  authMiddleware,
  asyncHandler(StaffScheduleController.checkConflicts)
);

router.post('/staff-schedules/bulk', 
  authMiddleware, 
  checkRole([1]),
  asyncHandler(StaffScheduleController.bulkCreateSchedules)
);

module.exports = router;