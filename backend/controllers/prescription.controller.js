
const PrescriptionModel = require('../models/prescription.model');
const { AppError } = require('../middleware/error.middleware');
const validator = require('../utils/validator');

class PrescriptionController {
  // Create a new prescription
  async createPrescription(req, res) {
    const prescriptionData = req.body;

    // Validate input
    const validationErrors = validator.validatePrescription(prescriptionData);
    if (validationErrors.length > 0) {
      throw new AppError('Validation failed', 400, validationErrors);
    }

    // Add doctor ID from authenticated user
    // prescriptionData.doctor_id = req.user.staffId;

    // Create prescription
    const prescription = await PrescriptionModel.createPrescription(prescriptionData);

    res.status(201).json(prescription);
  }

  // Search prescriptions
  async searchPrescriptions(req, res) {
    const filters = req.query;

    const prescriptions = await PrescriptionModel.searchPrescriptions(filters);
    res.json(prescriptions);
  }

  // Get prescription by ID
  async getPrescriptionById(req, res) {
    const { prescriptionId } = req.params;

    const prescription = await PrescriptionModel.getPrescriptionById(prescriptionId);
    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }

    res.json(prescription);
  }

  // Update prescription status
  async updatePrescriptionStatus(req, res) {
    const { prescriptionId } = req.params;
    const { status } = req.body;

    // Validate status
    // const validStatuses = ['Active', 'Completed', 'Cancelled'];
    // if (!validStatuses.includes(status)) {
    //   throw new AppError('Invalid prescription status', 400);
    // }

    const updatedPrescription = await PrescriptionModel.updatePrescription(
      prescriptionId, 
      status
    );

    res.json(updatedPrescription);
  }

  // Add prescription refill
  async addPrescriptionRefill(req, res) {
    const { prescriptionId } = req.params;
    const refillData = req.body;

    // Validate input
    const validationErrors = validator.validatePrescriptionRefill(refillData);
    if (validationErrors.length > 0) {
      throw new AppError('Validation failed', 400, validationErrors);
    }

    const newPrescription = await PrescriptionModel.addPrescriptionRefill(
      prescriptionId, 
      refillData
    );

    res.status(201).json(newPrescription);
  }

  // Check prescription fulfillment status
  async checkPrescriptionFulfillment(req, res) {
    const { prescriptionId } = req.params;

    const fulfillmentStatus = await PrescriptionModel.checkPrescriptionFulfillment(
      prescriptionId
    );

    res.json(fulfillmentStatus);
  }
}

module.exports = new PrescriptionController();