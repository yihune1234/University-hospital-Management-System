import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    patient_id: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const res = await api.get(`/medical-records?${params}`);
      setRecords(res.data || []);
    } catch (error) {
      console.error('Error loading records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (record) => {
    try {
      const res = await api.get(`/medical-records/${record.record_id}/details`);
      setSelectedRecord(res.data);
    } catch (error) {
      console.error('Error loading record details:', error);
      alert('Failed to load record details');
    }
  };

  const handleFilter = () => {
    loadRecords();
  };

  const handleClearFilters = () => {
    setFilters({
      patient_id: '',
      start_date: '',
      end_date: ''
    });
    setTimeout(() => loadRecords(), 100);
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
        <h2 className="module-title">Medical Records</h2>
        <button className="btn btn-primary" onClick={loadRecords}>
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

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Medical Record - #{selectedRecord.record_id}</h3>
              <button className="btn-close" onClick={() => setSelectedRecord(null)}>✖</button>
            </div>
            
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>Patient:</label>
                  <span><strong>{selectedRecord.patient_name}</strong></span>
                </div>
                <div className="info-item">
                  <label>Doctor:</label>
                  <span>Dr. {selectedRecord.doctor_first_name} {selectedRecord.doctor_last_name}</span>
                </div>
                <div className="info-item">
                  <label>Visit Date:</label>
                  <span>{selectedRecord.visit_date ? new Date(selectedRecord.visit_date).toLocaleDateString() : '-'}</span>
                </div>
                <div className="info-item">
                  <label>Diagnosis:</label>
                  <span>{selectedRecord.diagnosis || '-'}</span>
                </div>
              </div>

              {selectedRecord.symptoms && (
                <div className="notes-section">
                  <label>Symptoms:</label>
                  <p>{selectedRecord.symptoms}</p>
                </div>
              )}

              {selectedRecord.treatment && (
                <div className="notes-section">
                  <label>Treatment:</label>
                  <p>{selectedRecord.treatment}</p>
                </div>
              )}

              {selectedRecord.notes && (
                <div className="notes-section">
                  <label>Notes:</label>
                  <p>{selectedRecord.notes}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => window.print()}>
                🖨️ Print
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedRecord(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Visit Date</th>
              <th>Diagnosis</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>No medical records found</h3>
                    <p>Medical records will appear here</p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.record_id}>
                  <td>{record.record_id}</td>
                  <td><strong>{record.patient_name || 'Unknown'}</strong></td>
                  <td>Dr. {record.doctor_first_name} {record.doctor_last_name}</td>
                  <td>{record.visit_date ? new Date(record.visit_date).toLocaleDateString() : '-'}</td>
                  <td>{record.diagnosis || '-'}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-primary" 
                      onClick={() => handleViewDetails(record)}
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

export default MedicalRecords;
