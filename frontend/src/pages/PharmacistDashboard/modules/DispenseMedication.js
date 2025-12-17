import { useState, useEffect, useContext } from 'react';
import api from '../../../utils/api';
import { AuthContext } from '../../../context/AuthContext';
import './ModuleStyles.css';

function DispenseMedication() {
  const { user } = useContext(AuthContext);
  const [prescriptions, setPrescriptions] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    drug_id: '',
    patient_id: '',
    quantity: '',
    remarks: '',
    dispensed_by: user?.staff_id || ''
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

  const handleSelectPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowForm(true);
    setFormData({
      drug_id: prescription.drug_id || '',
      patient_id: prescription.patient_id || '',
      quantity: prescription.duration || '',
      remarks: '',
      dispensed_by: user?.staff_id || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create dispensation record (you may need to create this endpoint)
      await api.post('/pharmacy/dispense', formData);
      
      // Update prescription status
      if (selectedPrescription) {
        await api.patch(`/prescriptions/${selectedPrescription.prescription_id}/status`, {
          status: 'Dispensed'
        });
      }

      alert('Medication dispensed successfully!');
      setShowForm(false);
      setSelectedPrescription(null);
      setFormData({
        drug_id: '',
        patient_id: '',
        quantity: '',
        remarks: '',
        dispensed_by: user?.staff_id || ''
      });
      loadData();
    } catch (error) {
      console.error('Error dispensing medication:', error);
      alert(error.response?.data?.message || 'Failed to dispense medication');
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
        <h2 className="module-title">Dispense Medication</h2>
        <button className="btn btn-primary" onClick={loadData}>
          🔄 Refresh
        </button>
      </div>

      {/* Dispense Form */}
      {showForm && selectedPrescription && (
        <div className="form-card">
          <div className="form-header">
            <h3>Dispense Prescription #{selectedPrescription.prescription_id}</h3>
            <button className="btn-close" onClick={() => setShowForm(false)}>✖</button>
          </div>
          
          <div className="info-grid">
            <div className="info-item">
              <label>Patient:</label>
              <span><strong>{selectedPrescription.patient_name}</strong></span>
            </div>
            <div className="info-item">
              <label>Drug:</label>
              <span>{selectedPrescription.drug_name}</span>
            </div>
            <div className="info-item">
              <label>Dosage:</label>
              <span>{selectedPrescription.dosage}</span>
            </div>
            <div className="info-item">
              <label>Frequency:</label>
              <span>{selectedPrescription.frequency}</span>
            </div>
            <div className="info-item">
              <label>Duration:</label>
              <span>{selectedPrescription.duration} days</span>
            </div>
            <div className="info-item">
              <label>Prescribed By:</label>
              <span>Dr. {selectedPrescription.doctor_first_name} {selectedPrescription.doctor_last_name}</span>
            </div>
          </div>

          {selectedPrescription.instructions && (
            <div className="notes-section">
              <label>Instructions:</label>
              <p>{selectedPrescription.instructions}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Quantity to Dispense *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Any additional notes..."
                  rows="3"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                💊 Dispense Medication
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Prescriptions Table */}
      {!showForm && (
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
                <th>Date Issued</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="empty-state">
                      <div className="empty-icon">💊</div>
                      <h3>No prescriptions to dispense</h3>
                      <p>Prescriptions will appear here</p>
                    </div>
                  </td>
                </tr>
              ) : (
                prescriptions.map((prescription) => (
                  <tr key={prescription.prescription_id}>
                    <td>{prescription.prescription_id}</td>
                    <td><strong>{prescription.patient_name || 'Unknown'}</strong></td>
                    <td>{prescription.drug_name}</td>
                    <td>{prescription.dosage}</td>
                    <td>{prescription.frequency}</td>
                    <td>{prescription.duration} days</td>
                    <td>{prescription.date_issued ? new Date(prescription.date_issued).toLocaleDateString() : '-'}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-primary" 
                        onClick={() => handleSelectPrescription(prescription)}
                      >
                        💊 Dispense
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

export default DispenseMedication;
