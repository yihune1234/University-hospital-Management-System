


const PatientModel = require('../models/patient.model');
const { AppError } = require('../middleware/error.middleware');
const validator = require('../utils/validator');

class PatientController {
  // Register a new patient
  async registerPatient(req, res) {
    const patientData = req.body;

    // Validate input
    const validationErrors = validator.validatePatient(patientData);
    if (validationErrors.length > 0) {
      throw new AppError('Validation failed', 400, validationErrors);
    }

    // Check if patient with university ID already exists
    const existingPatient = await PatientModel.getPatientByUniversityId(
      patientData.university_id
    );
    if (existingPatient) {
      throw new AppError('Patient with this university ID already exists', 409);
    }

    const patientId = await PatientModel.registerPatient(patientData);
    const patient = await PatientModel.getPatientById(patientId);

    res.status(201).json(patient);
  }

  // Get patient by ID
  async getPatientById(req, res) {
    const { patientId } = req.params;

    const patient = await PatientModel.getPatientById(patientId);
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    res.json(patient);
  }

  // Search patients
  async searchPatients(req, res) {
    const filters = req.query;

    const patients = await PatientModel.searchPatients(filters);
    res.json(patients);
  }

  // Update patient information
  async updatePatient(req, res) {
    const { patientId } = req.params;
    const patientData = req.body;

    // Validate input
    const validationErrors = validator.validatePatientUpdate(patientData);
    if (validationErrors.length > 0) {
      throw new AppError('Validation failed', 400, validationErrors);
    }

    const updatedPatient = await PatientModel.updatePatient(patientId, patientData);
    res.json(updatedPatient);
  }

  // Get patient medical history
  async getPatientMedicalHistory(req, res) {
    const { patientId } = req.params;

    const medicalHistory = await PatientModel.getPatientMedicalHistory(patientId);
    res.json(medicalHistory);
  }

  // Bulk import patients
  async bulkImportPatients(req, res) {
    const patients = req.body;

    // Validate input
    if (!Array.isArray(patients) || patients.length === 0) {
      throw new AppError('Invalid patients data', 400);
    }

    const validationErrors = patients.flatMap(patient => 
      validator.validatePatient(patient)
    );

    if (validationErrors.length > 0) {
      throw new AppError('Validation failed', 400, validationErrors);
    }

    const importResult = await PatientModel.bulkImportPatients(patients);
    res.status(201).json({
      message: 'Patients imported successfully',
      importedCount: importResult.affectedRows
    });
  }
}

module.exports = new PatientController();