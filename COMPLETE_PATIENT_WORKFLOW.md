# Complete Patient Workflow - University Clinic Management System

## Workflow Overview

```
START
  ↓
Register Patient
  ↓
Create Appointment
  ↓
┌─────────────────────┐
│ Is Walk-in Patient? │
└─────────────────────┘
  ↓              ↓
YES             NO
  ↓              ↓
Generate      Confirm
Queue Number  Appointment
  ↓              ↓
  └──────┬───────┘
         ↓
  Nurse Records Vitals
         ↓
  Doctor Reviews Vitals
         ↓
  Doctor Performs Diagnosis
         ↓
  ┌──────────────────────┐
  │ Lab Test Required?   │
  └──────────────────────┘
         ↓              ↓
        YES            NO
         ↓              ↓
  Create Lab Request    │
         ↓              │
  Process Lab Test      │
         ↓              │
  Record Lab Results    │
         ↓              │
         └──────┬───────┘
                ↓
  ┌──────────────────────────┐
  │ Prescription Needed?     │
  └──────────────────────────┘
         ↓              ↓
        YES            NO
         ↓              ↓
  Doctor Creates        │
  Prescription          │
         ↓              │
  Pharmacist Dispenses  │
  Medication            │
         ↓              │
         └──────┬───────┘
                ↓
         Generate Bill
                ↓
         Receive Payment
                ↓
      Update Payment Status
                ↓
      Log Activity to Audit Logs
                ↓
               END
```

## Detailed Workflow Steps

### 1. Register Patient (Receptionist)
**Location:** Receptionist Dashboard → Patient Management

**Actions:**
- Search for existing patient OR
- Click "Register New Patient"
- Fill patient information:
  - Personal details (name, DOB, gender)
  - Contact information (phone, email)
  - University ID
  - Campus affiliation
  - Emergency contact
- Submit registration

**System Actions:**
- Validate patient data
- Check for duplicates
- Generate patient ID
- Store in database
- Log activity in audit logs

---

### 2. Create Appointment (Receptionist)
**Location:** Receptionist Dashboard → Patient Management

**Actions:**
- Search for patient
- Click "Add to Queue" or "Schedule Appointment"
- Select:
  - Clinic
  - Doctor
  - Room (optional)
  - Appointment date/time
  - Reason for visit
- Submit appointment

**System Actions:**
- Create appointment record
- Assign appointment ID
- Set status to "Scheduled"
- Log activity

---

### 3. Decision: Walk-in or Scheduled?

#### IF Walk-in Patient (YES):
**Location:** Receptionist Dashboard → Queue Management

**Actions:**
- Patient arrives at clinic
- Receptionist adds to queue
- System generates queue number

**System Actions:**
- Auto-increment queue number (1, 2, 3...)
- Add to waiting_queue table
- Set status to "Waiting"
- Display on queue screen
- Log activity

**Queue Number Logic:**
```
Queue Number = MAX(today's queue numbers) + 1
Resets daily at midnight
```

#### IF Scheduled Appointment (NO):
**Location:** Receptionist Dashboard → Appointments

**Actions:**
- Patient arrives for scheduled appointment
- Receptionist confirms arrival
- Mark appointment as "Confirmed"

**System Actions:**
- Update appointment status
- Notify assigned doctor/nurse
- Log activity

---

### 4. Nurse Records Vitals (Nurse)
**Location:** Nurse Dashboard → Vitals Recording

**Actions:**
- View patient queue
- Select patient
- Record vitals:
  - Blood Pressure (e.g., 120/80)
  - Temperature (°C or °F)
  - Pulse (BPM)
  - Weight (kg or lbs)
  - Height (optional)
  - Notes
- Submit vitals

**System Actions:**
- Store vitals in database
- Link to patient and appointment
- Timestamp recording
- Update queue status to "In-Service"
- Notify doctor
- Log activity

---

### 5. Doctor Reviews Vitals (Doctor)
**Location:** Doctor Dashboard → Patient Queue

**Actions:**
- View assigned patients
- Click on patient
- Review recorded vitals
- Check patient history
- Review previous medical records

