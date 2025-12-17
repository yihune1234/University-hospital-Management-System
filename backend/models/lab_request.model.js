const { query, transaction } = require('../config/db');

class LabRequestModel {
  // Create a new lab request
  async createLabRequest(requestData) {
    const { 
      patient_id,
      doctor_id,
      clinic_id = null,
      test_type = null,
      notes = null
    } = requestData;

    const sql = `
      INSERT INTO lab_requests 
      (patient_id, doctor_id, clinic_id, test_type, notes, status)
      VALUES (?, ?, ?, ?, ?, 'Pending')
    `;

    const result = await query(sql, [
      patient_id,
      doctor_id,
      clinic_id,
      test_type,
      notes
    ]);

    return this.getLabRequestById(result.insertId);
  }
  // Get lab request by ID 
  async getLabRequestById(requestId) {
    const requestSql = `
      SELECT 
        lr.*,
        CONCAT(p.first_name, ' ', COALESCE(p.middle_name, ''), ' ', p.last_name) AS patient_name,
        s.first_name AS doctor_first_name,
        s.last_name AS doctor_last_name
      FROM lab_requests lr
      JOIN patients p ON lr.patient_id = p.patient_id
      LEFT JOIN staff s ON lr.doctor_id = s.staff_id
      WHERE lr.request_id = ?
    `;

    const [request] = await query(requestSql, [requestId]);
    return request;
  }
  // Search lab requests 
  async searchLabRequests(filters) {
    const { 
      patient_id,
      doctor_id, 
      status, 
      start_date, 
      end_date, 
      test_type,
      limit = 50, 
      offset = 0 
    } = filters;
    
    let sql = `
      SELECT 
        lr.request_id,
        lr.patient_id,
        CONCAT(p.first_name, ' ', COALESCE(p.middle_name, ''), ' ', p.last_name) AS patient_name,
        lr.doctor_id,
        s.first_name AS doctor_first_name,
        s.last_name AS doctor_last_name,
        lr.test_type,
        lr.status,
        lr.requested_at
      FROM lab_requests lr
      JOIN patients p ON lr.patient_id = p.patient_id
      LEFT JOIN staff s ON lr.doctor_id = s.staff_id
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
    if (start_date) {
      sql += ' AND lr.requested_at >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND lr.requested_at <= ?';
      params.push(end_date);
    }
    if (test_type) {
      sql += ' AND lr.test_type LIKE ?';
      params.push(`%${test_type}%`);
    }

    sql += ' ORDER BY lr.requested_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return await query(sql, params);
  }

  // Update lab request status
  async updateLabRequestStatus(requestId, statusData) {
    const { status, notes } = statusData;
    
    const sql = `
      UPDATE lab_requests 
      SET status = ?, 
          notes = CONCAT(COALESCE(notes, ''), '\n', ?)
      WHERE request_id = ?
    `;

    await query(sql, [status, notes || '', requestId]);
    return this.getLabRequestById(requestId);
  }

  // Add lab test results
  async addLabTestResults(requestId, resultsData) {
    const { result_data, performed_by } = resultsData;
    
    // Insert lab result
    const resultSql = `
      INSERT INTO lab_results 
      (request_id, result_data, performed_by) 
      VALUES (?, ?, ?)
    `;
    
    await query(resultSql, [requestId, result_data, performed_by]);
    
    // Update lab request status to completed
    await query(
      'UPDATE lab_requests SET status = ? WHERE request_id = ?', 
      ['Completed', requestId]
    );
    
    return this.getLabRequestById(requestId);
  }
  // Get detailed lab request with results
  async getLabRequestDetails(requestId) {
    const requestSql = `
      SELECT 
        lr.*, 
        CONCAT(p.first_name, ' ', COALESCE(p.middle_name, ''), ' ', p.last_name) AS patient_name,
        s_doctor.first_name AS doctor_first_name, 
        s_doctor.last_name AS doctor_last_name
      FROM lab_requests lr 
      JOIN patients p ON lr.patient_id = p.patient_id 
      LEFT JOIN staff s_doctor ON lr.doctor_id = s_doctor.staff_id 
      WHERE lr.request_id = ?
    `;
    
    const resultsSql = `
      SELECT 
        result_id,
        result_data,
        result_date,
        s.first_name AS performed_by_first_name,
        s.last_name AS performed_by_last_name
      FROM lab_results lr
      LEFT JOIN staff s ON lr.performed_by = s.staff_id
      WHERE lr.request_id = ?
    `;

    const [request] = await query(requestSql, [requestId]);
    const results = await query(resultsSql, [requestId]);

    return {
      ...request,
      results
    };
  }
}

module.exports = { LabRequestModel, labRequestModel: new LabRequestModel() };