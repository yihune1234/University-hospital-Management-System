const { query, transaction } = require('../config/db');
class BillingModel { // Create a new bill
 async createBill(billData) {
 const { patient_id, bill_items, payment_method = 'Pending', discount = 0, additional_notes } = billData;

 const connection = await query.getConnection();

try {
  await connection.beginTransaction();

  // Calculate total bill amount
  const totalAmount = bill_items.reduce((total, item) => 
    total + (item.quantity * item.unit_price), 0
  );
  const discountAmount = totalAmount * (discount / 100);
  const finalAmount = totalAmount - discountAmount;

  // Insert bill master record
  const billSql = `
    INSERT INTO bills 
    (patient_id, total_amount, discount_percentage, 
     discount_amount, final_amount, payment_method, 
     additional_notes, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
  `;
  const billResult = await connection.query(billSql, [
    patient_id,
    totalAmount,
    discount,
    discountAmount,
    finalAmount,
    payment_method,
    additional_notes
  ]);
  const billId = billResult[0].insertId;

  // Insert bill items
  const itemInsertPromises = bill_items.map(async (item) => {
    const itemSql = `
      INSERT INTO bill_items 
      (bill_id, service_type, description, 
       quantity, unit_price, total_price) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    return connection.query(itemSql, [
      billId,
      item.service_type,
      item.description,
      item.quantity,
      item.unit_price,
      item.quantity * item.unit_price
    ]);
  });

  await Promise.all(itemInsertPromises);

  // Commit transaction
  await connection.commit();

  // Retrieve and return the full bill
  return this.getBillById(billId);
} catch (error) {
  // Rollback transaction in case of error
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
}

// Get bill by ID with detailed information 
async getBillById(billId) { 
    const billSql = `SELECT b.*,
     p.full_name AS patient_name, p.university_id,
      p.contact AS patient_contact FROM bills b JOIN patients p ON
 b.patient_id = p.patient_id WHERE b.bill_id = ? `;
 const itemsSql = `
  SELECT 
    bill_item_id,
    service_type,
    description,
    quantity,
    unit_price,
    total_price
  FROM bill_items
  WHERE bill_id = ?
`;

const paymentsSql = `
  SELECT 
    payment_id,
    amount,
    payment_method,
    payment_date,
    status
  FROM payments
  WHERE bill_id = ?
  ORDER BY payment_date
`;

const [bill] = await query(billSql, [billId]);
const items = await query(itemsSql, [billId]);
const payments = await query(paymentsSql, [billId]);

return {
  ...bill,
  items,
  payments
};
}

// Search bills with advanced filtering 
async searchBills(filters) 
{ const { patient_id, status, start_date, end_date, min_amount, max_amount, payment_method,
 limit = 50, offset = 0 } = filters;
 let sql = `
  SELECT 
    b.bill_id,
    b.patient_id,
    p.full_name AS patient_name,
    b.total_amount,
    b.final_amount,
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
  sql += ' AND b.final_amount >= ?';
  params.push(min_amount);
}
if (max_amount !== undefined) {
  sql += ' AND b.final_amount <= ?';
  params.push(max_amount);
}
if (payment_method) {
  sql += ' AND b.payment_method = ?';
  params.push(payment_method);
}

sql += ' GROUP BY b.bill_id ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
params.push(limit, offset);

return await query(sql, params);
}

// Process bill payment 
async processBillPayment(billId, paymentData) 
{ 
    const connection = await query.getConnection();
    try {
  await connection.beginTransaction();

  // Get bill details
  const [bill] = await connection.query(
    'SELECT bill_id, final_amount, status FROM bills WHERE bill_id = ? FOR UPDATE',
    [billId]
  );

  if (!bill) {
    throw new Error('Bill not found');
  }

  // Check if bill is already paid or cancelled
  if (bill.status === 'Paid' || bill.status === 'Cancelled') {
    throw new Error(`Cannot process payment. Bill status: ${bill.status}`);
  }

  const {
    amount,
    payment_method,
    payment_reference,
    additional_notes
  } = paymentData;

  // Validate payment amount
  const remainingBalance = bill.final_amount;
  if (amount > remainingBalance) {
    throw new Error('Payment amount exceeds bill total');
  }

  // Insert payment record
  const paymentSql = `
    INSERT INTO payments 
    (bill_id, amount, payment_method, 
     payment_reference, additional_notes, status) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const paymentResult = await connection.query(paymentSql, [
    billId,
    amount,
    payment_method,
    payment_reference,
    additional_notes,
    'Completed'
  ]);

  // Update bill status if fully paid
  const updateBillSql = `
    UPDATE bills 
    SET status = ?, 
        payment_method = ?,
        paid_amount = COALESCE(paid_amount, 0) + ?,
        updated_at = NOW()
    WHERE bill_id = ?
  `;
  const newStatus = amount >= remainingBalance ? 'Paid' : 'Partially Paid';
  await connection.query(updateBillSql, [
    newStatus,
    payment_method,
    amount,
    billId
  ]);

  // Commit transaction
  await connection.commit();

  // Retrieve and return the updated bill
  return this.getBillById(billId);
} catch (error) {
  // Rollback transaction in case of error
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
}

// Update bill status 
async updateBillStatus(billId, status)
 { const sql =` UPDATE bills SET status = ?, updated_at = NOW() WHERE bill_id = ?`;
    await query(sql, [status, billId]);
return this.getBillById(billId);
}

// Generate financial reports 

async generateFinancialReport(reportParams)
 { const { start_date, end_date, report_type = 'daily' } = reportParams;
 let sql, groupBy;
switch (report_type) {
  case 'daily':
    groupBy = 'DATE(created_at)';
    break;
  case 'weekly':
    groupBy = 'YEARWEEK(created_at)';
    break;
  case 'monthly':
    groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
    break;
  default:
    groupBy = 'DATE(created_at)';
}

sql = `
  SELECT 
    ${groupBy} AS period,
    COUNT(bill_id) AS total_bills,
    SUM(total_amount) AS total_billed,
    SUM(final_amount) AS total_revenue,
    SUM(COALESCE(paid_amount, 0)) AS total_collected,
    AVG(final_amount) AS average_bill_amount
  FROM bills
  WHERE created_at BETWEEN ? AND ?
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
    p.full_name AS patient_name,
    b.total_amount,
    b.final_amount,
    b.final_amount - COALESCE(
      (SELECT SUM(amount) FROM payments WHERE bill_id = b.bill_id), 
      0
    ) AS outstanding_amount,
    DATEDIFF(CURRENT_DATE, b.created_at) AS days_overdue
  FROM bills b
  JOIN patients p ON b.patient_id = p.patient_id
  WHERE b.status != 'Paid'
    AND b.final_amount > COALESCE(
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
} }

module.exports = new BillingModel()