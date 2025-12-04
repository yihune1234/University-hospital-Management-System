const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
  });

  // Create Database
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
  await connection.query(`USE \`${process.env.DB_NAME}\`;`);

  const createTablesSQL = `

  /* -------------------- 1. campuses -------------------- */
  CREATE TABLE IF NOT EXISTS campuses (
    campus_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    address VARCHAR(255),
    contact VARCHAR(50),
    status ENUM('active','inactive') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  /* -------------------- 2. clinics -------------------- */
  CREATE TABLE IF NOT EXISTS clinics (
    clinic_id INT AUTO_INCREMENT PRIMARY KEY,
    campus_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    type ENUM('General','Dental','Lab','Pharmacy','Other') DEFAULT 'General',
    status ENUM('active','inactive') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY ux_clinic_campus_name (campus_id, name),
    FOREIGN KEY (campus_id) REFERENCES campuses(campus_id)
      ON DELETE RESTRICT ON UPDATE CASCADE
  );

  /* -------------------- 3. patients -------------------- */
  CREATE TABLE IF NOT EXISTS patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    last_name VARCHAR(50) NOT NULL,
    university_id VARCHAR(50),
    external_id VARCHAR(50),
    gender ENUM('Male','Female','Other'),
    dob DATE,
    contact VARCHAR(50),
    email VARCHAR(50),
    address VARCHAR(255),

    campus_id INT,
    registered_clinic_id INT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (campus_id) REFERENCES campuses(campus_id)
      ON DELETE SET NULL ON UPDATE CASCADE,

    FOREIGN KEY (registered_clinic_id) REFERENCES clinics(clinic_id)
      ON DELETE SET NULL ON UPDATE CASCADE
  );

  /* -------------------- 4. staff = USERS -------------------- */
  CREATE TABLE IF NOT EXISTS staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,

    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    last_name VARCHAR(50) NOT NULL,

    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    role ENUM(
      'Admin','HealthAdmin','ClinicManager',
      'Doctor','Nurse','Pharmacist','Receptionist','LabStaff'
    ) NOT NULL,

    qualification VARCHAR(50),
    license_no VARCHAR(50),
    contact VARCHAR(50),

    campus_id INT NOT NULL,
    clinic_id INT NOT NULL,

    employment_status ENUM('active','inactive') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (campus_id) REFERENCES campuses(campus_id)
      ON DELETE RESTRICT ON UPDATE CASCADE,

    FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id)
      ON DELETE RESTRICT ON UPDATE CASCADE
  );

  /* -------------------- 7. appointments -------------------- */
  CREATE TABLE IF NOT EXISTS appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    staff_id INT NOT NULL,
    clinic_id INT NOT NULL,
    appointment_time DATETIME NOT NULL,
    appointment_type VARCHAR(50),
    status ENUM('Scheduled','Confirmed','Checked-In','Completed','Cancelled','No-Show') DEFAULT 'Scheduled',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
      ON DELETE CASCADE ON UPDATE CASCADE,

    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
      ON DELETE RESTRICT ON UPDATE CASCADE,

    FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id)
      ON DELETE RESTRICT ON UPDATE CASCADE
  );

  /* -------------------- 8. queue -------------------- */
  CREATE TABLE IF NOT EXISTS queue (
    queue_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    clinic_id INT NOT NULL,
    queue_number INT NOT NULL,
    source ENUM('Reception','Kiosk','Online') DEFAULT 'Reception',
    status ENUM('Waiting','Called','In-Service','Completed','No-Show') DEFAULT 'Waiting',
    assigned_staff_id INT,
    arrived_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    called_at DATETIME,
    completed_at DATETIME,

    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
      ON DELETE CASCADE ON UPDATE CASCADE,

    FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id)
      ON DELETE CASCADE ON UPDATE CASCADE,

    FOREIGN KEY (assigned_staff_id) REFERENCES staff(staff_id)
      ON DELETE SET NULL ON UPDATE CASCADE
  );

  /* -------------------- 9. medical_records -------------------- */
  CREATE TABLE IF NOT EXISTS medical_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    staff_id INT NOT NULL,
    clinic_id INT NOT NULL,
    visit_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    chief_complaint TEXT,
    diagnosis TEXT,
    vitals TEXT,
    procedures TEXT,
    treatment_plan TEXT,
    prescriptions TEXT,
    notes TEXT,
    follow_up_date DATE,
    signed_by INT,

    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
      ON DELETE CASCADE ON UPDATE CASCADE,

    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
      ON DELETE RESTRICT ON UPDATE CASCADE,

    FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id)
      ON DELETE RESTRICT ON UPDATE CASCADE,

    FOREIGN KEY (signed_by) REFERENCES staff(staff_id)
      ON DELETE SET NULL ON UPDATE CASCADE
  );

  /* -------------------- 10. lab_requests -------------------- */
  CREATE TABLE IF NOT EXISTS lab_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    clinic_id INT NOT NULL,
    test_type VARCHAR(100) NOT NULL,
    specimen_type VARCHAR(50),
    status ENUM('Pending','Collected','In Progress','Completed','Cancelled') DEFAULT 'Pending',
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    collected_at DATETIME,
    completed_at DATETIME,
    notes TEXT,

    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
      ON DELETE CASCADE ON UPDATE CASCADE,

    FOREIGN KEY (doctor_id) REFERENCES staff(staff_id)
      ON DELETE RESTRICT ON UPDATE CASCADE,

    FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id)
      ON DELETE RESTRICT ON UPDATE CASCADE
  );

  /* -------------------- 11. lab_results -------------------- */
  CREATE TABLE IF NOT EXISTS lab_results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    findings TEXT,
    reference_range VARCHAR(255),
    attachment VARCHAR(255),
    technician_id INT,
    approved BOOLEAN DEFAULT FALSE,
    approved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (request_id) REFERENCES lab_requests(request_id)
      ON DELETE CASCADE ON UPDATE CASCADE,

    FOREIGN KEY (technician_id) REFERENCES staff(staff_id)
      ON DELETE SET NULL ON UPDATE CASCADE
  );

  /* -------------------- 12. pharmacy_inventory -------------------- */
  CREATE TABLE IF NOT EXISTS pharmacy_inventory (
    medicine_id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    manufacturer VARCHAR(50),
    batch VARCHAR(50),
    expiry_date DATE,
    quantity INT DEFAULT 0,
    unit VARCHAR(20),
    reorder_level INT DEFAULT 10,
    price DECIMAL(12,2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id)
      ON DELETE CASCADE ON UPDATE CASCADE
  );

  /* -------------------- 13. prescriptions -------------------- */
  CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    clinic_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,

    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
      ON DELETE CASCADE ON UPDATE CASCADE,

    FOREIGN KEY (doctor_id) REFERENCES staff(staff_id)
      ON DELETE RESTRICT ON UPDATE CASCADE,

    FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id)
      ON DELETE RESTRICT ON UPDATE CASCADE
  );

  /* -------------------- 14. prescription_items -------------------- */
  CREATE TABLE IF NOT EXISTS prescription_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id INT NOT NULL,
    medicine_id INT NOT NULL,
    dosage VARCHAR(50),
    duration VARCHAR(50),
    frequency VARCHAR(50),
    quantity_prescribed INT DEFAULT 1,

    FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id)
      ON DELETE CASCADE ON UPDATE CASCADE,

    FOREIGN KEY (medicine_id) REFERENCES pharmacy_inventory(medicine_id)
      ON DELETE RESTRICT ON UPDATE CASCADE
  );

  /* -------------------- 15. dispensing -------------------- */
  CREATE TABLE IF NOT EXISTS dispensing (
    dispensing_id INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id INT NOT NULL,
    item_id INT,
    medicine_id INT NOT NULL,
    quantity_dispensed INT NOT NULL,
    pharmacist_id INT NOT NULL,
    dispensed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,

    FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id)
      ON DELETE CASCADE ON UPDATE CASCADE,

    FOREIGN KEY (item_id) REFERENCES prescription_items(item_id)
      ON DELETE SET NULL ON UPDATE CASCADE,

    FOREIGN KEY (medicine_id) REFERENCES pharmacy_inventory(medicine_id)
      ON DELETE RESTRICT ON UPDATE CASCADE,

    FOREIGN KEY (pharmacist_id) REFERENCES staff(staff_id)
      ON DELETE RESTRICT ON UPDATE CASCADE
  );

  /* -------------------- 16. billing -------------------- */
  CREATE TABLE IF NOT EXISTS billing (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    clinic_id INT,
    visit_reference VARCHAR(50),
    service_description VARCHAR(255),
    amount DECIMAL(12,2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_status ENUM('Paid','Pending','Partial','Cancelled') DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
      ON DELETE CASCADE ON UPDATE CASCADE,

    FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id)
      ON DELETE SET NULL ON UPDATE CASCADE
  );

  /* -------------------- 17. payments -------------------- */
  CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    payment_method ENUM('Cash','Card','Mobile','Account') NOT NULL,
    amount_paid DECIMAL(12,2) NOT NULL,
    cashier_id INT NOT NULL,
    paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    transaction_reference VARCHAR(50),

    FOREIGN KEY (bill_id) REFERENCES billing(bill_id)
      ON DELETE CASCADE ON UPDATE CASCADE,

    FOREIGN KEY (cashier_id) REFERENCES staff(staff_id)
      ON DELETE RESTRICT ON UPDATE CASCADE
  );

  /* -------------------- 18. referrals -------------------- */
  CREATE TABLE IF NOT EXISTS referrals (
    referral_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    from_clinic_id INT NOT NULL,
    to_clinic_id INT NOT NULL,
    reason TEXT,
    referring_doctor_id INT NOT NULL,
    receiving_doctor_id INT,
    status ENUM('Pending','Accepted','Rejected','Completed') DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    accepted_at DATETIME,

    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
      ON DELETE CASCADE ON UPDATE CASCADE,

    FOREIGN KEY (from_clinic_id) REFERENCES clinics(clinic_id)
      ON DELETE RESTRICT ON UPDATE CASCADE,

    FOREIGN KEY (to_clinic_id) REFERENCES clinics(clinic_id)
      ON DELETE RESTRICT ON UPDATE CASCADE,

    FOREIGN KEY (referring_doctor_id) REFERENCES staff(staff_id)
      ON DELETE RESTRICT ON UPDATE CASCADE,

    FOREIGN KEY (receiving_doctor_id) REFERENCES staff(staff_id)
      ON DELETE SET NULL ON UPDATE CASCADE
  );

  /* -------------------- 19. notifications -------------------- */
  CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    type VARCHAR(50),
    trigger_event VARCHAR(100),
    payload JSON,
    status ENUM('Sent','Pending','Failed') DEFAULT 'Pending',
    channel ENUM('InApp','SMS','Email','Push') DEFAULT 'InApp',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME,

    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
      ON DELETE CASCADE ON UPDATE CASCADE
  );

  /* -------------------- 20. audit_logs -------------------- */
  CREATE TABLE IF NOT EXISTS audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    record_id INT,
    old_value LONGTEXT,
    new_value LONGTEXT,
    ip_address VARCHAR(45),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
      ON DELETE RESTRICT ON UPDATE CASCADE
  );

  /* -------------------- 21. reports -------------------- */
  CREATE TABLE IF NOT EXISTS reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    report_type VARCHAR(50),
    filters_used TEXT,
    file_link VARCHAR(255),
    requested_by INT,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (requested_by) REFERENCES staff(staff_id)
      ON DELETE SET NULL ON UPDATE CASCADE
  );

  `;

  await connection.query(createTablesSQL);
  console.log("UCMS database and all tables created successfully!");

  await connection.end();
}

module.exports = setupDatabase;
