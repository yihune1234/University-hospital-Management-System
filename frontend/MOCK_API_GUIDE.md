# Mock API Documentation

## Overview

The frontend now includes a comprehensive mock API system that simulates all backend endpoints with realistic sample data. This allows the frontend to run completely independently without requiring a backend server connection.

## Features

✅ **Complete API Coverage**: All backend endpoints are mocked
✅ **Realistic Sample Data**: Pre-populated with sample users, patients, appointments, etc.
✅ **Data Persistence**: Uses localStorage to maintain data across sessions
✅ **Audit Logging**: Automatically tracks all CRUD operations
✅ **Role-Based Data**: Sample data for all 8 user roles
✅ **Relationship Integrity**: Maintains proper relationships between entities

## Configuration

The mock API is controlled via environment variables in `.env`:

```env
VITE_USE_MOCK_API=true          # Enable/disable mock API
VITE_API_BASE_URL=/api          # Base URL (not used when mock is enabled)
VITE_AUTH_TOKEN_KEY=authToken   # localStorage key for auth token
VITE_SESSION_TIMEOUT_MINUTES=30 # Session timeout duration
```

## Sample Login Credentials

Use these credentials to test different user roles:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin** | admin@university.edu | Admin@123 | System Administrator |
| **Doctor** | doctor@university.edu | Doctor@123 | Dr. John Smith (Cardiology) |
| **Nurse** | nurse@university.edu | Nurse@123 | Jane Doe (General Medicine) |
| **Pharmacist** | pharmacist@university.edu | Pharma@123 | Mike Johnson |
| **Receptionist** | receptionist@university.edu | Recept@123 | Sarah Williams |
| **LabStaff** | lab@university.edu | LabStaff@123 | Tom Brown |
| **HealthAdmin** | healthadmin@university.edu | Health@123 | Emily Davis |
| **ClinicManager** | manager@university.edu | Manager@123 | Robert Wilson |

## Mock Data Included

### Campuses (4)
- Main Campus
- Medical Campus
- Engineering Campus
- Science Campus

### Clinics (6)
- General Medicine Clinic
- Dental Clinic
- Cardiology Clinic
- Pediatrics Clinic
- Emergency Clinic
- Mental Health Clinic

### Patients (5+)
Sample patients with complete profiles including:
- Personal information
- Emergency contacts
- Blood type and allergies
- Campus assignment

### Appointments (4+)
Various appointment statuses:
- Scheduled
- Completed
- Cancelled

### Medical Records (2+)
Complete medical records with:
- Vital signs
- Diagnosis
- Treatment plans
- Follow-up notes

### Lab Requests (3+)
Different test types and statuses:
- Pending
- In Progress
- Completed

### Prescriptions (2+)
Active and dispensed prescriptions with medication details

### Referrals (2+)
Referrals to external specialists

### Bills (3+)
Bills with various payment statuses:
- Paid
- Pending
- Partial

## API Functions

All mock API functions are exported from `src/utils/mockApi.js`:

### Authentication
```javascript
mockLogin(credentials)
mockGetCurrentUser(token)
mockChangePassword(token, { currentPassword, newPassword })
```

### Campus & Clinics
```javascript
mockGetCampuses()
mockGetCampusById(campusId)
mockCreateCampus(token, campusData)
mockUpdateCampus(token, campusId, campusData)
mockGetClinics(campusId?)
mockCreateClinic(token, clinicData)
mockUpdateClinic(token, clinicId, clinicData)
mockToggleClinicStatus(token, clinicId)
```

### Patients
```javascript
mockGetPatients(searchParams?)
mockGetPatientById(patientId)
mockCreatePatient(token, patientData)
mockUpdatePatient(token, patientId, patientData)
mockBulkImportPatients(token, patientsData)
mockGetPatientMedicalHistory(patientId)
```

### Appointments
```javascript
mockGetAppointments(searchParams?)
mockGetAppointmentById(appointmentId)
mockCreateAppointment(token, appointmentData)
mockUpdateAppointmentStatus(token, appointmentId, status)
mockCancelAppointment(token, appointmentId, reason)
mockBulkCreateAppointments(token, appointmentsData)
```

### Medical Records
```javascript
mockGetMedicalRecords(searchParams?)
mockGetMedicalRecordById(recordId)
mockCreateMedicalRecord(token, recordData)
mockUpdateMedicalRecord(token, recordId, recordData)
mockAddFollowUpNotes(token, recordId, notes)
```

### Lab Requests
```javascript
mockGetLabRequests(searchParams?)
mockGetLabRequestById(requestId)
mockCreateLabRequest(token, requestData)
mockUpdateLabRequestStatus(token, requestId, status)
mockAddLabResults(token, requestId, results)
```

### Prescriptions
```javascript
mockGetPrescriptions(searchParams?)
mockGetPrescriptionById(prescriptionId)
mockCreatePrescription(token, prescriptionData)
mockUpdatePrescription(token, prescriptionId, prescriptionData)
mockRefillPrescription(token, prescriptionId)
```

### Referrals
```javascript
mockGetReferrals(searchParams?)
mockGetReferralById(referralId)
mockCreateReferral(token, referralData)
mockUpdateReferralStatus(token, referralId, status)
```

### Billing
```javascript
mockGetBills(searchParams?)
mockGetBillById(billId)
mockCreateBill(token, billData)
mockAddPayment(token, billId, paymentData)
mockGetFinancialReports(searchParams?)
```

### Staff Schedules
```javascript
mockGetStaffSchedules(searchParams?)
mockCreateStaffSchedule(token, scheduleData)
mockBulkCreateSchedules(token, schedulesData)
```

### Notifications
```javascript
mockGetNotifications(userId)
mockCreateNotification(token, notificationData)
mockMarkNotificationAsRead(token, notificationId)
```

### Audit Logs
```javascript
mockGetAuditLogs(searchParams?)
```

## Data Persistence

The mock API uses localStorage to persist data across browser sessions:

- Data is automatically saved after every create/update/delete operation
- Data is initialized from `mockData.js` on first load
- To reset all data, use: `resetMockData()` function

## Switching to Real Backend

To switch from mock API to real backend:

1. Update `.env`:
   ```env
   VITE_USE_MOCK_API=false
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

2. Restart the development server

The `AuthContext` automatically detects the `VITE_USE_MOCK_API` environment variable and routes requests accordingly.

## Development Workflow

1. **Frontend Development**: Use mock API for rapid UI development
2. **Testing**: Test with various user roles and scenarios
3. **Integration**: Switch to real backend when ready
4. **Debugging**: Use browser DevTools to inspect localStorage data

## Troubleshooting

### Data Not Persisting
- Check browser localStorage is enabled
- Clear localStorage and reload to reinitialize

### Login Issues
- Verify credentials match sample credentials above
- Check console for error messages

### Missing Data
- Call `resetMockData()` in browser console to reinitialize all data
- Check if localStorage quota is exceeded

## Files

- **`src/utils/mockApi.js`**: All mock API functions
- **`src/utils/mockData.js`**: Sample data definitions
- **`src/context/AuthContext.js`**: Authentication context with mock API integration
- **`frontend/.env`**: Environment configuration
