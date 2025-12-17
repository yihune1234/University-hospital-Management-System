import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function LabRequests() {
  const [labRequests, setLabRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    test_type: '',
    priority: 'Normal',
    notes: ''
  });

  const testTypes = [
    'Blood Test', 'Urine Test', 'X-Ray', 'CT Scan', 'MRI', 
    'Ultrasound', 'ECG', 'Blood Sugar', 'Cholesterol', 'Other'
  ];

  useEffect(() => {
    loadLabRequests();
  }, []);

  const loadLabRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/lab-requests');
      setLabRequests(res.data || []);
    } catch (error) {
      console.error('Error loading lab requests:', error);
      setLabRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/lab-requests', formData);
      alert('Lab request created successfully!');
      setShowForm(false);
      setFormData({
        patient_id: '',
        test_type: '',
        priority: 'Normal',
        notes: ''
      });
      loadLabRequests();
    } catch (error) {
      console.error('Error creating lab request:', error);
      alert(error.response?.data?.message || 'Failed to create lab request');
    }
  };

  if (loading) {
    return (
      <div className="module-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading lab requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Lab Requests</h2>
        <div className="module-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✖ Cancel' : '➕ New Lab Request'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="form-card">
          <h3>Create Lab Request</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Patient ID *</label>
                <input
                  type="number"
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Test Type *</label>
                <select
                  value={formData.test_type}
                  onChange={(e) => setFormData({ ...formData, test_type: e.target.value })}
                  required
                >
                  <option value="">Select Test Type</option>
                  {testTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Priority *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  required
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes or instructions..."
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Create Request</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lab Requests Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Test Type</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Requested Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {labRequests.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <div className="empty-icon">🔬</div>
                    <h3>No lab requests found</h3>
                    <p>Click "New Lab Request" to create one</p>
                  </div>
                </td>
              </tr>
            ) : (
              labRequests.map((request) => (
                <tr key={request.request_id}>
                  <td>{request.request_id}</td>
                  <td><strong>{request.patient_name || 'Unknown'}</strong></td>
                  <td>{request.test_type}</td>
                  <td>
                    <span className={`status-badge ${request.priority?.toLowerCase()}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${request.status?.toLowerCase()}`}>
                      {request.status || 'Pending'}
                    </span>
                  </td>
                  <td>{request.requested_date ? new Date(request.requested_date).toLocaleDateString() : '-'}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon" title="View">👁️</button>
                      <button className="btn-icon" title="Results">📄</button>
                    </div>
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

export default LabRequests;
