import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function NurseOverview() {
  const [stats, setStats] = useState({
    patientsInQueue: 0,
    vitalsRecorded: 0,
    labRequests: 0,
    medications: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, labRequestsRes, prescriptionsRes] = await Promise.all([
        api.get('/appointments').catch(() => ({ data: [] })),
        api.get('/lab-requests').catch(() => ({ data: [] })),
        api.get('/prescriptions').catch(() => ({ data: [] }))
      ]);

      setStats({
        patientsInQueue: appointmentsRes.data?.length || 0,
        vitalsRecorded: 0,
        labRequests: labRequestsRes.data?.length || 0,
        medications: prescriptionsRes.data?.length || 0
      });

      // Combine recent activity
      const activities = [
        ...(appointmentsRes.data?.slice(0, 3).map(a => ({ ...a, type: 'appointment' })) || []),
        ...(labRequestsRes.data?.slice(0, 2).map(l => ({ ...l, type: 'lab' })) || [])
      ];
      setRecentActivity(activities.slice(0, 5));
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
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.patientsInQueue}</div>
            <div className="stat-label">Patients in Queue</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🩺</div>
          <div className="stat-content">
            <div className="stat-value">{stats.vitalsRecorded}</div>
            <div className="stat-label">Vitals Recorded Today</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔬</div>
          <div className="stat-content">
            <div className="stat-value">{stats.labRequests}</div>
            <div className="stat-label">Lab Requests</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.medications}</div>
            <div className="stat-label">Medications</div>
          </div>
        </div>
      </div>

      <div className="activity-section">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {recentActivity.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No recent activity</p>
            </div>
          ) : (
            recentActivity.map((item, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {item.type === 'appointment' ? '👤' : '🔬'}
                </div>
                <div className="activity-content">
                  <div className="activity-title">
                    <strong>{item.patient_name || 'Patient'}</strong>
                    {item.type === 'appointment' ? ' - Appointment' : ' - Lab Request'}
                  </div>
                  <div className="activity-meta">
                    {item.type === 'appointment' 
                      ? `${item.appointment_type || 'General'} • ${item.status || 'Scheduled'}`
                      : `${item.test_type || 'Test'} • ${item.status || 'Pending'}`
                    }
                  </div>
                </div>
                <div className="activity-time">
                  {item.appointment_date || item.requested_at 
                    ? new Date(item.appointment_date || item.requested_at).toLocaleDateString() 
                    : '-'}
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
            <span className="action-icon">🩺</span>
            <span className="action-label">Record Vitals</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📋</span>
            <span className="action-label">View Queue</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">🔬</span>
            <span className="action-label">Lab Requests</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">💊</span>
            <span className="action-label">Medications</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default NurseOverview;
