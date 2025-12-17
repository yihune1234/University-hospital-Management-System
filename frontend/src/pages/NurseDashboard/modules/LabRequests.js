import { useState, useEffect, useContext } from 'react';
import api from '../../../utils/api';
import { AuthContext } from '../../../context/AuthContext';
import './ModuleStyles.css';

function LabRequests() {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: user?.staff_id || '',
    clinic_id: '',
    test_type: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requestsRes, patientsRes] = await Promise.all([
        api.get('/lab-requests').catch(() => ({ data: [] })),
        api.get('/patients').catch(() => ({ data: [] }))
      ]);
      setRequests(requestsRes.data || []);
      setPatients(patientsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
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
        doctor_id: user?.staff_id || '',
        clinic_id: '',
        test_type: '',
        notes: ''
      });
      loadData();
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
          <p>Loading...</p>
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
                <label>Patient *</label>
                <select
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient.patient_id} value={patient.patient_id}>
                      {patient.first_name} {patient.last_name} (ID: {patient.patient_id})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Test Type *</label>
                <select
                  value={formData.test_type}
                  onChange={(e) => setFormData({ ...formData, test_type: e.target.value })}
                  required
                >
                  <option value="">Select Test Type</option>
                  <option value="Blood Test">Blood Test</option>
                  <option value="Urine Test">Urine Test</option>
                  <option value="X-Ray">X-Ray</option>
                  <option value="CT Scan">CT Scan</option>
                  <option value="MRI">MRI</option>
                  <option value="Ultrasound">Ultrasound</option>
                  <option value="ECG">ECG</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes or instructions..."
                  rows="3"
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

      {/* Requests Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Test Type</th>
              <th>Status</th>
              <th>Requested Date</th>
              <th>Requested By</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <div className="empty-icon">🔬</div>
                    <h3>No lab requests found</h3>
                    <p>Click "New Lab Request" to create one</p>
                  </div>
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.request_id}>
                  <td>{request.request_id}</td>
                  <td><strong>{request.patient_name || 'Unknown'}</strong></td>
                  <td>{request.test_type}</td>
                  <td>
                    <span className={`status-badge ${request.status?.toLowerCase()}`}>
                      {request.status || 'Pending'}
                    </span>
                  </td>
                  <td>{request.requested_at ? new Date(request.requested_at).toLocaleDateString() : '-'}</td>
                  <td>Dr. {request.doctor_first_name} {request.doctor_last_name}</td>
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