**System Actions:**
- Display vitals data
- Show medical history
- Display previous diagnoses
- Show current medications
- Log access

---

### 6. Doctor Performs Diagnosis (Doctor)
**Location:** Doctor Dashboard → Medical Records

**Actions:**
- Examine patient
- Enter diagnosis
- Document findings
- Add treatment notes
- Record observations

**System Actions:**
- Create medical record
- Link to appointment
- Store diagnosis
- Timestamp entry
- Log activity

---

### 7. Decision: Lab Test Required?

#### IF Lab Test Required (YES):

##### 7a. Create Lab Request (Doctor)
**Location:** Doctor Dashboard → Lab Requests

**Actions:**
- Click "Request Lab Test"
- Select test type:
  - Blood Test
  - Urine Test
  - X-Ray
  - ECG
  - Other
- Add instructions
- Mark as urgent (if needed)
- Submit request

**System Actions:**
- Create lab_request record
- Assign request ID
- Set status to "Pending"
- Notify lab technician
- Log activity

##### 7b. Process Lab Test (Lab Technician)
**Location:** Lab Tech Dashboard → Lab Requests

**Actions:**
- View pending requests
- Select request
- Update status to "In Progress"
- Perform test
- Enter results
- Upload reports (if any)
- Mark as "Completed"

**System Actions:**
- Update request status
- Store results
- Timestamp completion
- Notify doctor
- Log activity

##### 7c. Record Lab Results (Lab Technician)
**Location:** Lab Tech Dashboard → Lab Requests

**Actions:**
- Enter test results
- Add observations
- Upload images/reports
- Submit results

**System Actions:**
- Store results in database
- Link to patient and request
- Make available to doctor
- Log activity

#### IF No Lab Test (NO):
- Skip to next step

---

### 8. Decision: Prescription Needed?

#### IF Prescription Needed (YES):

##### 8a. Doctor Creates Prescription (Doctor)
**Location:** Doctor Dashboard → Prescriptions

**Actions:**
- Click "Create Prescription"
- Search and add medications:
  - Medication name
  - Dosage (e.g., 500mg)
  - Frequency (e.g., 2x daily)
  - Duration (e.g., 7 days)
  - Instructions
- Add multiple medications if needed
- Submit prescription

**System Actions:**
- Create prescription record
- Link medications
- Set status to "Pending"
- Notify pharmacy
- Log activity

##### 8b. Pharmacist Dispenses Medication (Pharmacist)
**Location:** Pharmacist Dashboard → Prescriptions

**Actions:**
- View pending prescriptions
- Verify prescription
- Check inventory
- Prepare medications
- Dispense to patient
- Update status to "Dispensed"
- Record quantity dispensed

**System Actions:**
- Update prescription status
- Reduce inventory
- Record dispensing
- Timestamp transaction
- Log activity

#### IF No Prescription (NO):
- Skip to next step

---

### 9. Generate Bill (Receptionist/Billing)
**Location:** Receptionist Dashboard → Billing

**Actions:**
- View completed consultation
- Click "Generate Bill"
- System auto-calculates:
  - Consultation fee
  - Lab test fees
  - Medication costs
  - Other charges
- Review total
- Generate bill

**System Actions:**
- Create billing record
- Calculate total amount
- Set status to "Pending"
- Generate bill ID
- Print/email bill
- Log activity

---

### 10. Receive Payment (Receptionist/Cashier)
**Location:** Receptionist Dashboard → Billing

**Actions:**
- View pending bills
- Select payment method:
  - Cash
  - Card
  - Insurance
  - Mobile Payment
- Enter amount paid
- Process payment
- Print receipt

**System Actions:**
- Record payment
- Update amount_paid
- Calculate balance
- Generate receipt
- Log transaction

---

### 11. Update Payment Status (System)
**Location:** Automatic

**System Actions:**
- Check if fully paid
- Update payment_status:
  - "Paid" if amount_paid >= total_amount
  - "Partial" if 0 < amount_paid < total_amount
  - "Pending" if amount_paid = 0
- Update appointment status to "Completed"
- Update queue status to "Completed"
- Log activity

---

### 12. Log Activity to Audit Logs (System)
**Location:** Automatic (All Steps)

