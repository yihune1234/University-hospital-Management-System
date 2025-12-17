# University Clinic Management System - API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Request/Response Examples](#requestresponse-examples)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## Overview

### Base URL
```
Development: http://localhost:3000/api
Production:  https://yourdomain.com/api
```

### API Version
Current Version: **v1.0**

### Content Type
All requests and responses use JSON format:
```
Content-Type: application/json
```

### Authentication
Most endpoints require JWT authentication via Bearer token in Authorization header.

---

## Authentication

### Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@university.edu",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "staff_id": 1,
    "email": "user@university.edu",
    "first_name": "John",
    "last_name": "Doe",
    "role_name": "Doctor",
    "clinic_id": 1
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Invalid credentials"
}
```

### Change Password
**Endpoint:** `POST /auth/change-password`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

---

## API Endpoints

### Patient Management

#### Get All Patients
```http
GET /patients
Authorization: Bearer <token>
```

**Query Parameters:**
- `search` (optional): Search by name, ID, or contact
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Pagination offset

**Response:**
```json
[
  {
    "patient_id": 1,
    "university_id": "STU001",
    "first_name": "John",
    "last_name": "Doe",
    "gender": "Male",
    "date_of_birth": "2000-01-15",
    "contact": "1234567890",
    "email": "john@university.edu",
    "campus_name": "Main Campus"
  }
]
```

#### Get Patient by ID
```http
GET /patients/:patientId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "patient_id": 1,
  "university_id": "STU001",
  "first_name": "John",
  "middle_name": "Michael",
  "last_name": "Doe",
  "gender": "Male",
  "date_of_birth": "2000-01-15",
  "contact": "1234567890",
  "email": "john@university.edu",
  "address": "123 University Ave",
  "campus_id": 1,
  "campus_name": "Main Campus",
  "created_at": "2024-01-01T10:00:00.000Z"
}
```

#### Register New Patient
```http
POST /patients
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "university_id": "STU002",
  "first_name": "Jane",
  "middle_name": "Marie",
  "last_name": "Smith",
  "gender": "Female",
  "date_of_birth": "2001-05-20",
  "contact": "0987654321",
  "email": "jane@university.edu",
  "address": "456 College St",
  "campus_id": 1
}
```

**Response (201 Created):**
```json
{
  "message": "Patient registered successfully",
  "patient_id": 2
}
```

#### Update Patient
```http
PUT /patients/:patientId
Authorization: Bearer <token>
```

**Request Body:** (same as register, all fields optional)

**Response (200 OK):**
```json
{
  "message": "Patient updated successfully"
}
```

---

### Queue Management

#### Get Clinic Queue
```http
GET /clinics/:clinicId/queue
Authorization: Bearer <token>
```

**Response:**
```json
{
  "queue": [
    {
      "queue_id": 1,
      "queue_number": 5,
      "status": "Waiting",
      "patient_id": 1,
      "patient_name": "John Doe",
      "phone_number": "1234567890",
      "appointment_time": "14:30:00",
      "doctor_name": "Dr. Smith",
      "room_name": "Room 101",
      "reason": "General checkup",
      "check_in_time": "2024-12-17T14:25:00.000Z"
    }
  ],
  "statistics": {
    "total_queue": 10,
    "waiting_count": 5,
    "in_service_count": 2,
    "completed_count": 3,
    "avg_wait_time_minutes": 15.5
  }
}
```

#### Add Patient to Queue
```http
POST /queue
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "appointmentId": 123
}
```

**Response (201 Created):**
```json
{
  "message": "Patient added to queue successfully",
  "queue": {
    "queue_id": 1,
    "queue_number": 6,
    "status": "Waiting"
  }
}
```

#### Call Next Patient
```http
POST /clinics/:clinicId/queue/next
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Next patient called successfully",
  "patient": {
    "queue_id": 1,
    "queue_number": 5,
    "patient_name": "John Doe",
    "room_name": "Room 101"
  }
}
```

**Response (No patients):**
```json
{
  "message": "No patients waiting in queue",
  "patient": null
}
```

#### Update Queue Status
```http
PATCH /queue/:queueId/status
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "In-Service"
}
```

**Valid statuses:** `Waiting`, `In-Service`, `Completed`

**Response (200 OK):**
```json
{
  "message": "Queue status updated successfully"
}
```

#### Remove from Queue
```http
DELETE /queue/:queueId
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Patient removed from queue successfully"
}
```

---

### Appointment Management

#### Create Appointment
```http
POST /appointments
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "patient_id": 1,
  "clinic_id": 1,
  "doctor_id": 5,
  "room_id": 2,
  "appointment_date": "2024-12-20",
  "appointment_time": "14:30",
  "reason": "Follow-up consultation",
  "status": "Scheduled"
}
```

**Response (201 Created):**
```json
{
  "message": "Appointment created successfully",
  "appointment_id": 123
}
```

#### Get Appointments
```http
GET /appointments
Authorization: Bearer <token>
```

**Query Parameters:**
- `patientId` (optional): Filter by patient
- `doctorId` (optional): Filter by doctor
- `clinicId` (optional): Filter by clinic
- `date` (optional): Filter by date (YYYY-MM-DD)
- `status` (optional): Filter by status

**Response:**
```json
[
  {
    "appointment_id": 123,
    "patient_name": "John Doe",
    "doctor_name": "Dr. Smith",
    "clinic_name": "General Medicine",
    "appointment_date": "2024-12-20",
    "appointment_time": "14:30:00",
    "reason": "Follow-up consultation",
    "status": "Scheduled"
  }
]
```

#### Update Appointment Status
```http
PATCH /appointments/:appointmentId/status
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "Completed"
}
```

**Valid statuses:** `Scheduled`, `Confirmed`, `In-Progress`, `Completed`, `Cancelled`, `No-Show`

---

### Vitals Management

#### Record Vitals
```http
POST /vitals
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "patient_id": 1,
  "blood_pressure": "120/80",
  "temperature": 37.2,
  "pulse": 75,
  "weight": 70.5,
  "height": 175,
  "respiratory_rate": 16,
  "oxygen_saturation": 98,
  "room_id": 2,
  "notes": "Patient appears healthy"
}
```

**Response (201 Created):**
```json
{
  "message": "Vitals recorded successfully",
  "vitals_id": 456
}
```

#### Get Patient Vitals
```http
GET /patients/:patientId/vitals
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of records (default: 10)

