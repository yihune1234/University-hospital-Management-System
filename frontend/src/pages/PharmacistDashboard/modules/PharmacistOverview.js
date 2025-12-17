import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function PharmacistOverview() {
  const [stats, setStats] = useState({
    totalDrugs: 0,
    lowStock: 0,
    pendingPrescriptions: 0,
    dispensedToday: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [drugsRes, lowStockRes, prescriptionsRes] = await Promise.all([
        api.get('/pharmacy/drugs').catch(() => ({ data: [] })),
        api.get('/pharmacy/drugs/low-stock').catch(() => ({ data: [] })),
        api.get('/prescriptions').catch(() => ({ data: [] }))
      ]);

      setStats({
        totalDrugs: drugsRes.data?.length || 0,
        lowStock: lowStockRes.data?.length || 0,
        pendingPrescriptions: prescriptionsRes.data?.length || 0,
        dispensedToday: 0
      });

      setRecentActivity(prescriptionsRes.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error loading data:', error);
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
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalDrugs}</div>
            <div className="stat-label">Total Drugs</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.lowStock}</div>
            <div className="stat-label">Low Stock Alerts</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pendingPrescriptions}</div>
            <div className="stat-label">Pending Prescriptions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.dispensedToday}</div>
            <div className="stat-label">Dispensed Today</div>
          </div>
        </div>
      </div>

      <div className="activity-section">
        <h3>Recent Prescriptions</h3>
        <div className="activity-list">
          {recentActivity.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No recent prescriptions</p>
            </div>
          ) : (
            recentActivity.map((item, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">💊</div>
                <div className="activity-content">
                  <div className="activity-title">
                    <strong>{item.patient_name}</strong> - {item.drug_name}
                  </div>
                  <div className="activity-meta">
                    {item.dosage} • {item.frequency} • {item.duration} days
                  </div>
                </div>
                <div className="activity-time">
                  {item.date_issued ? new Date(item.date_issued).toLocaleDateString() : '-'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-grid">
          <button className="action-btn">
            <span className="action-icon">💊</span>
            <span className="action-label">Dispense Medication</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📦</span>
            <span className="action-label">Add to Inventory</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">⚠️</span>
            <span className="action-label">View Alerts</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📜</span>
            <span className="action-label">View History</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PharmacistOverview;
