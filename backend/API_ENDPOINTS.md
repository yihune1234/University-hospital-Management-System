# University Clinic Management System - API Endpoints

## Authentication
- `POST /api/auth/login` - Staff login
- `POST /api/auth/change-password` - Change password

## Campus & Clinics Management
- `POST /api/admin/campuses` - Create campus
- `GET /api/admin/campuses` - Get all campuses
- `GET /api/admin/campuses/:campusId` - Get campus by ID
- `PUT /api/admin/campuses/:campusId` - Update campus
- `POST /api/admin/clinics` - Create clinic
- `GET /api/admin/campuses/:campusId/clinics` - Get clinics by campus
- `PUT /api/admin/clinics/:clinicId` - Update clinic
- `PATCH /api/admin/clinics/:clinicId/status` - Toggle clinic status

## Patient Management
- `POST /api/patients` - Register new patient
- `POST /api/patients/bulk` - Bulk import patients
- `GET /api/patients` - Search patients
- `GET /api/patients/:patientId` - Get patient by ID
- `PUT /api/patients/:patientId` - Update patient
- `GET /api/patients/:patientId/medical-history` - Get patient medical history

## Appointment Management
- `POST /api/appointments` - Create appointment
- `POST /api/appointments/bulk` - Bulk create appointments
- `GET /api/appointments` - Search appointments
- `GET /api/appointments/:appointmentId` - Get appointment by ID
- `PATCH /api/appointments/:appointmentId/status` - Update appointment status
- `POST /api/appointments/:appointmentId/cancel` - Cancel appointment

## Queue Management
- `GET /api/clinics/:clinicId/queue` - Get current queue for clinic
- `PATCH /api/queue/:queueId/status` - Update queue status

## Medical Records
- `POST /api/medical-records` - Create medical record
- `GET /api/medical-records` - Search medical records
- `GET /api/medical-records/:recordId` - Get medical record by ID
- `PUT /api/medical-records/:recordId` - Update medical record
- `POST /api/medical-records/:recordId/follow-up` - Add follow-up notes

## Lab Requests
- `POST /api/lab-requests` - Create lab request
- `GET /api/lab-requests` - Search lab requests
- `GET /api/lab-requests/:requestId` - Get lab request by ID
- `PATCH /api/lab-requests/:requestId/status` - Update lab request status
- `POST /api/lab-requests/:requestId/results` - Add lab results

## Prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions` - Search prescriptions
- `GET /api/prescriptions/:prescriptionId` - Get prescription by ID
- `PUT /api/prescriptions/:prescriptionId` - Update prescription
- `POST /api/prescriptions/:prescriptionId/refill` - Refill prescription

## Referrals
- `POST /api/referrals` - Create referral
- `GET /api/referrals` - Search referrals
- `GET /api/referrals/:referralId` - Get referral by ID
- `PATCH /api/referrals/:referralId/status` - Update referral status

## Billing
- `POST /api/bills` - Create bill
- `GET /api/bills` - Search bills
- `GET /api/bills/:billId` - Get bill by ID
- `POST /api/bills/:billId/payments` - Add payment
- `GET /api/reports/financial` - Generate financial reports

## Staff Schedules
- `POST /api/admin/staff-schedules` - Create staff schedule
- `GET /api/admin/staff-schedules` - Get staff schedules
- `POST /api/admin/staff-schedules/bulk` - Bulk create schedules

## Default Login Credentials (for testing)
- **Admin**: admin@university.edu / password123
- **Reception**: reception@university.edu / password123
- **Doctor**: doctor@university.edu / password123
- **Nurse**: nurse@university.edu / password123

## Environment Variables Required
```
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=University_Clinic_Management_System
DB_PORT=3306
PORT=3000
NODE_ENV=development
JWT_SECRET=your_very_long_and_secure_secret_key
JWT_EXPIRATION=24h
```

## Getting Started
1. Install dependencies: `npm install`
2. Set up your `.env` file with the above variables
3. Start the server: `npm start` or `npm run dev`
4. Test database connection: `npm run test-db`

The system will automatically create the database and tables on first run.