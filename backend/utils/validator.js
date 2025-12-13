class Validator {
  // Validate patient registration
  validatePatient(patient) {
    const errors = [];

    // University ID validation
    if (!patient.university_id) {
      errors.push('University ID is required');
    }

    // Full name validation
    if (!patient.first_name || patient.first_name.trim().length < 2) {
      errors.push('Full name is required and must be at least 2 characters');
    }

    // Gender validation
    const validGenders = ['Male', 'Female', 'Other'];
    if (!patient.gender || !validGenders.includes(patient.gender)) {
      errors.push('Valid gender is required');
    }

    // Date of birth validation
    if (!patient.date_of_birth) {
      errors.push('Date of birth is required');
    } else {
      const dob = new Date(patient.date_of_birth);
      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 120);
      const maxAge = new Date();
      maxAge.setFullYear(maxAge.getFullYear() - 5);

      if (dob > maxAge || dob < minAge) {
        errors.push('Invalid date of birth');
      }
    }

    // Contact validation
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!patient.contact || !phoneRegex.test(patient.contact)) {
      errors.push('Valid contact number is required');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!patient.email || !emailRegex.test(patient.email)) {
      errors.push('Valid email is required');
    }

    // Campus ID validation
    if (!patient.campus_id) {
      errors.push('Campus ID is required');
    }

    return errors;
  }

  // Validate patient update
  validatePatientUpdate(patient) {
    const errors = [];

    // Optional validations for update
    if (patient.full_name && patient.full_name.trim().length < 2) {
      errors.push('Full name must be at least 2 characters');
    }

    if (patient.gender) {
      const validGenders = ['Male', 'Female', 'Other'];
      if (!validGenders.includes(patient.gender)) {
        errors.push('Invalid gender');
      }
    }

    if (patient.date_of_birth) {
      const dob = new Date(patient.date_of_birth);
      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 120);
      const maxAge = new Date();
      maxAge.setFullYear(maxAge.getFullYear() - 5);

      if (dob > maxAge || dob < minAge) {
        errors.push('Invalid date of birth');
      }
    }

    if (patient.contact) {
      const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(patient.contact)) {
        errors.push('Invalid contact number');
      }
    }

    if (patient.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(patient.email)) {
        errors.push('Invalid email');
      }
    }

    return errors;
  }
  // Add this method to the Validator class
validateAppointment(appointment) {
  const errors = [];

  // Required IDs
  if (!appointment.patient_id) errors.push('Patient ID is required');
  if (!appointment.clinic_id) errors.push('Clinic ID is required');
  if (!appointment.staff_id) errors.push('Staff ID is required');

  // Appointment date + time validation
 
  if (!appointment.appointment_time) {
    errors.push('Appointment time is required');
  }

  // Only validate past/future when BOTH exist
  if (appointment.appointment_date && appointment.appointment_time) {
    // Combine date + time into one actual JS Date
    const dateTimeString = `${appointment.appointment_date}T${appointment.appointment_time}`;
    const appointmentDateTime = new Date(dateTimeString);

    if (isNaN(appointmentDateTime.getTime())) {
      errors.push('Invalid appointment date/time format');
    } else {
      const now = new Date();
      const maxFutureDate = new Date();
      maxFutureDate.setMonth(now.getMonth() + 3);

      if (appointmentDateTime < now) {
        errors.push('Appointment time cannot be in the past');
      }
      if (appointmentDateTime > maxFutureDate) {
        errors.push('Appointment time cannot be more than 3 months in the future');
      }
    }
  }

  // Visit type (optional)
  if (appointment.visit_type) {
    const validVisitTypes = ['Regular', 'Emergency', 'Follow-up', 'Consultation'];
    if (!validVisitTypes.includes(appointment.visit_type)) {
      errors.push('Invalid visit type');
    }
  }

  // Status (optional)
  if (appointment.status) {
    const validStatuses = ['Scheduled', 'In-Progress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(appointment.status)) {
      errors.push('Invalid appointment status');
    }
  }

  return errors;


}
// Add these methods to the Validator class
validateMedicalRecord(record) {
  const errors = [];

  // Patient ID validation
  if (!record.patient_id) {
    errors.push('Patient ID is required');
  }

  // Appointment ID validation
  if (!record.appointment_id) {
    errors.push('Appointment ID is required');
  }

  // Diagnosis validation
  if (!record.diagnosis || record.diagnosis.trim().length < 2) {
    errors.push('Diagnosis is required and must be at least 2 characters');
  }

  // Symptoms validation
  if (!record.symptoms) {
    errors.push('Symptoms are required');
  }

  // Treatment validation
  if (!record.treatment) {
    errors.push('Treatment is required');
  }

  // Vital signs validation (optional)
  if (record.vital_signs) {
    const { blood_pressure, temperature, pulse, weight } = record.vital_signs;

    // Blood pressure validation
    if (!blood_pressure || !/^\d+\/\d+$/.test(blood_pressure)) {
      errors.push('Invalid blood pressure format (e.g., 120/80)');
    }

    // Temperature validation
    if (temperature && (temperature < 35 || temperature > 42)) {
      errors.push('Invalid temperature');
    }

    // Pulse validation
    if (pulse && (pulse < 40 || pulse > 200)) {
      errors.push('Invalid pulse rate');
    }

    // Weight validation
    if (weight && (weight < 10 || weight > 300)) {
      errors.push('Invalid weight');
    }
  }

  return errors;
}

