import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function ReceptionistOverview() {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    waitingPatients: 0,
    registeredToday: 0,
    completedToday: 0
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
      
      const appointmentsRes = await api.get(`/appointments?date=${today}`).catch(() => ({ data: [] }));
      const appointments = appointmentsRes.data || [];
      
      setStats({
        todayAppointments: appointments.length,
        waitingPatients: appointments.filter(a => a.status === 'Confirmed').length,
        registeredToday: 0,
        completedToday: appointments.filter(a => a.status === 'Completed').length
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
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}>
          <div className="stat-value">{stats.todayAppointments}</div>
          <div className="stat-label">Today's Appointments</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
          <div className="stat-value">{stats.waitingPatients}</div>
          <div className="stat-label">Waiting Patients</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
          <div className="stat-value">{stats.registeredToday}</div>
          <div className="stat-label">Registered Today</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
          <div className="stat-value">{stats.completedToday}</div>
          <div className="stat-label">Completed Today</div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Today's Appointments</h3>
        {recentAppointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No appointments today</h3>
            <p>No scheduled appointments for today</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Clinic</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((apt) => (
                  <tr key={apt.appointment_id}>
                    <td>{new Date(apt.appointment_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td><strong>{apt.patient_name || 'Unknown Patient'}</strong></td>
                    <td>{apt.clinic_name || '-'}</td>
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
            ➕ Register New Patient
          </button>
          <button className="btn btn-primary" style={{ padding: '1rem' }}>
            📅 Schedule Appointment
          </button>
          <button className="btn btn-primary" style={{ padding: '1rem' }}>
            ✅ Check-In Patient
          </button>
          <button className="btn btn-primary" style={{ padding: '1rem' }}>
            ⏱️ View Queue
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReceptionistOverview;
