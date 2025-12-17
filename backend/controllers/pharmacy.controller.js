const PharmacyModel = require('../models/pharmacy.model');
const { AppError } = require('../middleware/error.middleware');

class PharmacyController {
  async getAllDrugs(req, res) {
    const drugs = await PharmacyModel.getAllDrugs();
    res.json(drugs);
  }

  async getDrugById(req, res) {
    const { drugId } = req.params;
    const drug = await PharmacyModel.getDrugById(drugId);

    if (!drug) {
      throw new AppError('Drug not found', 404);
    }

    res.json(drug);
  }

  async searchDrugs(req, res) {
    const { search } = req.query;
    
    if (!search) {
      const drugs = await PharmacyModel.getAllDrugs();
      return res.json(drugs);
    }

    const drugs = await PharmacyModel.searchDrugs(search);
    res.json(drugs);
  }

  async getLowStockDrugs(req, res) {
    const { threshold } = req.query;
    const drugs = await PharmacyModel.getLowStockDrugs(threshold ? parseInt(threshold) : 10);
    res.json(drugs);
  }

  async createDrug(req, res) {
    const { drug_name, brand, batch_number, stock_quantity, unit, expiry_date } = req.body;

    if (!drug_name || !stock_quantity) {
      throw new AppError('Missing required fields: drug_name, stock_quantity', 400);
    }

    const drugId = await PharmacyModel.createDrug({
      drug_name,
      brand,
      batch_number,
      stock_quantity,
      unit,
      expiry_date
    });

    res.status(201).json({
      message: 'Drug added to inventory successfully',
      drug_id: drugId
    });
  }

  async updateDrug(req, res) {
    const { drugId } = req.params;
    const { drug_name, brand, batch_number, stock_quantity, unit, expiry_date } = req.body;

    const existing = await PharmacyModel.getDrugById(drugId);
    if (!existing) {
      throw new AppError('Drug not found', 404);
    }

    await PharmacyModel.updateDrug(drugId, {
      drug_name,
      brand,
      batch_number,
      stock_quantity,
      unit,
      expiry_date
    });

    res.json({ message: 'Drug updated successfully' });
  }

  async updateStock(req, res) {
    const { drugId } = req.params;
    const { stock_quantity } = req.body;

    if (stock_quantity === undefined) {
      throw new AppError('stock_quantity is required', 400);
    }

    await PharmacyModel.updateStock(drugId, stock_quantity);
    res.json({ message: 'Stock updated successfully' });
  }

  async deleteDrug(req, res) {
    const { drugId } = req.params;

    const existing = await PharmacyModel.getDrugById(drugId);
    if (!existing) {
      throw new AppError('Drug not found', 404);
    }

    await PharmacyModel.deleteDrug(drugId);
    res.json({ message: 'Drug deleted successfully' });
  }
}

module.exports = new PharmacyController();
