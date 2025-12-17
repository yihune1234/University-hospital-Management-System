# University Clinic Management System - Complete User Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [Role-Based Workflows](#role-based-workflows)
4. [Complete Patient Journey](#complete-patient-journey)
5. [Module-by-Module Guide](#module-by-module-guide)
6. [Troubleshooting](#troubleshooting)

---

## System Overview

### What is UCMS?
The University Clinic Management System (UCMS) is a comprehensive healthcare management platform designed for university clinics. It manages the complete patient journey from registration to billing.

### Key Features
- ✅ Patient registration and management
- ✅ Appointment scheduling
- ✅ Queue management with auto-numbering
- ✅ Vital signs recording
- ✅ Medical records and diagnosis
- ✅ Lab test requests and results
- ✅ Prescription management
- ✅ Pharmacy inventory
- ✅ Billing and payments
- ✅ Reports and analytics
- ✅ Audit logging

### User Roles
1. **Admin** - System configuration, staff management, reports
2. **Receptionist** - Patient registration, appointments, queue management
3. **Nurse** - Vitals recording, patient queue, medical records
4. **Doctor** - Diagnosis, prescriptions, lab requests, referrals
5. **Lab Technician** - Lab test processing and results
6. **Pharmacist** - Prescription dispensing, inventory management

---

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection
- Login credentials provided by administrator

### First Time Login
1. Open browser and navigate to system URL
2. Enter your email and password
3. Click "Login"
4. You'll be redirected to your role-specific dashboard

### Default Login Credentials (Testing)
```
Admin:        admin@university.edu / password123
Receptionist: reception@university.edu / password123
Doctor:       doctor@university.edu / password123
Nurse:        nurse@university.edu / password123
Lab Tech:     labtech@university.edu / password123
Pharmacist:   pharmacist@university.edu / password123
```

**⚠️ IMPORTANT:** Change default passwords after first login!

---

## Role-Based Workflows

### 1. RECEPTIONIST Workflow

#### A. Register New Patient
**When:** Patient visits clinic for the first time

**Steps:**
1. Login as Receptionist
2. Go to **"Patient Management"** module
3. Click **"Register New Patient"** button (if available) OR
4. If patient exists, search for them
5. Fill in patient information:
   - First Name, Middle Name, Last Name
   - University ID
   - Date of Birth
   - Gender
   - Contact Number
   - Email
   - Address
   - Campus
6. Click **"Register"** or **"Save"**
7. Patient is now in the system

#### B. Add Patient to Queue (Walk-in)
**When:** Patient arrives without appointment

**Steps:**
1. Go to **"Patient Management"** module
2. **Search for patient:**
   - Type patient name, ID, or contact in search box
   - Click **"Search"** or press Enter
3. Find patient in results
4. Click **"➕ Add to Queue"** button next to patient name
5. **Fill Queue Form:**
   - **Select Clinic** (required) - Choose which clinic
   - **Select Doctor** (required) - Choose available doctor
   - **Select Room** (optional) - Choose consultation room
   - **Appointment Time** - Auto-filled with current time (can edit)
   - **Reason for Visit** - Enter why patient is visiting
6. Click **"✅ Add to Queue"**
7. Success message appears
8. Patient receives queue number automatically (e.g., #1, #2, #3...)

#### C. Schedule Future Appointment
**When:** Patient wants to book appointment for later date

**Steps:**
1. Search for patient in Patient Management
2. Click **"Schedule Appointment"** button (📅)
3. Fill appointment details:
   - Appointment Date (future date)
   - Appointment Time
   - Clinic
   - Doctor
   - Room
   - Reason
4. Click **"Schedule"**
5. Patient receives appointment confirmation

#### D. Manage Queue
**When:** Monitoring patient flow

**Steps:**
1. Go to **"Queue Management"** module
2. **Select Clinic** from dropdown
3. View queue statistics:
   - Total in Queue
   - Waiting Count
   - In Service Count
   - Completed Count
   - Average Wait Time
4. **Call Next Patient:**
   - Click **"📢 Call Next Patient"** button
   - System shows patient name and queue number
   - Patient status changes to "In-Service"
5. **Manual Status Update:**
   - Click **"▶️ Start"** to begin service
   - Click **"✅ Complete"** when done
6. **Auto-refresh** enabled by default (30 seconds)

---

### 2. NURSE Workflow

#### A. View Patient Queue
**When:** Starting shift or checking patients

**Steps:**
1. Login as Nurse
2. Go to **"Patient Queue"** module
3. View all patients waiting
4. See queue numbers and status

#### B. Record Vital Signs
**When:** Patient called from queue

**Steps:**
1. Go to **"Vitals Recording"** module
2. **Search for patient:**
   - Enter patient name or ID
   - Click search
3. Click **"Record Vitals"** for patient
4. **Enter vital signs:**
   - Blood Pressure (e.g., 120/80)
   - Temperature (°C or °F)
   - Pulse Rate (bpm)
   - Weight (kg)
   - Height (cm)
   - Respiratory Rate
   - Oxygen Saturation (SpO2)
5. Add notes if needed
6. Click **"Save Vitals"**
7. Vitals are now available for doctor

#### C. Update Queue Status
**When:** Patient ready for doctor

**Steps:**
1. Go to **"Patient Queue"**
2. Find patient in list
3. Click **"✅ Complete"** after vitals recorded
4. Patient moves to doctor's queue

---

### 3. DOCTOR Workflow

#### A. View Patient Queue
**When:** Ready to see patients

**Steps:**
1. Login as Doctor
2. Dashboard shows your patient queue
3. View patients waiting with vitals recorded

#### B. Review Patient Information
**When:** Before consultation

**Steps:**
1. Click on patient in queue
2. Review:
   - Patient demographics
   - Recent vitals
   - Medical history
   - Previous diagnoses
   - Current medications
   - Allergies

#### C. Create Medical Record
**When:** During/after consultation

**Steps:**
1. Go to **"Medical Records"** module
2. Select patient
3. Click **"Create New Record"**
4. **Fill medical record:**
   - Chief Complaint
   - History of Present Illness
   - Physical Examination findings
   - Diagnosis (ICD codes if available)
   - Treatment Plan
   - Notes
5. Click **"Save Record"**

#### D. Create Prescription
**When:** Patient needs medication

**Steps:**
1. In patient view, click **"Create Prescription"**
2. **Add medications:**
   - Search medication name
   - Select from list
   - Enter dosage (e.g., "500mg")
   - Enter frequency (e.g., "Twice daily")
   - Enter duration (e.g., "7 days")
   - Add instructions (e.g., "Take after meals")
3. Click **"Add Medication"** for each drug
4. Review prescription
5. Click **"Save Prescription"**
6. Prescription sent to pharmacy

#### E. Request Lab Tests
**When:** Patient needs laboratory tests

**Steps:**
1. Click **"Request Lab Test"**
2. **Select tests:**
   - Complete Blood Count (CBC)
   - Blood Sugar
   - Urinalysis
   - X-Ray
   - ECG
   - etc.
3. Add special instructions
4. Click **"Submit Request"**
5. Lab receives request

#### F. Create Referral
**When:** Patient needs specialist

**Steps:**
1. Click **"Create Referral"**
2. **Fill referral form:**
   - Specialist type
   - Facility/Hospital
   - Reason for referral
   - Urgency level
   - Notes
3. Click **"Submit Referral"**
4. Referral letter generated

#### G. Generate Bill
**When:** Consultation complete

**Steps:**
1. Click **"Generate Bill"**
2. System auto-calculates:
   - Consultation fee
   - Lab test fees
   - Medication costs
   - Other charges
3. Review total
4. Click **"Generate"**
5. Bill sent to patient/receptionist

---

### 4. LAB TECHNICIAN Workflow

#### A. View Lab Requests
**When:** Starting work or checking pending tests

**Steps:**
1. Login as Lab Technician
2. Dashboard shows pending lab requests
3. View by status:
   - Pending
   - In Progress
   - Completed

#### B. Process Lab Test
**When:** Performing test

**Steps:**
1. Click on lab request
2. Click **"Start Processing"**
3. Status changes to "In Progress"
4. Perform laboratory test
5. Record results

#### C. Enter Lab Results
**When:** Test complete

**Steps:**
1. Open lab request
2. Click **"Enter Results"**
3. **Fill results form:**
   - Test values
   - Normal ranges
   - Observations
   - Technician notes
4. Upload images if needed (X-rays, etc.)
5. Click **"Submit Results"**
6. Status changes to "Completed"
7. Doctor receives notification

---

### 5. PHARMACIST Workflow

#### A. View Prescriptions
**When:** Patient arrives at pharmacy

**Steps:**
1. Login as Pharmacist
2. Dashboard shows pending prescriptions
3. Search by patient name or prescription ID

#### B. Dispense Medication
**When:** Filling prescription

**Steps:**
1. Click on prescription
2. Review medications and dosages
3. **Check inventory:**
   - Verify stock availability
   - Check expiry dates
4. Click **"Dispense"** for each medication
5. **Enter dispensing details:**
   - Quantity dispensed
   - Batch number
   - Expiry date
   - Instructions given to patient
6. Click **"Complete Dispensing"**
7. Prescription marked as "Dispensed"

#### C. Manage Inventory
**When:** Checking stock levels

**Steps:**
1. Go to **"Inventory Management"**
2. View all medications
3. Check stock levels
4. **Add new stock:**
   - Click **"Add Stock"**
   - Enter medication details
   - Enter quantity
   - Enter batch number and expiry
   - Click **"Save"**
5. **Low stock alerts** shown automatically

---

### 6. ADMIN Workflow

#### A. Manage Staff
**When:** Adding/editing staff members

**Steps:**
1. Login as Admin
2. Go to **"Staff Management"**
3. **Add new staff:**
   - Click **"Add Staff"**
   - Fill details (name, role, contact, email)
   - Set password
   - Assign clinic
   - Click **"Save"**
4. **Edit staff:**
   - Click edit icon
   - Update information
   - Click **"Update"**

#### B. Manage Clinics
**When:** Setting up clinics

**Steps:**
1. Go to **"Clinic Management"**
2. **Add clinic:**
   - Select campus
   - Enter clinic name
   - Set operating hours
   - Click **"Create"**
3. **Manage rooms:**
   - Go to **"Room Management"**
   - Add consultation rooms
   - Assign to clinics

#### C. View Reports
**When:** Analyzing performance

**Steps:**
1. Go to **"Reports & Analytics"**
2. **Select report type:**
   - Dashboard Overview (all metrics)
   - Patient Reports
   - Financial Reports
   - Appointment Reports
   - Staff Reports
   - Audit Logs
3. **Set date range**
4. Click **"Generate Report"**
5. **Export if needed:**
   - Click **"📥 Export"**
   - Choose format (CSV, PDF)
   - Download file

---

## Complete Patient Journey

### Scenario: Walk-in Patient with Flu Symptoms

#### Step 1: Patient Arrival (Receptionist)
```
Time: 9:00 AM
Action: Patient walks into clinic
```
1. Receptionist searches for patient: "John Doe"
2. Patient found in system
3. Click **"➕ Add to Queue"**
4. Fill form:
   - Clinic: General Medicine
   - Doctor: Dr. Smith
   - Room: Consultation Room 1
   - Reason: "Flu symptoms - fever, cough"
5. Submit
6. **Patient receives Queue #5**

#### Step 2: Waiting (Patient)
```
Time: 9:05 AM - 9:20 AM
Status: Waiting in queue
```
- Patient sits in waiting area
- Can see queue number on display screen
- Receptionist monitors queue progress

#### Step 3: Called to Nurse (Receptionist/Nurse)
```
Time: 9:20 AM
Action: Receptionist calls next patient
```
1. Receptionist clicks **"📢 Call Next Patient"**
2. System shows: "Queue #5 - John Doe"
3. Patient goes to nurse station
4. Status: "In-Service"

#### Step 4: Vitals Recording (Nurse)
```
Time: 9:20 AM - 9:25 AM
Action: Nurse records vital signs
```
1. Nurse searches "John Doe"
2. Click **"Record Vitals"**
3. Enter:
   - BP: 120/80
   - Temp: 38.5°C (fever)
   - Pulse: 88 bpm
   - Weight: 70 kg
4. Save vitals
5. Patient sent to doctor's queue

#### Step 5: Doctor Consultation (Doctor)
```
Time: 9:30 AM - 9:45 AM
Action: Doctor examines patient
```
1. Doctor sees John Doe in queue
2. Reviews vitals (sees fever)
3. Examines patient
4. **Creates Medical Record:**
   - Diagnosis: "Acute Upper Respiratory Tract Infection"
   - Treatment: "Rest, fluids, medication"
5. **Creates Prescription:**
   - Paracetamol 500mg - 3x daily - 5 days
   - Amoxicillin 500mg - 3x daily - 7 days
   - Cough syrup - as needed
6. **Requests Lab Test:**
   - Complete Blood Count (CBC)
7. **Generates Bill:**
   - Consultation: $20
   - Lab test: $15
   - Medications: $25
   - Total: $60

#### Step 6: Lab Test (Lab Technician)
```
Time: 9:50 AM - 10:30 AM
Action: Blood sample collection and testing
```
1. Lab tech sees CBC request for John Doe
2. Collects blood sample
3. Processes test
4. Enters results:
   - WBC: Slightly elevated (infection)
   - Other values normal
5. Submits results
6. Doctor receives notification

#### Step 7: Pharmacy (Pharmacist)
```
Time: 10:00 AM
Action: Patient picks up medications
```
1. Pharmacist sees prescription for John Doe
2. Checks inventory (all available)
3. Dispenses medications:
   - Paracetamol - 15 tablets
   - Amoxicillin - 21 tablets
   - Cough syrup - 1 bottle
4. Gives instructions to patient
5. Marks prescription as "Dispensed"

#### Step 8: Payment (Receptionist)
```
Time: 10:05 AM
Action: Patient pays bill
```
1. Receptionist retrieves bill
2. Patient pays $60
3. Payment recorded
4. Receipt printed
5. Patient leaves

#### Step 9: Follow-up (Optional)
```
Time: 3 days later
Action: Patient returns if not better
```
- Same process
- Doctor reviews previous records
- Adjusts treatment if needed

---

## Module-by-Module Guide

### Patient Management Module

#### Features
- Search patients
- View patient details
- Register new patients
- Add to queue
- Schedule appointments

#### Search Tips
- Search by: Name, Patient ID, University ID, Contact
- Use partial names (e.g., "John" finds "John Doe")
- Case-insensitive search
- Click "Show All" to see all patients

#### Quick Actions
- 👁️ View Details - See full patient information
- ➕ Add to Queue - Add patient to today's queue
- 📅 Schedule - Book future appointment

---

### Queue Management Module

#### Understanding Queue Numbers
- **Auto-generated:** System assigns next number (1, 2, 3...)
- **Daily reset:** Numbers start from 1 each day
- **Sequential:** Patients called in order
- **Visible:** Large display for easy viewing

#### Queue Status Colors
- 🟡 **Yellow (Waiting):** Patient checked in, waiting
- 🔵 **Blue (In-Service):** Currently being attended
- 🟢 **Green (Completed):** Service finished

#### Best Practices
- Keep auto-refresh ON for real-time updates
- Call patients in order (use "Call Next")
- Update status promptly
- Monitor average wait time

---

### Vitals Recording Module

#### Standard Vital Signs
| Vital | Normal Range | Unit |
|-------|-------------|------|
| Blood Pressure | 90/60 - 120/80 | mmHg |
| Temperature | 36.1 - 37.2 | °C |
| Pulse | 60 - 100 | bpm |
| Respiratory Rate | 12 - 20 | breaths/min |
| Oxygen Saturation | 95 - 100 | % |
| Weight | Varies | kg |

#### Tips
- Record all vitals for complete assessment
- Note abnormal values in comments
- Double-check critical values
- Save immediately after recording

---

### Medical Records Module

#### Components of Good Medical Record
1. **Chief Complaint:** Why patient came
2. **History:** When symptoms started, progression
3. **Examination:** Physical findings
4. **Diagnosis:** What's wrong (use ICD codes)
5. **Treatment:** What you're doing about it
6. **Plan:** Follow-up, referrals, tests

#### Documentation Tips
- Be specific and detailed
- Use medical terminology correctly
- Include relevant negatives
- Date and time all entries
- Sign/initial records

---

### Prescription Module

#### Creating Safe Prescriptions
1. **Verify patient allergies** before prescribing
2. **Check drug interactions** with current medications
3. **Use generic names** when possible
4. **Specify clearly:**
   - Drug name
   - Strength (mg, ml)
   - Dosage (how much)
   - Frequency (how often)
   - Duration (how long)
   - Route (oral, topical, etc.)
5. **Add instructions:** "Take with food", "Avoid alcohol"

#### Common Abbreviations
- PO: By mouth
- BID: Twice daily
- TID: Three times daily
- QID: Four times daily
- PRN: As needed
- AC: Before meals
- PC: After meals

---

### Lab Request Module

#### Common Lab Tests
- **CBC:** Complete Blood Count
- **BMP:** Basic Metabolic Panel
- **LFT:** Liver Function Tests
- **RFT:** Renal Function Tests
- **Urinalysis:** Urine test
- **Blood Sugar:** Glucose levels
- **Lipid Profile:** Cholesterol
- **X-Ray:** Imaging
- **ECG:** Heart rhythm

#### Request Tips
- Select appropriate tests for diagnosis
- Add clinical notes for lab tech
- Mark urgent if needed
- Follow up on results

---

### Reports & Analytics Module

#### Available Reports

**1. Dashboard Overview**
- All key metrics at a glance
- Last 30 days by default
- Quick performance snapshot

**2. Patient Reports**
- Total, new, active patients
- Demographics (age, gender)
- Registration trends
- Visit frequency

**3. Financial Reports**
- Revenue and collections
- Outstanding bills
- Payment methods
- Billing trends

**4. Appointment Reports**
- Appointment volume
- Completion rates
- No-show analysis
- Wait times by clinic

**5. Staff Reports**
- Performance metrics
- Utilization rates
- Workload distribution

**6. Audit Logs**
- All system activities
- User actions
- Security events
- Compliance tracking

#### Using Reports
1. Select report type
2. Set date range
3. Apply filters if needed
4. Click "Generate"
5. Review data
6. Export if needed (CSV, PDF)

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Cannot Login
**Symptoms:** Login fails, error message
**Solutions:**
1. Check username/email is correct
2. Verify password (case-sensitive)
3. Ensure Caps Lock is OFF
4. Clear browser cache
5. Try different browser
6. Contact admin to reset password

#### Issue: Patient Not Found
**Symptoms:** Search returns no results
**Solutions:**
1. Check spelling of name
2. Try searching by ID instead
3. Try partial name search
4. Click "Show All" to browse
5. Patient may not be registered yet
6. Register new patient if needed

#### Issue: Cannot Add to Queue
**Symptoms:** Error when adding patient to queue
**Solutions:**
1. Verify clinic is selected
2. Verify doctor is selected
3. Check if patient already in queue
4. Ensure appointment time is valid
5. Check internet connection
6. Refresh page and try again

#### Issue: Queue Not Updating
**Symptoms:** Queue doesn't show new patients
**Solutions:**
1. Click "Refresh" button
2. Enable auto-refresh
3. Check internet connection
4. Verify correct clinic selected
5. Clear browser cache
6. Reload page (F5)

#### Issue: Vitals Not Saving
**Symptoms:** Error when saving vital signs
**Solutions:**
1. Check all required fields filled
2. Verify values are in valid ranges
3. Check internet connection
4. Try saving again
5. Refresh page if needed
6. Contact IT if persists

#### Issue: Prescription Not Appearing in Pharmacy
**Symptoms:** Pharmacist can't see prescription
**Solutions:**
1. Verify prescription was saved
2. Check prescription status
3. Refresh pharmacy view
4. Search by patient name
5. Check if prescription was for different date
6. Contact doctor to verify

#### Issue: Lab Results Not Showing
**Symptoms:** Doctor can't see lab results
**Solutions:**
1. Verify lab tech submitted results
2. Check lab request status
3. Refresh medical records
4. Check correct patient selected
5. Verify test was completed
6. Contact lab if needed

#### Issue: Report Shows No Data
**Symptoms:** Report is empty or shows zeros
**Solutions:**
1. Check date range (data may not exist)
2. Expand date range
3. Verify filters are not too restrictive
4. Check if data exists in system
5. Try different report type
6. Contact admin if issue persists

---

## Best Practices

### For All Users

#### Security
- ✅ Never share your password
- ✅ Logout when leaving workstation
- ✅ Lock screen when away (Windows: Win+L)
- ✅ Change password regularly
- ✅ Report suspicious activity
- ✅ Don't write passwords down

#### Data Entry
- ✅ Double-check patient identity
- ✅ Verify information before saving
- ✅ Use proper spelling and grammar
- ✅ Be thorough and accurate
- ✅ Save work frequently
- ✅ Review before submitting

#### Communication
- ✅ Update status promptly
- ✅ Notify relevant staff of issues
- ✅ Document all actions
- ✅ Follow up on pending items
- ✅ Respond to notifications
- ✅ Coordinate with team

### For Receptionists
- Greet patients warmly
- Verify patient information
- Explain wait times
- Keep queue moving
- Monitor queue regularly
- Communicate delays

### For Nurses
- Record vitals accurately
- Note abnormal findings
- Prepare patient for doctor
- Update queue status
- Maintain clean workspace
- Follow infection control

### For Doctors
- Review patient history
- Document thoroughly
- Prescribe appropriately
- Order necessary tests
- Provide clear instructions
- Follow up on results

### For Lab Technicians
- Process requests promptly
- Maintain quality control
- Enter results accurately
- Flag abnormal values
- Maintain equipment
- Follow safety protocols

### For Pharmacists
- Verify prescriptions
- Check for interactions
- Counsel patients
- Maintain inventory
- Check expiry dates
- Document dispensing

### For Admins
- Monitor system performance
- Review reports regularly
- Manage staff access
- Backup data regularly
- Update system settings
- Train new users

---

## Quick Reference

### Keyboard Shortcuts
- **Ctrl/Cmd + R:** Refresh page
- **Tab:** Navigate between fields
- **Enter:** Submit form/search
- **Esc:** Close modal/dialog
- **Ctrl/Cmd + F:** Find on page

### Status Indicators
- 🟢 Active/Available
- 🟡 Pending/Waiting
- 🔵 In Progress
- 🟠 Warning/Attention
- 🔴 Error/Urgent
- ⚫ Inactive/Completed

### Common Actions
- 👁️ View/Details
- ✏️ Edit
- 🗑️ Delete
- ➕ Add/Create
- 📅 Schedule
- 🔄 Refresh
- 📥 Download/Export
- 📤 Upload
- 🔍 Search
- ⚙️ Settings

---

## Support

### Getting Help
1. **Check this guide** - Most answers are here
2. **Ask colleagues** - They may have experienced same issue
3. **Contact IT support** - For technical issues
4. **Contact admin** - For access/permission issues
5. **Report bugs** - Help improve the system

### Contact Information
- **IT Support:** [Your IT email/phone]
- **System Admin:** [Admin email/phone]
- **Emergency:** [Emergency contact]

### Feedback
We welcome your feedback to improve the system:
- Suggest new features
- Report bugs
- Share workflow improvements
- Request training

---

## Appendix

### Glossary of Terms
- **Queue:** Line of patients waiting for service
- **Vitals:** Basic health measurements
- **Diagnosis:** Medical condition identified
- **Prescription:** Medication order
- **Referral:** Sending patient to specialist
- **Billing:** Charging for services
- **Audit Log:** Record of system activities

### System Limits
- Max patients per day: Unlimited
- Max queue number: 999 (resets daily)
- Max prescription medications: 20 per prescription
- Max file upload size: 10MB
- Session timeout: 30 minutes inactive

### Data Retention
- Patient records: Permanent
- Appointments: 2 years
- Queue data: 90 days
- Audit logs: 1 year
- Reports: Generated on-demand

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Next Review:** March 2025

---

**Remember:** This system handles sensitive patient data. Always maintain confidentiality and follow HIPAA/data protection guidelines.