**Response:**
```json
[
  {
    "vitals_id": 456,
    "blood_pressure": "120/80",
    "temperature": 37.2,
    "pulse": 75,
    "weight": 70.5,
    "recorded_by": "Nurse Jane",
    "recorded_at": "2024-12-17T14:30:00.000Z",
    "notes": "Patient appears healthy"
  }
]
```

---

### Medical Records

#### Create Medical Record
```http
POST /medical-records
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "patient_id": 1,
  "appointment_id": 123,
  "diagnosis": "Acute Upper Respiratory Tract Infection",
  "treatment": "Rest, fluids, medication as prescribed",
  "notes": "Patient advised to return if symptoms worsen",
  "visit_date": "2024-12-17"
}
```

**Response (201 Created):**
```json
{
  "message": "Medical record created successfully",
  "record_id": 789
}
```

#### Get Patient Medical Records
```http
GET /patients/:patientId/medical-records
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "record_id": 789,
    "diagnosis": "Acute Upper Respiratory Tract Infection",
    "treatment": "Rest, fluids, medication as prescribed",
    "doctor_name": "Dr. Smith",
    "visit_date": "2024-12-17",
    "created_at": "2024-12-17T15:00:00.000Z"
  }
]
```

---

### Prescription Management

#### Create Prescription
```http
POST /prescriptions
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "patient_id": 1,
  "appointment_id": 123,
  "medications": [
    {
      "medication_name": "Paracetamol",
      "dosage": "500mg",
      "frequency": "3 times daily",
      "duration": "5 days",
      "instructions": "Take after meals"
    },
    {
      "medication_name": "Amoxicillin",
      "dosage": "500mg",
      "frequency": "3 times daily",
      "duration": "7 days",
      "instructions": "Complete full course"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "message": "Prescription created successfully",
  "prescription_id": 321
}
```

