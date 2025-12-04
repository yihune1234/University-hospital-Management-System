const ClinicModel = require('../models/ClinicModel');

const clinicController = {
  async create(req, res, next) {
    try {
      const clinic = await ClinicModel.create(req.body);
      res.json(clinic);
    } catch (err) { next(err); }
  },

  async list(req, res, next) {
    try {
      const clinics = await ClinicModel.getAll();
      res.json(clinics);
    } catch (err) { next(err); }
  },

  async get(req, res, next) {
    try {
      const clinic = await ClinicModel.getById(req.params.id);
      if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
      res.json(clinic);
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const clinic = await ClinicModel.update(req.params.id, req.body);
      res.json(clinic);
    } catch (err) { next(err); }
  },

  async remove(req, res, next) {
    try {
      await ClinicModel.remove(req.params.id);
      res.json({ message: 'Clinic deleted' });
    } catch (err) { next(err); }
  }
};

module.exports = clinicController;
