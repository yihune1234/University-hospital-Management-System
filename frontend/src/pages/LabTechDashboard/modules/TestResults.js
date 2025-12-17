import { useState, useEffect, useContext } from 'react';
import api from '../../../utils/api';
import { AuthContext } from '../../../context/AuthContext';
import './ModuleStyles.css';

function TestResults() {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    result_data: '',
    performed_by: user?.staff_id || ''
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/lab-requests?status=In Progress');
      setRequests(res.data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRequest = async (request) => {
    try {
      const res = await api.get(`/lab-requests/${request.request_id}/details`);
      setSelectedRequest(res.data);
      setShowForm(true);
      setFormData({
        result_data: '',
        performed_by: user?.staff_id || ''
      });
    } catch (error) {
      console.error('Error loading request details:', error);
      alert('Failed to load request details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      await api.post(`/lab-requests/${selectedRequest.request_id}/results`, formData);
      alert('Test results submitted successfully!');
      setShowForm(false);
      setSelectedRequest(null);
      setFormData({
        result_data: '',
        performed_by: user?.staff_id || ''
      });
      loadRequests();
    } catch (error) {
      console.error('Error submitting results:', error);
      alert(error.response?.data?.message || 'Failed to submit results');
    }
  };

  if (loading) {
    return (
      <div className="module-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Enter Test Results</h2>
        <button className="btn btn-primary" onClick={loadRequests}>
          🔄 Refresh
        </button>
      </div>

      {/* Results Form */}
      {showForm && selectedRequest && (
        <div className="form-card">
          <div className="form-header">
            <h3>Submit Results for Request #{selectedRequest.request_id}</h3>
            <button className="btn-close" onClick={() => setShowForm(false)}>✖</button>
          </div>
          
          <div className="info-grid">
            <div className="info-item">
              <label>Patient:</label>
              <span><strong>{selectedRequest.patient_name}</strong></span>
            </div>
            <div className="info-item">
              <label>Test Type:</label>
              <span>{selectedRequest.test_type}</span>
            </div>
            <div className="info-item">
              <label>Requested By:</label>
              <span>Dr. {selectedRequest.doctor_first_name} {selectedRequest.doctor_last_name}</span>
            </div>
            <div className="info-item">
              <label>Requested Date:</label>
              <span>{selectedRequest.requested_at ? new Date(selectedRequest.requested_at).toLocaleString() : '-'}</span>
            </div>
          </div>

          {selectedRequest.notes && (
            <div className="notes-section">
              <label>Doctor's Notes:</label>
              <p>{selectedRequest.notes}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Test Results *</label>
              <textarea
                value={formData.result_data}
                onChange={(e) => setFormData({ ...formData, result_data: e.target.value })}
                required
                rows="8"
                placeholder="Enter detailed test results here...&#10;&#10;Example:&#10;- Hemoglobin: 14.5 g/dL (Normal: 13.5-17.5)&#10;- WBC Count: 7,500/μL (Normal: 4,500-11,000)&#10;- Platelet Count: 250,000/μL (Normal: 150,000-400,000)"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                ✅ Submit Results
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests Table */}
      {!showForm && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Test Type</th>
                <th>Requested By</th>
                <th>Requested Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="empty-state">
                      <div className="empty-icon">📝</div>
                      <h3>No tests ready for results</h3>
                      <p>Process pending requests first</p>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.request_id}>
                    <td>{req.request_id}</td>
                    <td><strong>{req.patient_name || 'Unknown'}</strong></td>
                    <td>{req.test_type}</td>
                    <td>Dr. {req.doctor_first_name} {req.doctor_last_name}</td>
                    <td>{req.requested_at ? new Date(req.requested_at).toLocaleDateString() : '-'}</td>
                    <td>
                      <span className="status-badge" style={{ background: '#fef3c7', color: '#92400e' }}>
                        In Progress
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-primary" 
                        onClick={() => handleSelectRequest(req)}
                      >
                        📝 Enter Results
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TestResults;
