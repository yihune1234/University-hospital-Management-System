-- ===========================
-- DATABASE CREATION
-- ===========================
CREATE DATABASE IF NOT EXISTS University_Clinic_Management_System CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE University_Clinic_Management_System;

-- ===========================
-- 1. Campuses
-- ===========================
CREATE TABLE if not exists campuses (
    campus_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    campus_name VARCHAR(200) NOT NULL,
    location VARCHAR(500),
    status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===========================
-- 2. Roles
-- ===========================
CREATE TABLE if not exists roles (
    role_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===========================
-- 3. Clinics
-- ===========================
CREATE TABLE if not exists clinics (
    clinic_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    campus_id INT UNSIGNED NOT NULL,
    clinic_name VARCHAR(200) NOT NULL,
    clinic_type VARCHAR(100),
    open_time TIME,
    close_time TIME,
    status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campus_id) REFERENCES campuses(campus_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ===========================
-- 4. Work Areas / Rooms
-- ===========================
CREATE TABLE if not exists  work_areas (
    room_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    clinic_id INT UNSIGNED NOT NULL,
    room_name VARCHAR(100) NOT NULL,
    room_type ENUM('Consultation','Emergency','Vitals','Lab','Other') NOT NULL,
    capacity INT UNSIGNED DEFAULT 1,
    status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ===========================
-- 5. Staff
-- ===========================
CREATE TABLE if not exists staff (
    staff_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    role_id INT UNSIGNED NOT NULL,
    clinic_id INT UNSIGNED NULL,
    contact VARCHAR(50),
    email VARCHAR(255),
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_staff_email (email),
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ===========================
-- 6. Staff Schedules
-- ===========================
CREATE TABLE if not exists staff_schedules (
    schedule_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    staff_id INT UNSIGNED NOT NULL,
    clinic_id INT UNSIGNED NOT NULL,
    room_id INT UNSIGNED NULL,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    FOREIGN KEY (room_id) REFERENCES work_areas(room_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    INDEX idx_schedule_staff_date (staff_id, shift_date)
) ENGINE=InnoDB;

-- ===========================
-- 7. Patients
-- ===========================
CREATE TABLE if not exists patients (
    patient_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    university_id VARCHAR(100),
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    gender ENUM('Male','Female','Other'),
    date_of_birth DATE,
    contact VARCHAR(50),
    email VARCHAR(255),
    campus_id INT UNSIGNED,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_patient_university_id (university_id),
    FOREIGN KEY (campus_id) REFERENCES campuses(campus_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ===========================
-- 8. Appointments
-- ===========================
CREATE TABLE if not exists appointments (
    appointment_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    patient_id INT UNSIGNED NOT NULL,
    staff_id INT UNSIGNED,
    clinic_id INT UNSIGNED NOT NULL,
    room_id INT UNSIGNED NULL,
    appointment_time DATETIME NOT NULL,
    status ENUM('Scheduled','Confirmed','Completed','Cancelled') NOT NULL DEFAULT 'Scheduled',
    reason VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    FOREIGN KEY (room_id) REFERENCES work_areas(room_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    INDEX idx_appointment_time (clinic_id, appointment_time)
) ENGINE=InnoDB;

-- ===========================
-- 9. Waiting Queue
-- ===========================
CREATE TABLE if not exists waiting_queue (
    queue_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT UNSIGNED NOT NULL,
    queue_number INT UNSIGNED NOT NULL,
    status ENUM('Waiting','In-Service','Completed') NOT NULL DEFAULT 'Waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    UNIQUE KEY uq_queue_appointment (appointment_id)
) ENGINE=InnoDB;

-- ===========================
-- 10. Vitals
-- ===========================
CREATE TABLE if not exists vitals (
    vitals_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    patient_id INT UNSIGNED NOT NULL,
    blood_pressure VARCHAR(50),
    temperature DECIMAL(4,1),
    pulse INT UNSIGNED,
    weight DECIMAL(6,2),
    recorded_by INT UNSIGNED,
    room_id INT UNSIGNED,
    recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes VARCHAR(500),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES staff(staff_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (room_id) REFERENCES work_areas(room_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    INDEX idx_vitals_patient_time (patient_id, recorded_at)
) ENGINE=InnoDB;

-- ===========================
-- 11. Medical Records
-- ===========================
CREATE TABLE if not exists medical_records (
    record_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    patient_id INT UNSIGNED NOT NULL,
    doctor_id INT UNSIGNED,
    diagnosis TEXT,
    treatment TEXT,
    notes TEXT,
    visit_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES staff(staff_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    INDEX idx_medrec_patient_visit (patient_id, visit_date)
) ENGINE=InnoDB;

-- ===========================
-- 12. Pharmacy Inventory
-- ===========================
CREATE TABLE if not exists pharmacy_inventory (
    drug_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    drug_name VARCHAR(255) NOT NULL,
    brand VARCHAR(200),
    batch_number VARCHAR(100),
    stock_quantity INT UNSIGNED NOT NULL DEFAULT 0,
    unit VARCHAR(50),
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_drug_name_batch (drug_name, batch_number)
) ENGINE=InnoDB;

-- ===========================
-- 13. Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    patient_id INT UNSIGNED NOT NULL,
    doctor_id INT UNSIGNED NOT NULL,
    drug_id INT UNSIGNED NOT NULL,
    dosage VARCHAR(200),
    frequency VARCHAR(100),
    duration INT, -- number of days
    instructions TEXT,
    date_issued DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_presc_patient FOREIGN KEY (patient_id)
        REFERENCES patients(patient_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
        
    CONSTRAINT fk_presc_doctor FOREIGN KEY (doctor_id)
        REFERENCES staff(staff_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
        
    CONSTRAINT fk_presc_drug FOREIGN KEY (drug_id)
        REFERENCES pharmacy_inventory(drug_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;


-- ===========================
-- 14. Dispensations (fixed)
CREATE TABLE if not exists dispensations (
    dispense_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    drug_id INT UNSIGNED NOT NULL,
    patient_id INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    dispensed_by INT UNSIGNED NULL, -- allow NULL for SET NULL
    dispensed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    remarks VARCHAR(255),
    FOREIGN KEY (drug_id) REFERENCES pharmacy_inventory(drug_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (dispensed_by) REFERENCES staff(staff_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    INDEX idx_dispense_drug (drug_id)
) ENGINE=InnoDB;

-- ===========================
-- 15. Lab Requests
-- ===========================
CREATE TABLE if not exists lab_requests (
    request_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    patient_id INT UNSIGNED NOT NULL,
    doctor_id INT UNSIGNED NOT NULL,
    clinic_id INT UNSIGNED,
    test_type VARCHAR(200),
    notes TEXT,
    status ENUM('Pending','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES staff(staff_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    INDEX idx_labreq_status (status)
) ENGINE=InnoDB;

-- ===========================
-- 16. Lab Results
-- ===========================
CREATE TABLE if not exists lab_results (
    result_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    request_id INT UNSIGNED NOT NULL,
    result_data TEXT,
    result_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    performed_by INT UNSIGNED,
    attachments VARCHAR(500),
    FOREIGN KEY (request_id) REFERENCES lab_requests(request_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES staff(staff_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ===========================
-- 17. Referrals
-- ===========================
CREATE TABLE if not exists referrals (
    referral_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    patient_id INT UNSIGNED NOT NULL,
    from_clinic_id INT UNSIGNED NOT NULL,
    to_clinic_id INT UNSIGNED NOT NULL,
    referred_by INT UNSIGNED,
    reason TEXT,
    status ENUM('Pending','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
    referred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (from_clinic_id) REFERENCES clinics(clinic_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    FOREIGN KEY (to_clinic_id) REFERENCES clinics(clinic_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    FOREIGN KEY (referred_by) REFERENCES staff(staff_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ===========================
-- 18. Bills
-- ===========================
CREATE TABLE if not exists bills (
    bill_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    patient_id INT UNSIGNED NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status ENUM('Paid','Unpaid','Partial') NOT NULL DEFAULT 'Unpaid',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    due_date DATE,
    notes VARCHAR(500),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ===========================
-- 19. Payments
-- ===========================
CREATE TABLE if not exists payments (
    payment_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    bill_id INT UNSIGNED NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method ENUM('Cash','Card','Bank Transfer','Mobile Money','Other') NOT NULL,
    payment_reference VARCHAR(255),
    payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT UNSIGNED,
    FOREIGN KEY (bill_id) REFERENCES bills(bill_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (created_by) REFERENCES staff(staff_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    INDEX idx_payment_bill (bill_id)
) ENGINE=InnoDB;

-- ===========================
-- 20. Notifications
-- ===========================
CREATE TABLE if not exists notifications (
    notification_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    staff_id INT UNSIGNED NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    INDEX idx_notifications_staff_unread (staff_id, is_read)
) ENGINE=InnoDB;

-- ===========================
-- 21. Audit Logs
-- ===========================
CREATE TABLE if not exists audit_logs (
    log_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    staff_id INT UNSIGNED,
    action VARCHAR(500) NOT NULL,
    meta JSON NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    INDEX idx_audit_staff_time (staff_id, timestamp)
) ENGINE=InnoDB;

-- ===========================
-- INDEXES
-- ===========================
ALTER TABLE patients ADD INDEX if not exists idx_patient_name (first_name, last_name);
ALTER TABLE staff ADD INDEX  if not exists idx_staff_name_role (first_name, last_name, role_id);

ALTER TABLE patients
ADD COLUMN if not exists patient_type ENUM('student','staff','community') NOT NULL DEFAULT 'student';
ALTER TABLE lab_results
ADD COLUMN if not exists status ENUM('Pending','Completed','Cancelled') DEFAULT 'Pending';
ALTER TABLE prescriptions
ADD COLUMN if not exists duration_days INT DEFAULT 0;