validateMedicalRecordUpdate(record) {
  const errors = [];

  // Optional validations for update
  if (record.diagnosis && record.diagnosis.trim().length < 2) {
    errors.push('Diagnosis must be at least 2 characters');
  }

  // Vital signs validation (optional)
  if (record.vital_signs) {
    const { blood_pressure, temperature, pulse, weight } = record.vital_signs;

    // Blood pressure validation
    if (blood_pressure && !/^\d+\/\d+$/.test(blood_pressure)) {
      errors.push('Invalid blood pressure format (e.g., 120/80)');
    }

    // Temperature validation
    if (temperature && (temperature < 35 || temperature > 42)) {
      errors.push('Invalid temperature');
    }

    // Pulse validation
    if (pulse && (pulse < 40 || pulse > 200)) {
      errors.push('Invalid pulse rate');
    }

    // Weight validation
    if (weight && (weight < 10 || weight > 300)) {
      errors.push('Invalid weight');
    }
  }

  return errors;
}

validateFollowUpNotes(followUp) {
  const errors = [];

  // Follow-up notes validation
  if (!followUp.follow_up_notes || followUp.follow_up_notes.trim().length < 2) {
    errors.push('Follow-up notes are required and must be at least 2 characters');
  }

  // Next follow-up date validation
  if (followUp.next_follow_up_date) {
    const followUpDate = new Date(followUp.next_follow_up_date);
    const now = new Date();
    const maxFutureDate = new Date();
    maxFutureDate.setMonth(now.getMonth() + 12);

    if (followUpDate < now) {
      errors.push('Follow-up date cannot be in the past');
    }
    if (followUpDate > maxFutureDate) {
      errors.push('Follow-up date cannot be more than 12 months in the future');
    }
  }

  return errors;
}

