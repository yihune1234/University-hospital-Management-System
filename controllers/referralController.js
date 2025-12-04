const ReferralModel = require('../models/ReferralModel');
const { pool } = require('../config/db');

const referralController = {

  // Create a referral (auto-detect inter or intra campus)
  async create(req, res, next) {
    try {
      const {
        patient_id,
        from_clinic_id,
        to_clinic_id, // may be overridden for inter-campus rules
        reason,
        referring_doctor_id,
        receiving_doctor_id
      } = req.body;

      // 1. Get campus of FROM clinic
      const [from] = await pool.query(
        `SELECT campus_id FROM clinics WHERE clinic_id = ?`,
        [from_clinic_id]
      );
      const fromCampus = from[0].campus_id;

      // 2. Get campus of TO clinic
      const [to] = await pool.query(
        `SELECT campus_id FROM clinics WHERE clinic_id = ?`,
        [to_clinic_id]
      );
      const toCampus = to[0].campus_id;

      let finalToClinic = to_clinic_id;

      // 3. Apply inter-campus referral rule
      if (fromCampus !== toCampus) {
        // Techno (2) or Veterinary (3) → Main Campus (1)
        if (fromCampus == 2 || fromCampus == 3) {
          const [mainClinic] = await pool.query(`
            SELECT clinic_id 
            FROM clinics 
            WHERE campus_id = 1 AND type = 'General'
            LIMIT 1
          `);

          if (mainClinic.length === 0)
            return res.status(400).json({ error: "Main Campus does not have a receiving clinic" });

          finalToClinic = mainClinic[0].clinic_id;
        }
      }

      // 4. Create referral
      const result = await ReferralModel.create({
        patient_id,
        from_clinic_id,
        to_clinic_id: finalToClinic,
        reason,
        referring_doctor_id,
        receiving_doctor_id
      });

      return res.json({
        message: "Referral created successfully",
        referral_id: result.referral_id
      });

    } catch (err) {
      next(err);
    }
  },


  // Get all referrals
  async list(req, res, next) {
    try {
      const referrals = await ReferralModel.findAll();
      res.json(referrals);
    } catch (err) {
      next(err);
    }
  },

  // Get single referral
  async get(req, res, next) {
    try {
      const referral = await ReferralModel.findById(req.params.id);
      if (!referral) return res.status(404).json({ error: "Referral not found" });
      res.json(referral);
    } catch (err) {
      next(err);
    }
  },

  // Accept referral
  async accept(req, res, next) {
    try {
      const referral_id = req.params.id;
      const { receiving_doctor_id } = req.body;

      const updated = await ReferralModel.updateStatus(referral_id, 'Accepted', receiving_doctor_id);
      res.json({ message: "Referral accepted", updated });
    } catch (err) {
      next(err);
    }
  },

  // Reject referral
  async reject(req, res, next) {
    try {
      const referral_id = req.params.id;

      const updated = await ReferralModel.updateStatus(referral_id, 'Rejected');
      res.json({ message: "Referral rejected", updated });
    } catch (err) {
      next(err);
    }
  },

  // Complete referral
  async complete(req, res, next) {
    try {
      const referral_id = req.params.id;
      const updated = await ReferralModel.updateStatus(referral_id, 'Completed');
      res.json({ message: "Referral completed", updated });
    } catch (err) {
      next(err);
    }
  }

};

module.exports = referralController;
