require('dotenv').config();
const express = require('express');
const app = express();
const setSchema=require('./config/setupDatabase.js')// optional script you may run once
const { pool } = require('./config/db');
setSchema().then(()=>console.log("DB and Tables ensured")).catch((err)=>console.error("DB Setup Error:",err));
// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRoutes = require('./routes/staffRoutes.js');
const campusRoutes = require('./routes/campusRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const referralRoutes = require('./routes/referralRoutes');
const roleRoutes = require('./routes/roleRoutes');

app.use('/api/users', userRoutes);
app.use('/api/campuses', campusRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/referrals', referralRoutes);

// global error handler (simple)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  // Optionally create DB and tables if you want to auto-run at server start.
  // await dbSetup(); // uncomment to run once
});