// Add these methods to the Validator class
validateLabRequest(request) {
 
  const errors = [];

  // Patient ID validation
  if (!request.patient_id) {
    errors.push('Patient ID is required');
  }

  // Doctor ID validation
  if (!request.doctor_id) {
    errors.push('Doctor ID is required');
  }

  // Clinic ID (optional, but must be a number if provided)
  if (request.clinic_id !== undefined && isNaN(request.clinic_id)) {
    errors.push('Clinic ID must be a valid number');
  }

  // Test type validation (single value, NOT array)
  if (!request.test_type || typeof request.test_type !== 'string') {
    errors.push('Test type is required');
  }

  // Notes validation (optional)
  if (request.notes && request.notes.length > 1000) {
    errors.push('Notes cannot exceed 1000 characters');
  }

  return errors;
}
validatePrescription(prescription) {
  const errors = [];

  // Patient ID validation
  if (!prescription.patient_id) {
    errors.push('Patient ID is required');
  }

  // Doctor ID validation
  if (!prescription.doctor_id) {
    errors.push('Doctor ID is required');
  }

  // Drug ID validation
  if (!prescription.drug_id) {
    errors.push('Drug ID is required');
  }

  // Dosage validation
  if (!prescription.dosage) {
    errors.push('Dosage is required');
  } else {
    // Optional: Add specific dosage format validation
    const dosageRegex = /^(\d+(\.\d+)?)\s*(mg|ml|g|mcg|units?)$/i;
    if (!dosageRegex.test(prescription.dosage)) {
      errors.push('Invalid dosage format. Use format like "500 mg" or "2 ml"');
    }
  }

  // Frequency validation
  const validFrequencies = [
    'once daily', 
    'twice daily', 
    'thrice daily', 
    'four times daily',
    'every 4 hours',
    'every 6 hours',
    'every 8 hours',
    'as needed'
  ];
  if (!prescription.frequency) {
    errors.push('Frequency is required');
  } else if (!validFrequencies.includes(prescription.frequency.toLowerCase())) {
    errors.push(`Invalid frequency. Must be one of: ${validFrequencies.join(', ')}`);
  }

  // Duration validation
  if (!prescription.duration) {
    errors.push('Duration is required');
  } else {
    // Ensure duration is a positive number
    const duration = parseInt(prescription.duration, 10);
    if (isNaN(duration) || duration <= 0 || duration > 30) {
      errors.push('Duration must be a positive number between 1 and 30 days');
    }
  }

  // Instructions validation (optional, but recommended)
  if (prescription.instructions) {
    if (prescription.instructions.length > 500) {
      errors.push('Instructions must be less than 500 characters');
    }
  }

  // Additional complex validations
  try {
    // Validate patient existence (optional, depends on your architecture)
    if (prescription.patient_id) {
      // This would typically involve a database check
      // For now, just ensure it's a valid number
      const patientId = parseInt(prescription.patient_id, 10);
      if (isNaN(patientId) || patientId <= 0) {
        errors.push('Invalid patient ID');
      }
    }

    // Validate drug existence (optional, depends on your architecture)
    if (prescription.drug_id) {
      const drugId = parseInt(prescription.drug_id, 10);
      if (isNaN(drugId) || drugId <= 0) {
        errors.push('Invalid drug ID');
      }
    }
  } catch (validationError) {
    errors.push('Additional validation failed');
  }

  // Potential drug interaction warning (example logic)
  const potentialInteractions = this.checkPotentialDrugInteractions(prescription);
  if (potentialInteractions.length > 0) {
    // Note: This doesn't create an error, just a warning
    prescription.warnings = potentialInteractions;
  }

  return errors;
}

// Optional method for checking potential drug interactions
checkPotentialDrugInteractions(prescription) {
  // This is a simplified example. In a real-world scenario, 
  // this would be a complex check against a drug interaction database
  const knownInteractions = [
    { 
      drugs: ['warfarin', 'aspirin'], 
      warning: 'Potential increased bleeding risk' 
    },
    { 
      drugs: ['antibiotics', 'birth control'], 
      warning: 'May reduce birth control effectiveness' 
    }
  ];

  const warnings = [];

  // In a real implementation, you'd check against actual drug names/IDs
  // This is just a conceptual example
  knownInteractions.forEach(interaction => {
    // Simplified interaction check
    warnings.push(interaction.warning);
  });

  return warnings;
}

// Validation method for prescription update
validatePrescriptionUpdate(updateData) {
  const errors = [];

  // Optional fields validation
  if (updateData.dosage) {
    const dosageRegex = /^(\d+(\.\d+)?)\s*(mg|ml|g|mcg|units?)$/i;
    if (!dosageRegex.test(updateData.dosage)) {
      errors.push('Invalid dosage format. Use format like "500 mg" or "2 ml"');
    }
  }

  // Frequency validation if provided
  const validFrequencies = [
    'once daily', 
    'twice daily', 
    'thrice daily', 
    'four times daily',
    'every 4 hours',
    'every 6 hours',
    'every 8 hours',
    'as needed'
  ];
  if (updateData.frequency && !validFrequencies.includes(updateData.frequency.toLowerCase())) {
    errors.push(`Invalid frequency. Must be one of: ${validFrequencies.join(', ')}`);
  }

  // Duration validation if provided
  if (updateData.duration) {
    const duration = parseInt(updateData.duration, 10);
    if (isNaN(duration) || duration <= 0 || duration > 30) {
      errors.push('Duration must be a positive number between 1 and 30 days');
    }
  }

  // Instructions length check
  if (updateData.instructions && updateData.instructions.length > 500) {
    errors.push('Instructions must be less than 500 characters');
  }

  return errors;
}