#### Get Prescriptions
```http
GET /prescriptions
Authorization: Bearer <token>
```

**Query Parameters:**
- `patientId` (optional): Filter by patient
- `status` (optional): Filter by status (Pending, Dispensed)

**Response:**
```json
[
  {
    "prescription_id": 321,
    "patient_name": "John Doe",
    "doctor_name": "Dr. Smith",
    "status": "Pending",
    "created_at": "2024-12-17T15:00:00.000Z",
    "medications": [
      {
        "medication_name": "Paracetamol",
        "dosage": "500mg",
        "frequency": "3 times daily",
        "duration": "5 days"
      }
    ]
  }
]
```

#### Update Prescription Status
```http
PATCH /prescriptions/:prescriptionId/status
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "Dispensed"
}
```

---

### Lab Request Management

#### Create Lab Request
```http
POST /lab-requests
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "patient_id": 1,
  "appointment_id": 123,
  "test_type": "Complete Blood Count",
  "priority": "Normal",
  "notes": "Check for infection markers"
}
```

**Response (201 Created):**
```json
{
  "message": "Lab request created successfully",
  "request_id": 654
}
```

#### Get Lab Requests
```http
GET /lab-requests
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Pending, In Progress, Completed
- `patientId` (optional): Filter by patient

**Response:**
```json
[
  {
    "request_id": 654,
    "patient_name": "John Doe",
    "test_type": "Complete Blood Count",
    "status": "Pending",
    "priority": "Normal",
    "requested_at": "2024-12-17T15:00:00.000Z"
  }
]
```

#### Update Lab Request Status
```http
PATCH /lab-requests/:requestId/status
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "In Progress"
}
```

#### Submit Lab Results
```http
POST /lab-requests/:requestId/results
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "results": "WBC: 12,000/μL (elevated), RBC: Normal, Platelets: Normal",
  "notes": "Indicates possible infection",
  "attachments": []
}
```

---

### Reports & Analytics

#### Patient Overview Report
```http
GET /reports/patients/overview
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (required): YYYY-MM-DD
- `endDate` (required): YYYY-MM-DD

**Response:**
```json
{
  "totalPatients": 1500,
  "newPatients": 50,
  "activePatients": 200
}
```

#### Financial Overview Report
```http
GET /reports/financial/overview
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (required): YYYY-MM-DD
- `endDate` (required): YYYY-MM-DD

**Response:**
```json
{
  "total_revenue": 50000.00,
  "total_collected": 45000.00,
  "total_outstanding": 5000.00,
  "total_bills": 250
}
```

#### Appointment Overview Report
```http
GET /reports/appointments/overview
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_appointments": 300,
  "completed": 250,
  "cancelled": 30,
  "no_shows": 20,
  "scheduled": 50
}
```

#### Audit Logs
```http
GET /reports/audit-logs
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `userId` (optional): Filter by user
- `action` (optional): CREATE, UPDATE, DELETE, LOGIN, LOGOUT
- `limit` (optional): Records per page (default: 100)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "logs": [
    {
      "log_id": 1,
      "user_name": "Dr. Smith",
      "role_name": "Doctor",
      "action": "CREATE",
      "table_name": "prescriptions",
      "record_id": 321,
      "ip_address": "192.168.1.100",
      "created_at": "2024-12-17T15:00:00.000Z"
    }
  ],
  "total": 1000,
  "limit": 100,
  "offset": 0
}
```

---

### Admin Endpoints

#### Get All Staff
```http
GET /admin/staff
Authorization: Bearer <token>
Role: Admin
```

**Response:**
```json
[
  {
    "staff_id": 1,
    "first_name": "John",
    "last_name": "Smith",
    "role_name": "Doctor",
    "email": "doctor@university.edu",
    "clinic_name": "General Medicine",
    "is_active": 1
  }
]
```

#### Create Staff
```http
POST /admin/staff
Authorization: Bearer <token>
Role: Admin
```

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "role_id": 2,
  "clinic_id": 1,
  "email": "jane.doe@university.edu",
  "password": "temporaryPassword123",
  "contact": "1234567890"
}
```

