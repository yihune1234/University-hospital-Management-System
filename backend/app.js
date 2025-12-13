const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const { AppError, errorMiddleware } = require('./middleware/error.middleware.js');
//
const campusClinicsRoutes = require('./routes/campus-clincs.routes.js');
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



dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




// ... existing middleware
app.use(errorMiddleware)
// Add campus routes
app.use('/api/admin', campusClinicsRoutes);
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

// ... existing middleware


// ... existing middleware

// Add referral routes
app.use('/api', referralRoutes);
// Add lab request routes
app.use('/api', labRequestRoutes);
app.use('/api', billingRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});