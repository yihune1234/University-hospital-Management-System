import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function PrescriptionQueue() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    patient_id: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const res = await api.get(`/prescriptions?${params}`);
      setPrescriptions(res.data || []);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (prescription) => {
    try {
      const res = await api.get(`/prescriptions/${prescription.prescription_id}`);
      setSelectedPrescription(res.data);
    } catch (error) {
      console.error('Error loading prescription details:', error);
      alert('Failed to load prescription details');
    }
  };

  const handleFilter = () => {
    loadPrescriptions();
  };

  const handleClearFilters = () => {
    setFilters({
      patient_id: '',
      start_date: '',
      end_date: ''
    });
    setTimeout(() => loadPrescriptions(), 100);
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
        <h2 className="module-title">Prescription Queue</h2>
        <button className="btn btn-primary" onClick={loadPrescriptions}>
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="filter-card">
        <div className="filter-grid">
          <div className="form-group">
            <label>Patient ID</label>
            <input
              type="number"
              value={filters.patient_id}
              onChange={(e) => setFilters({ ...filters, patient_id: e.target.value })}
              placeholder="Enter patient ID..."
            />
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={handleFilter}>
              🔍 Filter
            </button>
            <button className="btn btn-secondary" onClick={handleClearFilters}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Prescription Details Modal */}
      {selectedPrescription && (
        <div className="modal-overlay" onClick={() => setSelectedPrescription(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Prescription Details - #{selectedPrescription.prescription_id}</h3>
              <button className="btn-close" onClick={() => setSelectedPrescription(null)}>✖</button>
            </div>
            
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>Patient:</label>
                  <span><strong>{selectedPrescription.patient_name}</strong></span>
                </div>
                <div className="info-item">
                  <label>Prescribed By:</label>
                  <span>Dr. {selectedPrescription.doctor_first_name} {selectedPrescription.doctor_last_name}</span>
                </div>
                <div className="info-item">
                  <label>Drug:</label>
                  <span>{selectedPrescription.drug_name} {selectedPrescription.brand ? `(${selectedPrescription.brand})` : ''}</span>
                </div>
                <div className="info-item">
                  <label>Date Issued:</label>
                  <span>{selectedPrescription.date_issued ? new Date(selectedPrescription.date_issued).toLocaleDateString() : '-'}</span>
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
              </div>

              {selectedPrescription.instructions && (
                <div className="notes-section">
                  <label>Instructions:</label>
                  <p>{selectedPrescription.instructions}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => window.print()}>
                🖨️ Print
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedPrescription(null)}>
                Close
              </button>
            </div>
          </div>
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
              <th>Date Issued</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>No prescriptions found</h3>
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
                      onClick={() => handleViewDetails(prescription)}
                    >
                      👁️ View
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

export default PrescriptionQueue;
