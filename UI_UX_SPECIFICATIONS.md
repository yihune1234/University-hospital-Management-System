# University Clinic Management System - UI/UX Specifications

## Document Overview
This document provides complete UI/UX specifications for all user roles, including pages, forms, fields, validation rules, and business logic. Follow these specifications to ensure consistent user experience across the system.

---

## Table of Contents
1. [Receptionist UI](#receptionist-ui)
2. [Nurse UI](#nurse-ui)
3. [Doctor UI](#doctor-ui)
4. [Lab Technician UI](#lab-technician-ui)
5. [Pharmacist UI](#pharmacist-ui)
6. [Admin UI](#admin-ui)
7. [Common UI Components](#common-ui-components)
8. [Validation Rules](#validation-rules)

---

## 1. RECEPTIONIST UI

### Dashboard Overview
**Purpose:** Quick access to daily tasks and statistics

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  📊 Receptionist Dashboard                      │
├─────────────────────────────────────────────────┤
│  [Today's Stats]                                │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│  │ 45   │ │ 12   │ │ 8    │ │ 25   │          │
│  │Total │ │Queue │ │Wait  │ │Done  │          │
│  └──────┘ └──────┘ └──────┘ └──────┘          │
│                                                  │
│  [Quick Actions]                                │
│  [➕ Register Patient] [📋 View Queue]         │
│  [📅 Appointments]     [💰 Billing]            │
└─────────────────────────────────────────────────┘
```

### Page 1: Patient Management

#### Search Section
```
┌─────────────────────────────────────────────────┐
│  🔍 Search Patients                             │
│  ┌───────────────────────────────────────────┐ │
│  │ Search by name, ID, contact...            │ │
│  └───────────────────────────────────────────┘ │
│  [🔍 Search] [🔄 Show All]                     │
└─────────────────────────────────────────────────┘
```

**Fields:**
- Search input (text, placeholder: "Search by name, ID, contact...")
- Search button
- Show All button

**Behavior:**
- Real-time search on Enter key
- Case-insensitive search
- Searches: first_name, last_name, patient_id, university_id, contact
- Empty search shows all patients

#### Patient List Table
```
┌──────────────────────────────────────────────────────────────┐
│ ID  │ Univ ID │ Name        │ Gender │ Contact    │ Actions │
├──────────────────────────────────────────────────────────────┤
│ 001 │ STU2024 │ John Doe    │ Male   │ 555-0100  │ [👁️][➕]│
│ 002 │ STU2025 │ Jane Smith  │ Female │ 555-0101  │ [👁️][➕]│
└──────────────────────────────────────────────────────────────┘
```

**Columns:**
- Patient ID (numeric)
- University ID (alphanumeric)
- Full Name (first + middle + last)
- Gender
- Contact Number
- Actions (View, Add to Queue)

**Action Buttons:**
- 👁️ View Details - Opens patient details modal
- ➕ Add to Queue - Opens queue registration modal



#### Modal: Add Patient to Queue

**Trigger:** Click "➕ Add to Queue" button

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  ➕ Add Patient to Queue                    [×] │
├─────────────────────────────────────────────────┤
│  Patient: John Doe (ID: 001)                    │
│  Contact: 555-0100                              │
│                                                  │
│  Select Clinic: *                               │
│  [▼ General Medicine Clinic          ]         │
│                                                  │
│  Select Doctor: *                               │
│  [▼ Dr. Sarah Smith                  ]         │
│                                                  │
│  Select Room: (Optional)                        │
│  [▼ Consultation Room 1              ]         │
│                                                  │
│  Appointment Time:                              │
│  [14:30]                                        │
│                                                  │
│  Reason for Visit:                              │
│  ┌─────────────────────────────────────────┐   │
│  │ Enter reason...                         │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  [Cancel] [✅ Add to Queue]                     │
└─────────────────────────────────────────────────┘
```

**Form Fields:**

1. **Select Clinic** (Required)
   - Type: Dropdown
   - Options: Active clinics only
   - Display: "{clinic_name} ({campus_name})"
   - Validation: Required
   - On Change: Load rooms for selected clinic

2. **Select Doctor** (Required)
   - Type: Dropdown
   - Options: Active doctors only
   - Display: "Dr. {first_name} {last_name}"
   - Validation: Required

3. **Select Room** (Optional)
   - Type: Dropdown
   - Options: Active rooms in selected clinic
   - Display: "{room_name} ({room_type})"
   - Disabled until clinic selected

4. **Appointment Time**
   - Type: Time picker
   - Default: Current time
   - Format: HH:MM (24-hour)
   - Validation: Valid time format

5. **Reason for Visit**
   - Type: Textarea
   - Rows: 3
   - Max length: 500 characters
   - Placeholder: "Enter reason for visit..."
   - Optional

**Buttons:**
- Cancel: Close modal without saving
- Add to Queue: Submit form (disabled if required fields empty)

**Validation Rules:**
- Clinic must be selected
- Doctor must be selected
- Time must be valid format
- Show error messages below fields

**Success Behavior:**
1. Create appointment with status "Scheduled"
2. Add to queue with auto-generated queue number
3. Show success message: "✅ {Patient Name} added to queue successfully! Queue #X"
4. Close modal
5. Refresh queue if on queue page

**Error Handling:**
- "Please select a clinic" - if clinic empty
- "Please select a doctor" - if doctor empty
- "Patient already in queue" - if duplicate
- "Failed to add to queue" - generic error

### Page 2: Queue Management

#### Clinic Selector
```
┌─────────────────────────────────────────────────┐
│  Select Clinic:                                 │
│  [▼ General Medicine Clinic (Main Campus)   ]  │
│  [🔄 Refresh] [📢 Call Next Patient]           │
│  ☑ Auto-refresh (30s)                          │
└─────────────────────────────────────────────────┘
```

**Components:**
- Clinic dropdown (shows all active clinics)
- Refresh button (manual refresh)
- Call Next Patient button (primary action)
- Auto-refresh checkbox (enabled by default)

#### Statistics Cards
```
┌──────────────────────────────────────────────────────────┐
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │
│  │ 👥   │ │ ⏳   │ │ 🏥   │ │ ✅   │ │ ⏱️   │         │
│  │  12  │ │  8   │ │  2   │ │  2   │ │ 15m  │         │
│  │Total │ │Wait  │ │Serve │ │Done  │ │ Avg  │         │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘         │
└──────────────────────────────────────────────────────────┘
```

**Metrics:**
- Total in Queue (all statuses)
- Waiting (status = 'Waiting')
- In Service (status = 'In-Service')
- Completed (status = 'Completed')
- Average Wait Time (in minutes)

**Color Coding:**
- Total: Teal gradient
- Waiting: Orange/Yellow gradient
- In Service: Blue gradient
- Completed: Green gradient
- Avg Time: Purple gradient



#### Queue Table
```
┌────────────────────────────────────────────────────────────────────────────┐
│ Queue# │ Patient    │ Phone    │ Time  │ Doctor      │ Room  │ Status │ Actions │
├────────────────────────────────────────────────────────────────────────────┤
│   #1   │ John Doe   │ 555-0100 │ 14:30 │ Dr. Smith   │ R1    │ 🟡Wait │ [▶️]   │
│   #2   │ Jane Smith │ 555-0101 │ 14:45 │ Dr. Jones   │ R2    │ 🔵Serv │ [✅]   │
│   #3   │ Bob Wilson │ 555-0102 │ 15:00 │ Dr. Smith   │ R1    │ 🟢Done │        │
└────────────────────────────────────────────────────────────────────────────┘
```

**Columns:**
1. Queue Number - Large, bold, colored (#1, #2, #3...)
2. Patient Name - Full name
3. Phone - Contact number
4. Time - Appointment time (HH:MM)
5. Doctor - "Dr. {last_name}"
6. Room - Room name or "-"
7. Status - Badge with color
8. Actions - Status-dependent buttons

**Status Badges:**
- 🟡 Waiting - Yellow background (#fef3c7), brown text (#92400e)
- 🔵 In-Service - Blue background (#dbeafe), blue text (#1e40af)
- 🟢 Completed - Green background (#d1fae5), green text (#065f46)

**Action Buttons:**
- Waiting → [▶️ Start] - Changes status to "In-Service"
- In-Service → [✅ Complete] - Changes status to "Completed"
- Completed → No actions

**Call Next Patient Button:**
- Location: Top right, prominent
- Style: Primary button, large
- Icon: 📢
- Text: "Call Next Patient"
- Behavior:
  1. Finds first patient with status "Waiting"
  2. Changes status to "In-Service"
  3. Shows alert: "Called: {Patient Name} (Queue #{number})"
  4. If no waiting patients: "No patients waiting in queue"

**Empty State:**
```
┌─────────────────────────────────────────────────┐
│                                                  │
│                    📋                            │
│          No patients in queue                   │
│     Queue is empty for this clinic              │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 2. NURSE UI

### Dashboard Overview
```
┌─────────────────────────────────────────────────┐
│  🩺 Nurse Dashboard                             │
├─────────────────────────────────────────────────┤
│  [Today's Stats]                                │
│  ┌──────┐ ┌──────┐ ┌──────┐                   │
│  │ 15   │ │ 8    │ │ 7    │                   │
│  │Queue │ │Vitals│ │Done  │                   │
│  └──────┘ └──────┘ └──────┘                   │
│                                                  │
│  [Quick Actions]                                │
│  [📋 Patient Queue] [🩺 Record Vitals]         │
└─────────────────────────────────────────────────┘
```

### Page 1: Patient Queue (View Only)

**Purpose:** See patients waiting for vitals

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│  📋 Waiting Queue                                          │
│  Select Clinic: [▼ General Medicine]  [🔄 Refresh]       │
├────────────────────────────────────────────────────────────┤
│ Queue# │ Patient    │ Status    │ Time  │ Actions        │
├────────────────────────────────────────────────────────────┤
│   #1   │ John Doe   │ 🟡 Waiting│ 14:30 │ [🩺 Vitals]   │
│   #2   │ Jane Smith │ 🔵 Service│ 14:45 │ [✅ Complete] │
└────────────────────────────────────────────────────────────┘
```

**Features:**
- View patients in queue
- Filter by clinic
- Quick access to record vitals
- Update queue status

**Rules:**
- ❌ Cannot create new queue entries
- ❌ Cannot see diagnosis or prescriptions
- ✅ Can record vitals
- ✅ Can update queue status

### Page 2: Vitals Recording

#### Search Patient
```
┌─────────────────────────────────────────────────┐
│  🩺 Record Vital Signs                          │
│  ┌───────────────────────────────────────────┐ │
│  │ Search patient by name or ID...          │ │
│  └───────────────────────────────────────────┘ │
│  [🔍 Search]                                    │
└─────────────────────────────────────────────────┘
```

#### Vitals Form

**Trigger:** Click "Record Vitals" or search patient

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  🩺 Record Vital Signs                      [×] │
├─────────────────────────────────────────────────┤
│  Patient: John Doe (ID: 001)                    │
│  Age: 25 | Gender: Male                         │
│                                                  │
│  Blood Pressure: *                              │
│  [120] / [80] mmHg                              │
│                                                  │
│  Temperature: *                                 │
│  [37.0] °C  ○ Celsius  ○ Fahrenheit           │
│                                                  │
│  Pulse Rate: *                                  │
│  [72] bpm                                       │
│                                                  │
│  Weight:                                        │
│  [70.5] kg                                      │
│                                                  │
│  Height:                                        │
│  [175] cm                                       │
│                                                  │
│  Respiratory Rate:                              │
│  [16] breaths/min                               │
│                                                  │
│  Oxygen Saturation (SpO2):                      │
│  [98] %                                         │
│                                                  │
│  Notes:                                         │
│  ┌─────────────────────────────────────────┐   │
│  │ Additional observations...              │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  [Cancel] [✅ Submit Vitals]                    │
└─────────────────────────────────────────────────┘
```

**Form Fields:**

1. **Blood Pressure** (Required)
   - Type: Two number inputs (Systolic / Diastolic)
   - Format: XXX/XX mmHg
   - Validation: 
     - Systolic: 70-250
     - Diastolic: 40-150
     - Systolic > Diastolic
   - Normal range: 90/60 - 120/80
   - Warning if outside normal range

2. **Temperature** (Required)
   - Type: Number input + Radio buttons
   - Units: Celsius or Fahrenheit
   - Validation:
     - Celsius: 35-42°C
     - Fahrenheit: 95-107.6°F
   - Normal range: 36.1-37.2°C (97-99°F)
   - Auto-convert between units

3. **Pulse Rate** (Required)
   - Type: Number input
   - Unit: bpm (beats per minute)
   - Validation: 40-200
   - Normal range: 60-100 bpm

4. **Weight** (Optional)
   - Type: Number input (decimal)
   - Unit: kg
   - Validation: 1-300 kg
   - Decimal places: 1

5. **Height** (Optional)
   - Type: Number input
   - Unit: cm
   - Validation: 50-250 cm

6. **Respiratory Rate** (Optional)
   - Type: Number input
   - Unit: breaths/min
   - Validation: 8-40
   - Normal range: 12-20

7. **Oxygen Saturation** (Optional)
   - Type: Number input
   - Unit: %
   - Validation: 70-100
   - Normal range: 95-100%
   - Warning if < 95%

8. **Notes** (Optional)
   - Type: Textarea
   - Max length: 500 characters
   - Placeholder: "Additional observations..."

**Validation Rules:**
- Required fields must be filled
- Values must be within valid ranges
- Show warning for abnormal values
- Highlight critical values in red

**Submit Behavior:**
1. Validate all fields
2. API call: POST /api/vitals
3. Success: Show "✅ Vitals recorded successfully"
4. Update queue status if applicable
5. Clear form for next patient

**Visual Indicators:**
- 🟢 Normal values - Green text
- 🟡 Borderline values - Yellow text
- 🔴 Abnormal values - Red text + warning icon



---

## 3. DOCTOR UI

### Dashboard Overview
```
┌─────────────────────────────────────────────────┐
│  👨‍⚕️ Doctor Dashboard                            │
├─────────────────────────────────────────────────┤
│  [Today's Stats]                                │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│  │ 12   │ │ 8    │ │ 4    │ │ 15   │          │
│  │Queue │ │Seen  │ │Pend  │ │Total │          │
│  └──────┘ └──────┘ └──────┘ └──────┘          │
│                                                  │
│  [My Patients Today]                            │
│  [📋 Consultation Queue]                        │
└─────────────────────────────────────────────────┘
```

### Page 1: Consultation Queue

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│  📋 My Consultation Queue                                  │
├────────────────────────────────────────────────────────────┤
│ Queue# │ Patient    │ Vitals │ Status    │ Actions       │
├────────────────────────────────────────────────────────────┤
│   #1   │ John Doe   │ ✅     │ Ready     │ [👁️ View]    │
│   #2   │ Jane Smith │ ⏳     │ Waiting   │ [👁️ View]    │
└────────────────────────────────────────────────────────────┘
```

**Features:**
- Shows only patients assigned to logged-in doctor
- Vitals status indicator (✅ Recorded, ⏳ Pending)
- Click to view patient details

### Page 2: Patient Medical History

**Trigger:** Click "View" on patient in queue

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  👤 Patient: John Doe (25, Male)            [×] │
├─────────────────────────────────────────────────┤
│  [Patient Info] [Vitals] [History] [Current]   │
│                                                  │
│  📊 Today's Vitals (Recorded: 14:35)           │
│  ┌─────────────────────────────────────────┐   │
│  │ BP: 120/80 mmHg    Temp: 37.0°C       │   │
│  │ Pulse: 72 bpm      Weight: 70.5 kg    │   │
│  │ SpO2: 98%          RR: 16/min         │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  📋 Medical History                             │
│  ┌─────────────────────────────────────────┐   │
│  │ 2024-12-10: Flu - Prescribed antibiotics│   │
│  │ 2024-11-15: Annual checkup - Normal    │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  💊 Current Medications                         │
│  ┌─────────────────────────────────────────┐   │
│  │ None                                    │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  ⚠️ Allergies                                   │
│  ┌─────────────────────────────────────────┐   │
│  │ Penicillin                              │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  [📝 Create Diagnosis]                          │
└─────────────────────────────────────────────────┘
```

**Sections:**
1. Patient Demographics
2. Today's Vitals (highlighted)
3. Medical History (previous visits)
4. Current Medications
5. Allergies (warning if present)

### Page 3: Diagnosis Form

**Trigger:** Click "Create Diagnosis"

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  📝 Create Medical Record                   [×] │
├─────────────────────────────────────────────────┤
│  Patient: John Doe                              │
│                                                  │
│  Chief Complaint: *                             │
│  ┌─────────────────────────────────────────┐   │
│  │ Fever, cough, body aches...             │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  History of Present Illness:                    │
│  ┌─────────────────────────────────────────┐   │
│  │ Started 3 days ago...                   │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  Physical Examination:                          │
│  ┌─────────────────────────────────────────┐   │
│  │ Throat: Red and inflamed...             │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  Diagnosis: *                                   │
│  ┌─────────────────────────────────────────┐   │
│  │ Acute Upper Respiratory Infection       │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  ICD-10 Code: (Optional)                        │
│  [J06.9]                                        │
│                                                  │
│  Treatment Plan: *                              │
│  ┌─────────────────────────────────────────┐   │
│  │ Rest, fluids, medications...            │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  Additional Notes:                              │
│  ┌─────────────────────────────────────────┐   │
│  │ Follow up in 3 days if not better...   │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  [Cancel] [💾 Save Diagnosis]                   │
└─────────────────────────────────────────────────┘
```

**Form Fields:**

1. **Chief Complaint** (Required)
   - Type: Textarea
   - Rows: 2
   - Max: 500 chars
   - Placeholder: "Main reason for visit..."

2. **History of Present Illness**
   - Type: Textarea
   - Rows: 3
   - Max: 1000 chars
   - Placeholder: "When did symptoms start? How have they progressed?"

3. **Physical Examination**
   - Type: Textarea
   - Rows: 4
   - Max: 1000 chars
   - Placeholder: "Examination findings..."

4. **Diagnosis** (Required)
   - Type: Textarea
   - Rows: 2
   - Max: 500 chars
   - Placeholder: "Primary diagnosis..."

5. **ICD-10 Code**
   - Type: Text input
   - Optional
   - Format: Letter + numbers (e.g., J06.9)

6. **Treatment Plan** (Required)
   - Type: Textarea
   - Rows: 3
   - Max: 1000 chars
   - Placeholder: "Treatment recommendations..."

7. **Additional Notes**
   - Type: Textarea
   - Rows: 2
   - Max: 500 chars
   - Optional

**Save Behavior:**
1. Validate required fields
2. API call: POST /api/medical-records
3. Success: Enable prescription and lab request buttons
4. Show: "✅ Diagnosis saved successfully"
5. Unlock additional forms

**Important UI Rule:**
⚠️ **"Prescribe" and "Lab Request" buttons are DISABLED until diagnosis is saved**

### Page 4: Prescription Form

**Trigger:** Click "💊 Create Prescription" (enabled after diagnosis saved)

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  💊 Create Prescription                     [×] │
├─────────────────────────────────────────────────┤
│  Patient: John Doe                              │
│  Diagnosis: Acute URI                           │
│  ⚠️ Allergies: Penicillin                      │
│                                                  │
│  [Add Medication]                               │
│                                                  │
│  Medication 1:                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ Search medication...                    │   │
│  └─────────────────────────────────────────┘   │
│  [▼ Paracetamol 500mg Tablet            ]      │
│                                                  │
│  Dosage: [500] mg                               │
│  Frequency: [▼ Three times daily (TID)  ]      │
│  Duration: [7] days                             │
│  Route: [▼ Oral (PO)                    ]      │
│                                                  │
│  Instructions:                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ Take after meals with water             │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  [➕ Add Another Medication] [🗑️ Remove]       │
│                                                  │
│  ─────────────────────────────────────────      │
│                                                  │
│  General Instructions:                          │
│  ┌─────────────────────────────────────────┐   │
│  │ Complete full course. Return if worse...│   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  [Cancel] [💾 Save Prescription]                │
└─────────────────────────────────────────────────┘
```

**Medication Fields (Repeatable):**

1. **Medication Name** (Required)
   - Type: Searchable dropdown
   - Source: Pharmacy inventory
   - Display: "{drug_name} {strength} {form}"
   - Example: "Paracetamol 500mg Tablet"

2. **Dosage** (Required)
   - Type: Number + Unit
   - Units: mg, ml, tablets, etc.
   - Example: "500 mg" or "2 tablets"

3. **Frequency** (Required)
   - Type: Dropdown
   - Options:
     - Once daily (OD/QD)
     - Twice daily (BID)
     - Three times daily (TID)
     - Four times daily (QID)
     - Every 4 hours
     - Every 6 hours
     - As needed (PRN)

4. **Duration** (Required)
   - Type: Number + Unit
   - Units: days, weeks, months
   - Example: "7 days"

5. **Route** (Required)
   - Type: Dropdown
   - Options:
     - Oral (PO)
     - Topical
     - Intravenous (IV)
     - Intramuscular (IM)
     - Subcutaneous (SC)
     - Inhalation
     - Rectal
     - Ophthalmic (Eye)
     - Otic (Ear)

6. **Instructions** (Optional)
   - Type: Textarea
   - Max: 200 chars
   - Example: "Take after meals"

**Buttons:**
- Add Another Medication - Add new medication section
- Remove - Delete medication (min 1 required)
- Save Prescription - Submit all medications

**Validation:**
- At least 1 medication required
- All required fields per medication
- Check against patient allergies (show warning)
- Verify medication exists in inventory

**Save Behavior:**
1. Validate all medications
2. Check stock availability
3. API call: POST /api/prescriptions
4. Success: "✅ Prescription created and sent to pharmacy"
5. Prescription appears in pharmacist queue



### Pag