validatePrescriptionRefill(refill) 
{
  const errors = [];

  // Duration validation
  if (!refill.duration_days || refill.duration_days <= 0) {
    errors.push('Valid duration is required');
  }

  // Optional additional validations can be added here
  if (refill.duration_days > 90) {
    errors.push('Refill duration cannot exceed 90 days');
  }

  return errors;
}
// Add these methods to the Validator class
validateReferral(referral) {
  const errors = [];

  // Patient ID validation
  if (!referral.patient_id) {
    errors.push('Patient ID is required');
  }

  // From Clinic ID validation
  if (!referral.from_clinic_id) {
    errors.push('From Clinic ID is required');
  }

  // To Clinic ID validation
  if (!referral.to_clinic_id) {
    errors.push('To Clinic ID is required');
  }

  // Medical Record ID validation
  if (!referral.medical_record_id) {
    errors.push('Medical Record ID is required');
  }

  // Referral reason validation
  if (!referral.referral_reason || referral.referral_reason.trim().length < 2) {
    errors.push('Referral reason is required and must be at least 2 characters');
  }

  // Urgency validation
  const validUrgencies = ['Normal', 'Urgent', 'Emergency'];
  if (referral.urgency && !validUrgencies.includes(referral.urgency)) {
    errors.push('Invalid urgency level');
  }

  // Additional notes validation (optional)
  if (referral.additional_notes && referral.additional_notes.length > 1000) {
    errors.push('Additional notes cannot exceed 1000 characters');
  }

  return errors;
}

validateReferralStatusUpdate(statusUpdate) {
  const errors = [];

  // Status validation
  const validStatuses = ['Pending', 'Accepted', 'Rejected', 'In Progress', 'Completed'];
  if (!statusUpdate.status || !validStatuses.includes(statusUpdate.status)) {
    errors.push('Invalid referral status');
  }

  // Notes validation (optional)
  if (statusUpdate.notes && statusUpdate.notes.length > 1000) {
    errors.push('Notes cannot exceed 1000 characters');
  }

  return errors;
}

validateReferralTrackingEntry(trackingEntry) {
  const errors = [];

  // Status validation
  const validStatuses = ['Initiated', 'Reviewed', 'In Progress', 'Completed', 'Closed'];
  if (!trackingEntry.status || !validStatuses.includes(trackingEntry.status)) {
    errors.push('Invalid tracking status');
  }

  // Notes validation (optional)
  if (trackingEntry.notes && trackingEntry.notes.length > 1000) {
    errors.push('Notes cannot exceed 1000 characters');
  }

  return errors;
}
// Add these methods to the Validator class
validateBillCreation(bill) {
  const errors = [];

  // Patient ID validation
  if (!bill.patient_id) {
    errors.push('Patient ID is required');
  }

  // Bill items validation
  if (!bill.bill_items || !Array.isArray(bill.bill_items) || bill.bill_items.length === 0) {
    errors.push('At least one bill item is required');
  } else {
    bill.bill_items.forEach((item, index) => {
      // Service type validation
      if (!item.service_type) {
        errors.push(`Service type is required for item ${index + 1}`);
      }

      // Description validation
      if (!item.description) {
        errors.push(`Description is required for item ${index + 1}`);
      }

      // Quantity validation
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Valid quantity is required for item ${index + 1}`);
      }

      // Unit price validation
      if (!item.unit_price || item.unit_price < 0) {
        errors.push(`Valid unit price is required for item ${index + 1}`);
      }
    });
  }

  // Discount validation
  if (bill.discount !== undefined && (bill.discount < 0 || bill.discount > 100)) {
    errors.push('Discount must be between 0 and 100');
  }

  return errors;
}

validateBillPayment(payment) {
  const errors = [];

  // Amount validation
  if (!payment.amount || payment.amount <= 0) {
    errors.push('Valid payment amount is required');
  }

  // Payment method validation
  const validPaymentMethods = [
    'Cash', 
    'Credit Card', 
    'Debit Card', 
    'Bank Transfer', 
    'Insurance', 
    'Online Payment'
  ];
  if (!payment.payment_method || !validPaymentMethods.includes(payment.payment_method)) {
    errors.push('Invalid payment method');
  }

  return errors;
}

validateFinancialReportParams(reportParams) {
  const errors = [];

  // Start date validation
  if (!reportParams.start_date) {
    errors.push('Start date is required');
  } else {
    const startDate = new Date(reportParams.start_date);
    if (isNaN(startDate.getTime())) {
      errors.push('Invalid start date');
    }
  }

  // End date validation
  if (!reportParams.end_date) {
    errors.push('End date is required');
  } else {
    const endDate = new Date(reportParams.end_date);
    if (isNaN(endDate.getTime())) {
      errors.push('Invalid end date');
    }
  }

  // Report type validation
  if (reportParams.report_type) {
    const validReportTypes = ['daily', 'weekly', 'monthly'];
    if (!validReportTypes.includes(reportParams.report_type)) {
      errors.push('Invalid report type');
    }
  }

  return errors;
}
}




module.exports = new Validator();