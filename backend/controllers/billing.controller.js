
const BillingModel = require('../models/billing.model');
const { AppError } = require('../middleware/error.middleware');
const validator = require('../utils/validator');

class BillingController {
  // Create a new bill
  async createBill(req, res) {
    const billData = req.body;

    // Validate input
    const validationErrors = validator.validateBillCreation(billData);
    if (validationErrors.length > 0) {
      throw new AppError('Validation failed', 400, validationErrors);
    }

    // Create bill
    const bill = await BillingModel.createBill(billData);

    res.status(201).json(bill);
  }

  // Search bills
  async searchBills(req, res) {
    const filters = req.query;

    const bills = await BillingModel.searchBills(filters);
    res.json(bills);
  }

  // Get bill by ID
  async getBillById(req, res) {
    const { billId } = req.params;

    const bill = await BillingModel.getBillById(billId);
    if (!bill) {
      throw new AppError('Bill not found', 404);
    }

    res.json(bill);
  }

  // Process bill payment
  async processBillPayment(req, res) {
    const { billId } = req.params;
    const paymentData = req.body;

    // Validate input
    const validationErrors = validator.validateBillPayment(paymentData);
    if (validationErrors.length > 0) {
      throw new AppError('Validation failed', 400, validationErrors);
    }

    // Process payment
    const updatedBill = await BillingModel.processBillPayment(
      billId, 
      paymentData
    );

    res.json(updatedBill);
  }

  // Update bill status
  async updateBillStatus(req, res) {
    const { billId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['Pending', 'Partially Paid', 'Paid', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid bill status', 400);
    }

    const updatedBill = await BillingModel.updateBillStatus(
      billId, 
      status
    );

    res.json(updatedBill);
  }

  // Generate financial report
  async generateFinancialReport(req, res) {
    const reportParams = req.query;

    // Validate input
    const validationErrors = validator.validateFinancialReportParams(reportParams);
    if (validationErrors.length > 0) {
      throw new AppError('Validation failed', 400, validationErrors);
    }

    const financialReport = await BillingModel.generateFinancialReport(reportParams);
    res.json(financialReport);
  }

  // Get outstanding bills
  async getOutstandingBills(req, res) {
    const filters = req.query;

    const outstandingBills = await BillingModel.getOutstandingBills(filters);
    res.json(outstandingBills);
  }
}

module.exports = new BillingController();