**System Actions:**
- Record every action:
  - User ID
  - Action type (CREATE, UPDATE, DELETE)
  - Table name
  - Record ID
  - Old values
  - New values
  - IP address
  - Timestamp
- Store in audit_logs table
- Available for admin review

---

## Role-Based Workflow Summary

### Receptionist Workflow
1. ✅ Register Patient
2. ✅ Create Appointment
3. ✅ Add to Queue (Walk-in)
4. ✅ Confirm Appointment (Scheduled)
5. ✅ Generate Bill
6. ✅ Receive Payment

### Nurse Workflow
1. ✅ View Patient Queue
2. ✅ Record Vitals
3. ✅ Update Queue Status

### Doctor Workflow
1. ✅ Review Vitals
2. ✅ Perform Diagnosis
3. ✅ Create Medical Record
4. ✅ Request Lab Tests (if needed)
5. ✅ Create Prescription (if needed)

### Lab Technician Workflow
1. ✅ View Lab Requests
2. ✅ Process Tests
3. ✅ Record Results
4. ✅ Upload Reports

### Pharmacist Workflow
1. ✅ View Prescriptions
2. ✅ Verify Prescription
3. ✅ Dispense Medication
4. ✅ Update Inventory

### Admin Workflow
1. ✅ View All Activities
2. ✅ Review Audit Logs
3. ✅ Generate Reports
4. ✅ Manage Staff
5. ✅ Configure System

---

## Data Flow

### Patient Registration → Appointment
```
patients table
  ↓
appointments table
  ↓ (if walk-in)
waiting_queue table
```

### Vitals → Diagnosis
```
vitals table
  ↓
medical_records table
```

### Lab Request → Results
```
lab_requests table
  ↓
lab_results (in lab_requests)
```

### Prescription → Dispensing
```
prescriptions table
  ↓
prescription_medications table
  ↓
pharmacy_inventory table (update stock)
```

### Billing → Payment
```
billing table
  ↓
payment_transactions table
```

### All Actions → Audit
```
Any table modification
  ↓
audit_logs table
```

---

## Status Transitions

### Appointment Status
```
Scheduled → Confirmed → In-Progress → Completed → Cancelled
```

### Queue Status
```
Waiting → In-Service → Completed
```

### Lab Request Status
```
Pending → In Progress → Completed
```

### Prescription Status
```
Pending → Dispensed → Completed
```

### Payment Status
```
Pending → Partial → Paid
```

---

## Integration Points

### Frontend → Backend
- All actions use REST API
- JWT authentication required
- Role-based authorization
- Real-time updates via polling

### Database Triggers
- Auto-update timestamps
- Cascade deletes
- Foreign key constraints
- Audit log triggers

### Notifications
- Queue updates
- Lab results ready
- Prescription ready
- Payment received

---

## Error Handling

### Common Scenarios
1. **Patient not found** → Show search again
2. **Duplicate appointment** → Warn user
3. **No available queue number** → Generate next
4. **Lab test failed** → Allow retry
5. **Medication out of stock** → Notify pharmacist
6. **Payment failed** → Retry or alternative method

---

## Performance Considerations

### Optimization
- Index on patient_id, appointment_id
- Cache frequently accessed data
- Pagination for large lists
- Lazy loading for images
- Background jobs for reports

### Scalability
- Horizontal scaling for API
- Database replication
- Load balancing
- CDN for static assets

---

## Security Measures

### Authentication
- JWT tokens
- Session management
- Password hashing
- 2FA (optional)

### Authorization
- Role-based access control
- Permission checking
- Resource ownership validation

### Data Protection
- HTTPS only
- SQL injection prevention
- XSS protection
- CSRF tokens
- Input validation
- Output sanitization

### Audit Trail
- Complete activity logging
- IP address tracking
- User action history
- Compliance reporting

---

## Conclusion

This workflow ensures:
- ✅ Complete patient journey tracking
- ✅ Proper role separation
- ✅ Data integrity
- ✅ Audit compliance
- ✅ Efficient operations
- ✅ Patient safety
- ✅ Financial accuracy

Every step is logged, tracked, and auditable for compliance and quality assurance.
