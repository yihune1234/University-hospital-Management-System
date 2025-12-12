const { pool,query} = require('../config/db');

class LabRequestModel { // Create a new lab request
 async createLabRequest(requestData) 
{ const { patient_id, 
    doctor_id,
     medical_record_id, 
     test_types, 
     urgency = 'Normal', 
     notes } = requestData;
     const connection = await pool.getConnection();

try {
  await connection.beginTransaction();

  // Insert lab request
  const labRequestSql = `
    INSERT INTO lab_requests 
    (patient_id, doctor_id, medical_record_id, urgency, notes, status) 
    VALUES (?, ?, ?, ?, ?, 'Pending')
  `;
  const labRequestResult = await connection.query(labRequestSql, [
    patient_id,
    doctor_id,
    medical_record_id,
    urgency,
    notes
  ]);
  const requestId = labRequestResult[0].insertId;

  // Insert lab request tests
  const testInsertPromises = test_types.map(testType => {
    const testSql = `
      INSERT INTO lab_request_tests 
      (request_id, test_type, status) 
      VALUES (?, ?, 'Pending')
    `;
    return connection.query(testSql, [requestId, testType]);
  });

  await Promise.all(testInsertPromises);

  // Commit transaction
  await connection.commit();

  // Retrieve and return the full lab request
  return this.getLabRequestById(requestId);
} catch (error) {
  // Rollback transaction in case of error
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
}

// Get lab request by ID 
async getLabRequestById(requestId) 
{ 
    const requestSql = 'SELECT lr.*, p.full_name AS patient_name, s.first_name AS doctor_first_name, s.last_name AS doctor_last_name FROM lab_requests lr JOIN patients p ON lr.patient_id = p.patient_id JOIN staff s ON lr.doctor_id = s.staff_id WHERE lr.request_id = ?' ;
    const testsSql = `
  SELECT 
    request_id,
    test_type,
    status
  FROM lab_request_tests
  WHERE request_id = ?
`;

const [request] = await query(requestSql, [requestId]);
const tests = await query(testsSql, [requestId]);

return {
  ...request,
  tests
};
}
// Search lab requests 
async searchLabRequests(filters) 
{
    const { patient_id,
         doctor_id, 
         status, 
         urgency, 
         start_date, 
         end_date, 
         test_type,
          limit = 50, 
offset = 0 } = filters;
let sql = `
  SELECT 
    lr.request_id,
    lr.patient_id,
    p.full_name AS patient_name,
    lr.doctor_id,
    s.first_name AS doctor_first_name,
    s.last_name AS doctor_last_name,
    lr.status,
    lr.urgency,
    lr.created_at
  FROM lab_requests lr
  JOIN patients p ON lr.patient_id = p.patient_id
  JOIN staff s ON lr.doctor_id = s.staff_id
  LEFT JOIN lab_request_tests lrt ON lr.request_id = lrt.request_id
  WHERE 1=1
`;
const params = [];

if (patient_id) {
  sql += ' AND lr.patient_id = ?';
  params.push(patient_id);
}
if (doctor_id) {
  sql += ' AND lr.doctor_id = ?';
  params.push(doctor_id);
}
if (status) {
  sql += ' AND lr.status = ?';
  params.push(status);
}
if (urgency) {
  sql += ' AND lr.urgency = ?';
  params.push(urgency);
}
if (start_date) {
  sql += ' AND lr.created_at >= ?';
  params.push(start_date);
}
if (end_date) {
  sql += ' AND lr.created_at <= ?';
  params.push(end_date);
}
if (test_type) {
  sql += ' AND lrt.test_type = ?';
  params.push(test_type);
}

sql += ' GROUP BY lr.request_id ORDER BY lr.created_at DESC LIMIT ? OFFSET ?';
params.push(limit, offset);

return await query(sql, params);
}

// Update lab request status
 async updateLabRequestStatus(requestId, statusData)
 { const { status, technician_id, notes } = statusData;
 const sql = `
  UPDATE lab_requests 
  SET status = ?, 
      technician_id = ?, 
      notes = ?,
      updated_at = NOW()
  WHERE request_id = ?
`;

await query(sql, [status, technician_id, notes, requestId]);
return this.getLabRequestById(requestId);

}

// Add lab test results
 async addLabTestResults(requestId, resultsData) 
 { 
    const connection = await query.getConnection();
    try {
  await connection.beginTransaction();

  // Insert or update lab results
  const resultSql = `
    INSERT INTO lab_results 
    (request_id, result_data, result_date, status, technician_id) 
    VALUES (?, ?, NOW(), ?, ?)
    ON DUPLICATE KEY UPDATE 
    result_data = ?, 
    status = ?, 
    technician_id = ?
  `;

  const updateTestStatusSql = `
    UPDATE lab_request_tests 
    SET status = ? 
    WHERE request_id = ? AND test_type = ?
  `;

  // Process each test result
  for (const testResult of resultsData) {
    const {
      test_type,
      result_data,
      status = 'Completed',
      technician_id
    } = testResult;

    // Insert/Update result
    await connection.query(resultSql, [
      requestId,
      result_data,
      status,
      technician_id,
      result_data,
      status,
      technician_id
    ]);

    // Update test status
    await connection.query(updateTestStatusSql, [status, requestId, test_type]);
  }

  // Check if all tests are completed
  const checkAllCompletedSql = `
    SELECT COUNT(*) as pending_count 
    FROM lab_request_tests 
    WHERE request_id = ? AND status != 'Completed'
  `;
  const [pendingCheck] = await connection.query(checkAllCompletedSql, [requestId]);

  // Update overall request status if all tests are completed
  if (pendingCheck[0].pending_count === 0) {
    const updateRequestSql = `
      UPDATE lab_requests 
      SET status = 'Completed', 
          updated_at = NOW() 
      WHERE request_id = ?
    `;
    await connection.query(updateRequestSql, [requestId]);
  }

  // Commit transaction
  await connection.commit();

  // Retrieve and return the updated lab request
  return this.getLabRequestById(requestId);
} catch (error) {
  // Rollback transaction in case of error
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
 }
// Get detailed lab request with results
async getLabRequestDetails(requestId)
 { const requestSql =`SELECT lr.*, p.full_name AS patient_name, p.university_id, s_doctor.first_name AS doctor_first_name, s_doctor.last_name AS doctor_last_name, s_tech.first_name AS technician_first_name, s_tech.last_name AS technician_last_name FROM lab_requests lr JOIN patients p ON lr.patient_id = p.patient_id JOIN staff s_doctor ON lr.doctor_id = s_doctor.staff_id LEFT JOIN staff s_tech ON lr.technician_id = s_tech.staff_id WHERE lr.request_id = ? `;
    const testsSql = `
  SELECT 
    lrt.test_type,
    lrt.status AS test_status,
    lr.result_data,
    lr.result_date,
    lr.status AS result_status
  FROM lab_request_tests lrt
  LEFT JOIN lab_results lr ON lrt.request_id = lr.request_id AND lrt.test_type = lr.test_type
  WHERE lrt.request_id = ?
`;

const [request] = await query(requestSql, [requestId]);
const tests = await query(testsSql, [requestId]);

return {
  ...request,
  tests
};
} }

module.exports = {LabRequestModel,labRequestModel:new LabRequestModel()};