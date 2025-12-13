

const ReferralModel = require('../models/referral.model');
const { AppError } = require('../middleware/error.middleware');
const validator = require('../utils/validator');

class ReferralController {
  // Create a new referral
  async createReferral(req, res) {
    const referralData = req.body;

    // Validate input
    const validationErrors = validator.validateReferral(referralData);
    if (validationErrors.length > 0) {
      throw new AppError('Validation failed', 400, validationErrors);
    }

    // Add referring doctor ID from authenticated user
    referralData.referring_doctor_id = req.user.staffId;

    // Create referral
    const referral = await ReferralModel.createReferral(referralData);

    res.status(201).json(referral);
  }

  // Search referrals
  async searchReferrals(req, res) {
    const filters = req.query;

    const referrals = await ReferralModel.searchReferrals(filters);
    res.json(referrals);
  }

  // Get referral by ID
  async getReferralById(req, res) {
    const { referralId } = req.params;

    const referral = await ReferralModel.getReferralById(referralId);
    if (!referral) {
      throw new AppError('Referral not found', 404);
    }

    res.json(referral);
  }

  // Update referral status
  async updateReferralStatus(req, res) {
    const { referralId } = req.params;
    const statusData = req.body;

    // Validate input
    const validationErrors = validator.validateReferralStatusUpdate(statusData);
    if (validationErrors.length > 0) {
      throw new AppError('Validation failed', 400, validationErrors);
    }

    // Add receiving doctor ID from authenticated user if not provided
    if (!statusData.receiving_doctor_id) {
      statusData.receiving_doctor_id = req.user.staffId;
    }

    const updatedReferral = await ReferralModel.updateReferralStatus(
      referralId, 
      statusData
    );

    res.json(updatedReferral);
  }

  // Get referral tracking history
  async getReferralTrackingHistory(req, res) {
    const { referralId } = req.params;

    const trackingHistory = await ReferralModel.getReferralTrackingHistory(referralId);
    res.json(trackingHistory);
  }

  // Add referral tracking entry
  async addReferralTrackingEntry(req, res) {
    const { referralId } = req.params;
    const trackingData = req.body;

    // Validate input
    const validationErrors = validator.validateReferralTrackingEntry(trackingData);
    if (validationErrors.length > 0) {
      throw new AppError('Validation failed', 400, validationErrors);
    }

    // Add staff ID from authenticated user
    trackingData.staff_id = req.user.staffId;

    const trackingEntryId = await ReferralModel.addReferralTrackingEntry(
      referralId, 
      trackingData
    );

    res.status(201).json({
      tracking_entry_id: trackingEntryId,
      message: 'Tracking entry added successfully'
    });
  }
}

module.exports = new ReferralController();