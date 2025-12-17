import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function CompletedTests() {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    test_type: ''
  });

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ status: 'Completed', ...filters });
      const res = await api.get(`/lab-requests?${params}`);
      setTests(res.data || []);
    } catch (error) {
      console.error('Error loading tests:', error);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (test) => {
    try {
      const res = await api.get(`/lab-requests/${test.request_id}/details`);
      setSelectedTest(res.data);
    } catch (error) {
      console.error('Error loading test details:', error);
      alert('Failed to load test details');
    }
  };

  const handleFilter = () => {
    loadTests();
  };

  const handleClearFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      test_type: ''
    });
    setTimeout(() => loadTests(), 100);
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
        <h2 className="module-title">Completed Tests</h2>
        <button className="btn btn-primary" onClick={loadTests}>
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="filter-card">
        <div className="filter-grid">
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
          <div className="form-group">
            <label>Test Type</label>
            <input
              type="text"
              value={filters.test_type}
              onChange={(e) => setFilters({ ...filters, test_type: e.target.value })}
              placeholder="Search test type..."
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

      {/* Test Details Modal */}
      {selectedTest && (
        <div className="modal-overlay" onClick={() => setSelectedTest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Test Details - Request #{selectedTest.request_id}</h3>
              <button className="btn-close" onClick={() => setSelectedTest(null)}>✖</button>
            </div>
            
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>Patient:</label>
                  <span><strong>{selectedTest.patient_name}</strong></span>
                </div>
                <div className="info-item">
                  <label>Test Type:</label>
                  <span>{selectedTest.test_type}</span>
                </div>
                <div className="info-item">
                  <label>Requested By:</label>
                  <span>Dr. {selectedTest.doctor_first_name} {selectedTest.doctor_last_name}</span>
                </div>
                <div className="info-item">
                  <label>Requested Date:</label>
                  <span>{selectedTest.requested_at ? new Date(selectedTest.requested_at).toLocaleString() : '-'}</span>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span className="status-badge completed">Completed</span>
                </div>
              </div>

              {selectedTest.notes && (
                <div className="notes-section">
                  <label>Doctor's Notes:</label>
                  <p>{selectedTest.notes}</p>
                </div>
              )}

              {selectedTest.results && selectedTest.results.length > 0 && (
                <div className="results-section">
                  <h4>Test Results</h4>
                  {selectedTest.results.map((result, index) => (
                    <div key={result.result_id || index} className="result-card">
                      <div className="result-header">
                        <span>Result #{result.result_id}</span>
                        <span className="result-date">
                          {result.result_date ? new Date(result.result_date).toLocaleString() : '-'}
                        </span>
                      </div>
                      <div className="result-body">
                        <pre>{result.result_data}</pre>
                      </div>
                      {result.performed_by_first_name && (
                        <div className="result-footer">
                          <span>Performed by: {result.performed_by_first_name} {result.performed_by_last_name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => window.print()}>
                🖨️ Print
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedTest(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tests Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Test Type</th>
              <th>Requested By</th>
              <th>Completed Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <div className="empty-icon">✅</div>
                    <h3>No completed tests found</h3>
                    <p>Completed tests will appear here</p>
                  </div>
                </td>
              </tr>
            ) : (
              tests.map((test) => (
                <tr key={test.request_id}>
                  <td>{test.request_id}</td>
                  <td><strong>{test.patient_name || 'Unknown'}</strong></td>
                  <td>{test.test_type}</td>
                  <td>Dr. {test.doctor_first_name} {test.doctor_last_name}</td>
                  <td>{test.requested_at ? new Date(test.requested_at).toLocaleDateString() : '-'}</td>
                  <td>
                    <span className="status-badge completed">
                      Completed
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-primary" 
                      onClick={() => handleViewDetails(test)}
                    >
                      👁️ View Details
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

export default CompletedTests;
