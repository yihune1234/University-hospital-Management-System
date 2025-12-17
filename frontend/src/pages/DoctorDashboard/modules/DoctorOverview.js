import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function DoctorOverview() {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingConsultations: 0,
    activePrescriptions: 0,
    pendingLabRequests: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Load today's appointments
      const appointmentsRes = await api.get(`/appointments?date=${today}`).catch(() => ({ data: [] }));
      const appointments = appointmentsRes.data || [];
      
      setStats({
        todayAppointments: appointments.length,
        pendingConsultations: appointments.filter(a => a.status === 'Confirmed').length,
        activePrescriptions: 0, // Would need separate endpoint
        pendingLabRequests: 0 // Would need separate endpoint
      });
      
      setRecentAppointments(appointments.slice(0, 5));
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

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="stat-value">{stats.todayAppointments}</div>
          <div className="stat-label">Today's Appointments</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <div className="stat-value">{stats.pendingConsultations}</div>
          <div className="stat-label">Pending Consultations</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <div className="stat-value">{stats.activePrescriptions}</div>
          <div className="stat-label">Active Prescriptions</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
          <div className="stat-value">{stats.pendingLabRequests}</div>
          <div className="stat-label">Pending Lab Requests</div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Today's Appointments</h3>
        {recentAppointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No appointments today</h3>
            <p>You have no scheduled appointments for today</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((apt) => (
                  <tr key={apt.appointment_id}>
                    <td>{new Date(apt.appointment_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td><strong>{apt.patient_name || 'Unknown Patient'}</strong></td>
                    <td>{apt.reason || '-'}</td>
                    <td>
                      <span className={`status-badge ${apt.status.toLowerCase()}`}>
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <button className="btn btn-primary" style={{ padding: '1rem' }}>
            📋 View All Appointments
          </button>
          <button className="btn btn-primary" style={{ padding: '1rem' }}>
            🩺 Start Consultation
          </button>
          <button className="btn btn-primary" style={{ padding: '1rem' }}>
            💊 Write Prescription
          </button>
          <button className="btn btn-primary" style={{ padding: '1rem' }}>
            🔬 Request Lab Test
          </button>
        </div>
      </div>
    </div>
  );
}

export default DoctorOverview;
