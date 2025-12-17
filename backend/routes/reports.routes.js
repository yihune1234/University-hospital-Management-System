const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
// const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

// // All report routes require authentication and admin role
// router.use(authenticateToken);
// router.use(authorizeRoles('Admin'));

// Patient Reports
router.get('/patients/overview', reportsController.getPatientOverview);
router.get('/patients/demographics', reportsController.getPatientDemographics);
router.get('/patients/registrations', reportsController.getPatientRegistrations);
router.get('/patients/visits', reportsController.getPatientVisits);

// Financial Reports
router.get('/financial/overview', reportsController.getFinancialOverview);
router.get('/financial/revenue', reportsController.getRevenueReport);
router.get('/financial/payments', reportsController.getPaymentReport);
router.get('/financial/outstanding', reportsController.getOutstandingBills);

// Appointment Reports
router.get('/appointments/overview', reportsController.getAppointmentOverview);
router.get('/appointments/trends', reportsController.getAppointmentTrends);
router.get('/appointments/no-shows', reportsController.getNoShowReport);
router.get('/appointments/wait-times', reportsController.getWaitTimeReport);

// Staff Reports
router.get('/staff/performance', reportsController.getStaffPerformance);
router.get('/staff/utilization', reportsController.getStaffUtilization);
router.get('/staff/schedules', reportsController.getScheduleReport);

// Clinic Reports
router.get('/clinics/utilization', reportsController.getClinicUtilization);
router.get('/clinics/performance', reportsController.getClinicPerformance);

// Lab Reports
router.get('/lab/overview', reportsController.getLabOverview);
router.get('/lab/turnaround', reportsController.getLabTurnaroundTime);

// Pharmacy Reports
router.get('/pharmacy/overview', reportsController.getPharmacyOverview);
router.get('/pharmacy/inventory', reportsController.getInventoryReport);

// Audit Logs
router.get('/audit-logs', reportsController.getAuditLogs);
router.get('/audit-logs/export', reportsController.exportAuditLogs);

module.exports = router;
