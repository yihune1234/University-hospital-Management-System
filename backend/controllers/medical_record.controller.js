

const MedicalRecordModel = require('../models/medical_record.model');
const { AppError } = require('../middleware/error.middleware');
const validator = require('../utils/validator');

class MedicalRecordController {
  // Create a new medical record
  async createMedicalRecord(req, res) {
    const recordData = req.body;

    // Validate input
    const validationErrors = validator.validateMedicalRecord(recordData);
    if (validationErrors.length > 0) {
      throw new AppError('Validation failed', 400, validationErrors);
    }

    // Add doctor ID from authenticated user
    recordData.doctor_id = req.user.staffId;

    // Create medical record
    const medicalRecord = await MedicalRecordModel.createMedicalRecord(recordData);

    res.status(201).json(medicalRecord);
  }

  // Search medical records
  async searchMedicalRecords(req, res) {
    const filters = req.query;

    const medicalRecords = await MedicalRecordModel.searchMedicalRecords(filters);
    res.json(medicalRecords);
  }

  // Get medical record by ID
  async getMedicalRecordById(req, res) {
    const { recordId } = req.params;

    const medicalRecord = await MedicalRecordModel.getMedicalRecordById(recordId);
    if (!medicalRecord) {
      throw new AppError('Medical record not found', 404);
    }

    res.json(medicalRecord);
  }

  // Get detailed medical record
  async getMedicalRecordDetails(req, res) {
    const { recordId } = req.params;

    const medicalRecord = await MedicalRecordModel.getMedicalRecordDetails(recordId);
    if (!medicalRecord) {
      throw new AppError('Medical record not found', 404);
    }

    res.json(medicalRecord);
  }

  // Update medical record
  async updateMedicalRecord(req, res) {
    const { recordId } = req.params;
    const recordData = req.body;

    // Validate input
    const validationErrors = validator.validateMedicalRecordUpdate(recordData);
    if (validationErrors.length > 0) {
      throw new AppError('Validation failed', 400, validationErrors);
    }

    // Ensure only the original doctor or an admin can update
    const originalRecord = await MedicalRecordModel.getMedicalRecordById(recordId);
    if (
      originalRecord.doctor_id !== req.user.staffId && 
      req.user.roleId !== 1 // Admin role
    ) {
      throw new AppError('Unauthorized to update this record', 403);
    }

    const updatedMedicalRecord = await MedicalRecordModel.updateMedicalRecord(
      recordId, 
      recordData
    );

    res.json(updatedMedicalRecord);
  }

  // Add follow-up notes
  async addFollowUpNotes(req, res) {
    const { recordId } = req.params;
    const followUpData = req.body;

    // Validate input
    const validationErrors = validator.validateFollowUpNotes(followUpData);
    if (validationErrors.length > 0) {
      throw new AppError('Validation failed', 400, validationErrors);
    }

    // Add doctor ID from authenticated user
    followUpData.doctor_id = req.user.staffId;

    const updatedMedicalRecord = await MedicalRecordModel.addFollowUpNotes(
      recordId, 
      followUpData
    );

    res.json(updatedMedicalRecord);
  }
}

module.exports = new MedicalRecordController();