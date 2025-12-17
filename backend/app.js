const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const { AppError, errorMiddleware } = require('./middleware/error.middleware.js');
//
const authRoutes = require('./routes/auth.routes.js');
const staffRoutes = require('./routes/staff.routes.js');
const campusClinicsRoutes = require('./routes/campus-clinics.routes.js');
const roomRoutes = require('./routes/room.routes.js');
const pharmacyRoutes = require('./routes/pharmacy.routes.js');
// 
const patientRoute=require('./routes/patient.route');
const appointmentRoutes = require('./routes/appointment.routes');
const medicalRecordRoutes = require('./routes/medical_record.routes');

const labRequestRoutes = require('./routes/lab_request.routes');
// Add medical record routes
const prescriptionRoutes = require('./routes/prescription.routes');
// Load environment variables#
const referralRoutes = require('./routes/referral.routes');
const billingRoutes = require('./routes/billing.routes');
const notificationRoutes = require('./routes/notification.routes');
const auditLogRoutes = require('./routes/audit_log.routes');
const reportsRoutes = require('./routes/reports.routes');
const queueRoutes = require('./routes/queue.routes');


dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add auth routes
app.use('/api/auth', authRoutes);
// Add staff routes
app.use('/api/admin', staffRoutes);
// Add campus routes
app.use('/api/admin', campusClinicsRoutes);
// Add room routes
app.use('/api/admin', roomRoutes);
// Add pharmacy routes
app.use('/api/pharmacy', pharmacyRoutes);
//patients

app.use('/api',patientRoute)

// apponitments and waiting

// Add appointment routes
app.use('/api', appointmentRoutes);

// routes
app.use('/api', medicalRecordRoutes);


// ... existing middleware

// Add prescription routes
app.use('/api', prescriptionRoutes);



// Add referral routes
app.use('/api', referralRoutes);
// Add lab request routes
app.use('/api', labRequestRoutes);
app.use('/api', billingRoutes);
app.use('/api', notificationRoutes);
app.use('/api', auditLogRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api', queueRoutes);

// Error handling middleware (MUST be last)
app.use(errorMiddleware);

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});