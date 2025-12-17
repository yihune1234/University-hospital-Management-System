const db = require('../config/db');

class PharmacyModel {
  // Get all drugs from pharmacy inventory
  static async getAllDrugs() {
    const [rows] = await db.query(`
      SELECT 
        drug_id,
        drug_name,
        brand,
        batch_number,
        stock_quantity,
        unit,
        expiry_date,
        created_at
      FROM pharmacy_inventory
      WHERE stock_quantity > 0
      ORDER BY drug_name ASC
    `);
    return rows;
  }

  // Get drug by ID
  static async getDrugById(drugId) {
    const [rows] = await db.query(`
      SELECT 
        drug_id,
        drug_name,
        brand,
        batch_number,
        stock_quantity,
        unit,
        expiry_date,
        created_at
      FROM pharmacy_inventory
      WHERE drug_id = ?
    `, [drugId]);
    return rows[0];
  }

  // Search drugs
  static async searchDrugs(searchTerm) {
    const [rows] = await db.query(`
      SELECT 
        drug_id,
        drug_name,
        brand,
        batch_number,
        stock_quantity,
        unit,
        expiry_date,
        created_at
      FROM pharmacy_inventory
      WHERE drug_name LIKE ? OR brand LIKE ?
      ORDER BY drug_name ASC
    `, [`%${searchTerm}%`, `%${searchTerm}%`]);
    return rows;
  }

  // Get drugs with low stock
  static async getLowStockDrugs(threshold = 10) {
    const [rows] = await db.query(`
      SELECT 
        drug_id,
        drug_name,
        brand,
        batch_number,
        stock_quantity,
        unit,
        expiry_date,
        created_at
      FROM pharmacy_inventory
      WHERE stock_quantity <= ?
      ORDER BY stock_quantity ASC
    `, [threshold]);
    return rows;
  }

  // Create new drug
  static async createDrug(drugData) {
    const { drug_name, brand, batch_number, stock_quantity, unit, expiry_date } = drugData;
    const [result] = await db.query(`
      INSERT INTO pharmacy_inventory 
      (drug_name, brand, batch_number, stock_quantity, unit, expiry_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [drug_name, brand, batch_number, stock_quantity, unit, expiry_date]);
    return result.insertId;
  }

  // Update drug
  static async updateDrug(drugId, drugData) {
    const { drug_name, brand, batch_number, stock_quantity, unit, expiry_date } = drugData;
    await db.query(`
      UPDATE pharmacy_inventory
      SET drug_name = ?, brand = ?, batch_number = ?, 
          stock_quantity = ?, unit = ?, expiry_date = ?
      WHERE drug_id = ?
    `, [drug_name, brand, batch_number, stock_quantity, unit, expiry_date, drugId]);
  }

  // Update stock quantity
  static async updateStock(drugId, quantity) {
    await db.query(`
      UPDATE pharmacy_inventory
      SET stock_quantity = ?
      WHERE drug_id = ?
    `, [quantity, drugId]);
  }

  // Delete drug
  static async deleteDrug(drugId) {
    await db.query('DELETE FROM pharmacy_inventory WHERE drug_id = ?', [drugId]);
  }
}

module.exports = PharmacyModel;
