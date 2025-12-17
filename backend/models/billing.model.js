const { query, transaction } = require('../config/db');

class BillingModel {
  // Create a new bill
  async createBill(billData) {
    const { patient_id, total_amount, status = 'Unpaid', due_date, notes } = billData;

    const sql = `
      INSERT INTO bills 
      (patient_id, total_amount, status, due_date, notes) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      patient_id,
      total_amount,
      status,
      due_date,
      notes
    ]);

    return this.getBillById(result.insertId);
  }



  // Get bill by ID with detailed information 
  async getBillById(billId) { 
    const billSql = `
      SELECT b.*,
             CONCAT(p.first_name, ' ', p.last_name) AS patient_name, 
             p.university_id,
             p.contact AS patient_contact 
      FROM bills b 
      JOIN patients p ON b.patient_id = p.patient_id 
      WHERE b.bill_id = ?
    `;

    const paymentsSql = `
      SELECT 
        payment_id,
        amount,
        payment_method,
        payment_date,
        created_by
      FROM payments
      WHERE bill_id = ?
      ORDER BY payment_date DESC
    `;

    const [bill] = await query(billSql, [billId]);
    const payments = await query(paymentsSql, [billId]);

    return {
      ...bill,
      payments
    };
  }

  // Search bills with advanced filtering 
  async searchBills(filters) {
    const { 
      patient_id, 
      status, 
      start_date, 
      end_date, 
      min_amount, 
      max_amount,
      limit = 50, 
      offset = 0 
    } = filters;
    
    let sql = `
      SELECT 
        b.bill_id,
        b.patient_id,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        b.total_amount,
        b.status,
        b.created_at,
        COALESCE(SUM(py.amount), 0) AS total_paid
      FROM bills b
      JOIN patients p ON b.patient_id = p.patient_id
      LEFT JOIN payments py ON b.bill_id = py.bill_id
      WHERE 1=1
    `;
    const params = [];

    if (patient_id) {
      sql += ' AND b.patient_id = ?';
      params.push(patient_id);
    }
    if (status) {
      sql += ' AND b.status = ?';
      params.push(status);
    }
    if (start_date) {
      sql += ' AND b.created_at >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND b.created_at <= ?';
      params.push(end_date);
    }
    if (min_amount !== undefined) {
      sql += ' AND b.total_amount >= ?';
      params.push(min_amount);
    }
    if (max_amount !== undefined) {
      sql += ' AND b.total_amount <= ?';
      params.push(max_amount);
    }

    sql += ' GROUP BY b.bill_id ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return await query(sql, params);
  }

  // Process bill payment 
  async processBillPayment(billId, paymentData) {
    const { amount, payment_method, payment_reference } = paymentData;

    // Get current bill details
    const [bill] = await query('SELECT * FROM bills WHERE bill_id = ?', [billId]);
    if (!bill) {
      throw new Error('Bill not found');
    }

    // Insert payment record
    const paymentSql = `
      INSERT INTO payments 
      (bill_id, amount, payment_method, payment_reference) 
      VALUES (?, ?, ?, ?)
    `;
    await query(paymentSql, [billId, amount, payment_method, payment_reference]);

    // Calculate total payments
    const [totalPayments] = await query(
      'SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments WHERE bill_id = ?', 
      [billId]
    );

    // Update bill status
    let newStatus = 'Unpaid';
    if (totalPayments.total_paid >= bill.total_amount) {
      newStatus = 'Paid';
    } else if (totalPayments.total_paid > 0) {
      newStatus = 'Partial';
    }

    await query('UPDATE bills SET status = ? WHERE bill_id = ?', [newStatus, billId]);

    return this.getBillById(billId);
  }

  // Update bill status 
  async updateBillStatus(billId, status) {
    const sql = `UPDATE bills SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE bill_id = ?`;
    await query(sql, [status, billId]);
    return this.getBillById(billId);
  }

  // Generate financial reports 
  async generateFinancialReport(reportParams) {
    const { start_date, end_date, report_type = 'daily' } = reportParams;
    
    let groupBy;
    switch (report_type) {
      case 'daily':
        groupBy = 'DATE(b.created_at)';
        break;
      case 'weekly':
        groupBy = 'YEARWEEK(b.created_at)';
        break;
      case 'monthly':
        groupBy = 'DATE_FORMAT(b.created_at, "%Y-%m")';
        break;
      default:
        groupBy = 'DATE(b.created_at)';
    }

    const sql = `
      SELECT 
        ${groupBy} AS period,
        COUNT(b.bill_id) AS total_bills,
        SUM(b.total_amount) AS total_billed,
        SUM(COALESCE(p.amount, 0)) AS total_collected,
        AVG(b.total_amount) AS average_bill_amount
      FROM bills b
      LEFT JOIN payments p ON b.bill_id = p.bill_id
      WHERE b.created_at BETWEEN ? AND ?
      GROUP BY period
      ORDER BY period
    `;

    return await query(sql, [start_date, end_date]);
  }

  // Get outstanding bills 
  async getOutstandingBills(filters) {
    const { patient_id, min_days_overdue = 0, limit = 50, offset = 0 } = filters;
    
    let sql = `
      SELECT 
        b.bill_id,
        b.patient_id,
        CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
        b.total_amount,
        b.total_amount - COALESCE(
          (SELECT SUM(amount) FROM payments WHERE bill_id = b.bill_id), 
          0
        ) AS outstanding_amount,
        DATEDIFF(CURRENT_DATE, b.created_at) AS days_overdue
      FROM bills b
      JOIN patients p ON b.patient_id = p.patient_id
      WHERE b.status != 'Paid'
        AND b.total_amount > COALESCE(
          (SELECT SUM(amount) FROM payments WHERE bill_id = b.bill_id), 
          0
        )
    `;
    const params = [];

    if (patient_id) {
      sql += ' AND b.patient_id = ?';
      params.push(patient_id);
    }

    sql += ' AND DATEDIFF(CURRENT_DATE, b.created_at) >= ?';
    params.push(min_days_overdue);

    sql += ' ORDER BY days_overdue DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return await query(sql, params);
  }
}

module.exports = new BillingModel();