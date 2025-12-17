import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    drug_id: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prescriptionsRes, drugsRes] = await Promise.all([
        api.get('/prescriptions').catch(() => ({ data: [] })),
        api.get('/pharmacy/drugs').catch(() => ({ data: [] }))
      ]);
      setPrescriptions(prescriptionsRes.data || []);
      setDrugs(drugsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/prescriptions', formData);
      alert('Prescription created successfully!');
      setShowForm(false);
      setFormData({
        patient_id: '',
        drug_id: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating prescription:', error);
      alert(error.response?.data?.message || 'Failed to create prescription');
    }
  };

  if (loading) {
    return (
      <div className="module-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Prescriptions</h2>
        <div className="module-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✖ Cancel' : '➕ New Prescription'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="form-card">
          <h3>Create Prescription</h3>
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
                <label>Drug *</label>
                <select
                  value={formData.drug_id}
                  onChange={(e) => setFormData({ ...formData, drug_id: e.target.value })}
                  required
                >
                  <option value="">Select Drug</option>
                  {drugs.map(drug => (
                    <option key={drug.drug_id} value={drug.drug_id}>
                      {drug.drug_name} {drug.brand ? `(${drug.brand})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Dosage *</label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  required
                  placeholder="e.g., 500mg"
                />
              </div>
              <div className="form-group">
                <label>Frequency *</label>
                <input
                  type="text"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  required
                  placeholder="e.g., Twice daily"
                />
              </div>
              <div className="form-group">
                <label>Duration *</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                  placeholder="e.g., 7 days"
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Additional instructions for the patient..."
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Create Prescription</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Prescriptions Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Drug</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <div className="empty-icon">💊</div>
                    <h3>No prescriptions found</h3>
                    <p>Click "New Prescription" to create one</p>
                  </div>
                </td>
              </tr>
            ) : (
              prescriptions.map((prescription) => (
                <tr key={prescription.prescription_id}>
                  <td>{prescription.prescription_id}</td>
                  <td><strong>{prescription.patient_name || 'Unknown'}</strong></td>
                  <td>{prescription.drug_name || '-'}</td>
                  <td>{prescription.dosage}</td>
                  <td>{prescription.frequency}</td>
                  <td>{prescription.duration}</td>
                  <td>
                    <span className={`status-badge ${prescription.status?.toLowerCase()}`}>
                      {prescription.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon" title="View">👁️</button>
                      <button className="btn-icon" title="Print">🖨️</button>
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

export default Prescriptions;
