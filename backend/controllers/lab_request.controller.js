

const {LabRequestModel,labRequestModel} = require('../models/lab_request.model');
const { AppError } = require('../middleware/error.middleware');
const validator = require('../utils/validator');

class LabRequestController {
  // Create a new lab request
  async createLabRequest(req, res) {
    const requestData = req.body;

    // Validate input
    const validationErrors = validator.validateLabRequest(requestData);
    if (validationErrors.length > 0) {
      throw new AppError('Validation failed', 400, validationErrors);
    }

    // Add doctor ID from authenticated user
    // requestData.doctor_id = req.user.staffId;

    // Create lab request
    const labRequest = await labRequestModel.createLabRequest(requestData);

    res.status(201).json(labRequest);
  }

  // Search lab requests
  async searchLabRequests(req, res) {
    const filters = req.query;

    const labRequests = await labRequestModel.searchLabRequests(filters);
    res.json(labRequests);
  }

  // Get lab request by ID
  async getLabRequestById(req, res) {
    const { requestId } = req.params;

    const labRequest = await labRequestModel.getLabRequestById(requestId);
    if (!labRequest) {
      throw new AppError('Lab request not found', 404);
    }

    res.json(labRequest);
  }

  // Get detailed lab request
  async getLabRequestDetails(req, res) {
    const { requestId } = req.params;

    const labRequest = await labRequestModel.getLabRequestDetails(requestId);
    if (!labRequest) {
      throw new AppError('Lab request not found', 404);
    }

    res.json(labRequest);
  }

  // Update lab request status
  async updateLabRequestStatus(req, res) {
    const { requestId } = req.params;
    const statusData = req.body;

    // Validate input
    const validationErrors = validator.validateLabRequestStatusUpdate(statusData);
    if (validationErrors.length > 0) {
      throw new AppError('Validation failed', 400, validationErrors);
    }

    // Add technician ID from authenticated user
    statusData.technician_id = req.user.staffId;

    const updatedLabRequest = await labRequestModel.updateLabRequestStatus(
      requestId, 
      statusData
    );

    res.json(updatedLabRequest);
  }

  // Add lab test results
  async addLabTestResults(req, res) {
    const { requestId } = req.params;
    const resultsData = req.body;

    // Validate input
    const validationErrors = validator.validateLabTestResults(resultsData);
    if (validationErrors.length > 0) {
      throw new AppError('Validation failed', 400, validationErrors);
    }

    // Add technician ID from authenticated user
    const processedResults = resultsData.map(result => ({
      ...result,
      technician_id: req.user.staffId
    }));

    const updatedLabRequest = await labRequestModel.addLabTestResults(
      requestId, 
      processedResults
    );

    res.json(updatedLabRequest);
  }
}

module.exports = new LabRequestController();