import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function PendingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/lab-requests?status=Pending');
      setRequests(res.data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const startProcessing = async (requestId) => {
    try {
      await api.patch(`/lab-requests/${requestId}/status`, { status: 'In Progress' });
      alert('Test processing started!');
      loadRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="module-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Pending Lab Requests</h2>
        <button className="btn btn-primary" onClick={loadRequests}>
          🔄 Refresh
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Test Type</th>
              <th>Priority</th>
              <th>Requested Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <div className="empty-icon">✅</div>
                    <h3>No pending requests</h3>
                    <p>All lab requests have been processed</p>
                  </div>
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.request_id}>
                  <td>{req.request_id}</td>
                  <td><strong>{req.patient_name || 'Unknown'}</strong></td>
                  <td>{req.test_type}</td>
                  <td>
                    <span className={`status-badge ${req.priority?.toLowerCase()}`}>
                      {req.priority}
                    </span>
                  </td>
                  <td>{req.requested_date ? new Date(req.requested_date).toLocaleDateString() : '-'}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => startProcessing(req.request_id)}
                    >
                      🔬 Start Processing
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PendingRequests;
