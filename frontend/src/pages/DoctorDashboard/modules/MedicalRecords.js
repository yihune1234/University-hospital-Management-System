import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    visit_date: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get('/medical-records');
      setRecords(res.data || []);
    } catch (error) {
      console.error('Error loading medical records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/medical-records', formData);
      alert('Medical record created successfully!');
      setShowForm(false);
      setFormData({
        patient_id: '',
        diagnosis: '',
        treatment: '',
        notes: '',
        visit_date: new Date().toISOString().split('T')[0]
      });
      loadRecords();
    } catch (error) {
      console.error('Error creating medical record:', error);
      alert(error.response?.data?.message || 'Failed to create medical record');
    }
  };

  const filteredRecords = records.filter(r =>
    !searchTerm ||
    r.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="module-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading medical records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Medical Records</h2>
        <div className="module-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✖ Cancel' : '➕ Add Record'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="filters-section">
        <input
          type="text"
          placeholder="🔍 Search by patient name or diagnosis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '300px' }}
        />
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="form-card">
          <h3>Add Medical Record</h3>
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
                <label>Visit Date *</label>
                <input
                  type="date"
                  value={formData.visit_date}
                  onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Diagnosis *</label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  required
                  placeholder="Enter diagnosis..."
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Treatment *</label>
                <textarea
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  required
                  placeholder="Enter treatment plan..."
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Create Record</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Records Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Visit Date</th>
              <th>Diagnosis</th>
              <th>Treatment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>No medical records found</h3>
                    <p>Click "Add Record" to create a new medical record</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.record_id}>
                  <td>{record.record_id}</td>
                  <td><strong>{record.patient_name || 'Unknown'}</strong></td>
                  <td>{new Date(record.visit_date).toLocaleDateString()}</td>
                  <td>{record.diagnosis?.substring(0, 50)}{record.diagnosis?.length > 50 ? '...' : ''}</td>
                  <td>{record.treatment?.substring(0, 50)}{record.treatment?.length > 50 ? '...' : ''}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon" title="View Details">👁️</button>
                      <button className="btn-icon" title="Edit">✏️</button>
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

export default MedicalRecords;