#### Get All Campuses
```http
GET /admin/campuses
Authorization: Bearer <token>
Role: Admin
```

#### Create Campus
```http
POST /admin/campuses
Authorization: Bearer <token>
Role: Admin
```

**Request Body:**
```json
{
  "campus_name": "North Campus",
  "location": "123 University Ave"
}
```

#### Get Clinics by Campus
```http
GET /admin/campuses/:campusId/clinics
Authorization: Bearer <token>
```

#### Create Clinic
```http
POST /admin/clinics
Authorization: Bearer <token>
Role: Admin
```

**Request Body:**
```json
{
  "campus_id": 1,
  "clinic_name": "Dental Clinic",
  "clinic_type": "Specialized",
  "open_time": "08:00",
  "close_time": "17:00"
}
```

---

## Error Handling

### Error Response Format
```json
{
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry or conflict |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server error |

### Common Error Messages

**Authentication Errors:**
```json
{
  "message": "No token provided"
}
```

```json
{
  "message": "Invalid or expired token"
}
```

**Validation Errors:**
```json
{
  "message": "Validation error",
  "errors": [
    "Email is required",
    "Password must be at least 8 characters"
  ]
}
```

**Not Found:**
```json
{
  "message": "Patient not found"
}
```

**Duplicate Entry:**
```json
{
  "message": "Patient already in queue"
}
```

---

## Rate Limiting

### Limits
- **General endpoints:** 100 requests per minute per IP
- **Authentication:** 5 login attempts per minute per IP
- **Reports:** 10 requests per minute per user

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702828800
```

### Rate Limit Exceeded Response
```json
{
  "message": "Too many requests, please try again later"
}
```

**Status Code:** 429 Too Many Requests

---

## Pagination

### Query Parameters
- `limit`: Number of results per page (default: 100, max: 1000)
- `offset`: Number of results to skip

### Example
```http
GET /patients?limit=50&offset=100
```

### Response Headers
```
X-Total-Count: 1500
X-Page-Size: 50
X-Page-Offset: 100
```

---

## Filtering & Sorting

### Filtering
Use query parameters:
```http
GET /appointments?status=Scheduled&date=2024-12-17
```

### Sorting
```http
GET /patients?sortBy=last_name&order=asc
```

**Valid sort orders:** `asc`, `desc`

---

## Webhooks (Future Feature)

### Event Types
- `patient.created`
- `appointment.scheduled`
- `prescription.created`
- `lab.result.ready`
- `queue.patient.called`

### Webhook Payload Example
```json
{
  "event": "prescription.created",
  "timestamp": "2024-12-17T15:00:00.000Z",
  "data": {
    "prescription_id": 321,
    "patient_id": 1,
    "doctor_id": 5
  }
}
```

---

## SDK & Client Libraries

### JavaScript/Node.js
```javascript
const ClinicAPI = require('clinic-api-client');

const client = new ClinicAPI({
  baseURL: 'http://localhost:3000/api',
  token: 'your-jwt-token'
});

// Get patients
const patients = await client.patients.getAll();

// Add to queue
await client.queue.add({ appointmentId: 123 });
```

### Python
```python
from clinic_api import ClinicClient

client = ClinicClient(
    base_url='http://localhost:3000/api',
    token='your-jwt-token'
)

# Get patients
patients = client.patients.get_all()

# Add to queue
client.queue.add(appointment_id=123)
```

---

## Testing

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@university.edu","password":"password123"}'
```

**Get Patients:**
```bash
curl -X GET http://localhost:3000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Add to Queue:**
```bash
curl -X POST http://localhost:3000/api/queue \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"appointmentId":123}'
```

### Using Postman

1. Import API collection
2. Set environment variables:
   - `baseURL`: http://localhost:3000/api
   - `token`: (obtained from login)
3. Use {{baseURL}} and {{token}} in requests

---

## Changelog

### Version 1.0 (December 2024)
- Initial API release
- Patient management endpoints
- Queue management system
- Appointment scheduling
- Medical records
- Prescriptions
- Lab requests
- Reports & analytics
- Admin endpoints

---

**API Version:** 1.0  
**Last Updated:** December 2024  
**Maintained By:** Development Team
