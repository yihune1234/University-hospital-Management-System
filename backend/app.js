const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const { AppError, errorMiddleware } = require('./middleware/error.middleware.js');
//
const campusClinicsRoutes = require('./routes/campus-clincs.routes.js');
// 
const patientRoute=require('./routes/patient.route');
const appointmentRoutes = require('./routes/appointment.routes');



// Load environment variables#

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
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});