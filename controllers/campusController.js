const CampusModel = require('../models/CampusModel');

const campusController = {
  async create(req, res, next) {
    try {
      const campus = await CampusModel.create(req.body);
      res.json(campus);
    } catch (err) { next(err); }
  },

  async list(req, res, next) {
    try {
      const rows = await CampusModel.getAll();
      res.json(rows);
    } catch (err) { next(err); }
  },

  async get(req, res, next) {
    try {
      const campus = await CampusModel.getById(req.params.id);
      if (!campus) return res.status(404).json({ error: 'Campus not found' });
      res.json(campus);
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const campus = await CampusModel.update(req.params.id, req.body);
      res.json(campus);
    } catch (err) { next(err); }
  },

  async remove(req, res, next) {
    try {
      await CampusModel.remove(req.params.id);
      res.json({ message: 'Campus deleted' });
    } catch (err) { next(err); }
  }
};

module.exports = campusController;
