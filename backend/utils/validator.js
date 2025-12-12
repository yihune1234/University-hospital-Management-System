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

  // Medical Record ID validation
  if (!request.medical_record_id) {
    errors.push('Medical Record ID is required');
  }

  // Test types validation
  if (!request.test_types || !Array.isArray(request.test_types) || request.test_types.length === 0) {
    errors.push('At least one test type is required');
  }

  // Urgency validation
  const validUrgencies = ['Normal', 'Urgent', 'Emergency'];
  if (request.urgency && !validUrgencies.includes(request.urgency)) {
    errors.push('Invalid urgency level');
  }

  // Notes validation (optional)
  if (request.notes && request.notes.length > 1000) {
    errors.push('Notes cannot exceed 1000 characters');
  }

  return errors;
}

validateLabRequestStatusUpdate(statusUpdate) {
  const errors = [];

  // Status validation
  const validStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
  if (!statusUpdate.status || !validStatuses.includes(statusUpdate.status)) {
    errors.push('Invalid status');
  }

  // Notes validation (optional)
  if (statusUpdate.notes && statusUpdate.notes.length > 1000) {
    errors.push('Notes cannot exceed 1000 characters');
  }

  return errors;
}

validateLabTestResults(results) {
  const errors = [];

  // Validate each test result
  results.forEach((result, index) => {
    // Test type validation
    if (!result.test_type) {
      errors.push(`Test type is required for result ${index + 1}`);
    }

    // Result data validation
    if (!result.result_data) {
      errors.push(`Result data is required for test type ${result.test_type}`);
    }

    // Status validation
    const validStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
    if (result.status && !validStatuses.includes(result.status)) {
      errors.push(`Invalid status for test type ${result.test_type}`);
    }
  });

  return errors;
}
}

module.exports = new Validator();