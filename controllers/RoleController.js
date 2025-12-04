const RoleModel = require('../models/RoleModel');

const RoleController = {
  // ============================
  // CREATE ROLE
  // ============================
  async create(req, res) {
    try {
      const { role_name, description, permission_level } = req.body;

      if (!role_name || permission_level == null) {
        return res.status(400).json({ error: 'role_name and permission_level are required' });
      }

      const newRole = await RoleModel.create({ role_name, description, permission_level });
      if (!newRole) {
        return res.status(409).json({ error: 'Role already exists' });
      }

      return res.status(201).json({ message: 'Role created successfully', role: newRole });
    } catch (err) {
      console.error('CREATE ROLE ERROR:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // ============================
  // GET ALL ROLES
  // ============================
  async getAll(req, res) {
    try {
      const roles = await RoleModel.getAll();
      res.json(roles);
    } catch (err) {
      console.error('GET ROLES ERROR:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // ============================
  // GET ROLE BY ID
  // ============================
  async getById(req, res) {
    try {
      const { id } = req.params;
      const role = await RoleModel.findById(id);

      if (!role) return res.status(404).json({ error: 'Role not found' });

      res.json(role);
    } catch (err) {
      console.error('GET ROLE BY ID ERROR:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // ============================
  // UPDATE ROLE
  // ============================
  async update(req, res) {
    try {
      const { id } = req.params;

      const updated = await RoleModel.update(id, req.body);
      if (!updated) return res.status(404).json({ error: 'Role not found' });

      res.json({ message: 'Role updated successfully', role: updated });
    } catch (err) {
      console.error('UPDATE ROLE ERROR:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // ============================
  // DELETE ROLE
  // ============================
  async remove(req, res) {
    try {
      const { id } = req.params;

      const role = await RoleModel.findById(id);
      if (!role) return res.status(404).json({ error: 'Role not found' });

      await RoleModel.remove(id);
      res.json({ message: 'Role deleted successfully' });
    } catch (err) {
      console.error('DELETE ROLE ERROR:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = RoleController;
