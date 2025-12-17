import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function DispenseHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    patient_id: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      // Load prescriptions as history (in real app, you'd have a dispensations endpoint)
      const params = new URLSearchParams(filters);
      const res = await api.get(`/prescriptions?${params}`);
      setHistory(res.data || []);
    } catch (error) {
      console.error('Error loading history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    loadHistory();
  };

  const handleClearFilters = () => {
    setFilters({
      patient_id: '',
      start_date: '',
      end_date: ''
    });
    setTimeout(() => loadHistory(), 100);
  };

  const handleExport = () => {
    // Simple CSV export
    const csv = [
      ['ID', 'Patient', 'Drug', 'Dosage', 'Frequency', 'Duration', 'Date'].join(','),
      ...history.map(item => [
        item.prescription_id,
        item.patient_name,
        item.drug_name,
        item.dosage,
        item.frequency,
        item.duration,
        item.date_issued ? new Date(item.date_issued).toLocaleDateString() : '-'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dispense-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="module-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Dispense History</h2>
        <div className="module-actions">
          <button className="btn btn-secondary" onClick={handleExport}>
            📥 Export CSV
          </button>
          <button className="btn btn-primary" onClick={loadHistory}>
            🔄 Refresh
          </button>
        </div>
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

      {/* Statistics */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{history.length}</div>
            <div className="stat-label">Total Records</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">
              {new Set(history.map(h => h.patient_id)).size}
            </div>
            <div className="stat-label">Unique Patients</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💊</div>
          <div className="stat-content">
            <div className="stat-value">
              {new Set(history.map(h => h.drug_id)).size}
            </div>
            <div className="stat-label">Different Drugs</div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Patient</th>
              <th>Drug</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Duration</th>
              <th>Prescribed By</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <div className="empty-icon">📜</div>
                    <h3>No history found</h3>
                    <p>Dispensed medications will appear here</p>
                  </div>
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr key={item.prescription_id}>
                  <td>{item.prescription_id}</td>
                  <td>{item.date_issued ? new Date(item.date_issued).toLocaleDateString() : '-'}</td>
                  <td><strong>{item.patient_name || 'Unknown'}</strong></td>
                  <td>{item.drug_name}</td>
                  <td>{item.dosage}</td>
                  <td>{item.frequency}</td>
                  <td>{item.duration} days</td>
                  <td>Dr. {item.doctor_first_name} {item.doctor_last_name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DispenseHistory;
