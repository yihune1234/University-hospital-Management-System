import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadAppointments();
  }, [filterDate, filterStatus]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      let url = '/appointments';
      const params = [];
      if (filterDate) params.push(`date=${filterDate}`);
      if (filterStatus) params.push(`status=${filterStatus}`);
      if (params.length) url += `?${params.join('&')}`;

      const res = await api.get(url);
      setAppointments(res.data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appointmentId, newStatus) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status: newStatus });
      alert('Appointment status updated!');
      loadAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update appointment status');
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await api.post(`/appointments/${appointmentId}/cancel`);
      alert('Appointment cancelled!');
      loadAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment');
    }
  };

  if (loading) {
    return (
      <div className="module-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Manage Appointments</h2>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <button className="btn btn-primary" onClick={loadAppointments}>
          🔄 Refresh
        </button>
      </div>

      {/* Appointments Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Time</th>
              <th>Patient</th>
              <th>Clinic</th>
              <th>Doctor</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <h3>No appointments found</h3>
                    <p>No appointments match your filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              appointments.map((apt) => (
                <tr key={apt.appointment_id}>
                  <td>{apt.appointment_id}</td>
                  <td>
                    {new Date(apt.appointment_time).toLocaleDateString()}<br />
                    <small>{new Date(apt.appointment_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</small>
                  </td>
                  <td><strong>{apt.patient_name || 'Unknown'}</strong></td>
                  <td>{apt.clinic_name || '-'}</td>
                  <td>{apt.staff_name || 'Not assigned'}</td>
                  <td>
                    <span className={`status-badge ${apt.status.toLowerCase()}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      {apt.status === 'Scheduled' && (
                        <button
                          className="btn-icon"
                          onClick={() => updateStatus(apt.appointment_id, 'Confirmed')}
                          title="Confirm"
                        >
                          ✅
                        </button>
                      )}
                      <button className="btn-icon" title="View">👁️</button>
                      {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                        <button
                          className="btn-icon"
                          onClick={() => cancelAppointment(apt.appointment_id)}
                          title="Cancel"
                        >
                          ❌
                        </button>
                      )}
                    </div>
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

export default AppointmentManagement;
