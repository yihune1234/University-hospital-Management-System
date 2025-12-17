import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function LabTechOverview() {
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    urgent: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/lab-requests');
      const requests = res.data || [];
      
      setStats({
        pending: requests.filter(r => r.status === 'Pending').length,
        inProgress: requests.filter(r => r.status === 'In Progress').length,
        completed: requests.filter(r => r.status === 'Completed').length,
        urgent: requests.filter(r => r.priority === 'Urgent' || r.priority === 'Emergency').length
      });
      
      setRecentRequests(requests.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="module-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Dashboard Overview</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending Requests</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
          <div className="stat-value">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed Today</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
          <div className="stat-value">{stats.urgent}</div>
          <div className="stat-label">Urgent Tests</div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Recent Lab Requests</h3>
        {recentRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔬</div>
            <h3>No lab requests</h3>
            <p>No lab requests in the system</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Test Type</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req) => (
                  <tr key={req.request_id}>
                    <td>{req.request_id}</td>
                    <td><strong>{req.patient_name || 'Unknown'}</strong></td>
                    <td>{req.test_type}</td>
                    <td>
                      <span className={`status-badge ${req.priority?.toLowerCase()}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${req.status?.toLowerCase().replace(' ', '')}`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default LabTechOverview;
