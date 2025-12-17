import { useState } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function CheckIn() {
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchAppointments = async () => {
    if (!searchTerm) {
      alert('Please enter patient ID or name');
      return;
    }

    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const res = await api.get(`/appointments?date=${today}&search=${searchTerm}`);
      setAppointments(res.data || []);
    } catch (error) {
      console.error('Error searching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const checkInPatient = async (appointmentId) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status: 'Confirmed' });
      alert('Patient checked in successfully!');
      searchAppointments();
    } catch (error) {
      console.error('Error checking in patient:', error);
      alert('Failed to check in patient');
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Patient Check-In</h2>
      </div>

      {/* Search */}
      <div className="form-card">
        <h3>Find Patient Appointment</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Enter patient ID or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchAppointments()}
            style={{ flex: 1, padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
          <button className="btn btn-primary" onClick={searchAppointments} disabled={loading}>
            {loading ? '🔄 Searching...' : '🔍 Search'}
          </button>
        </div>
      </div>

      {/* Appointments */}
      {appointments.length > 0 && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Patient</th>
                <th>Clinic</th>
                <th>Doctor</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.appointment_id}>
                  <td>{new Date(apt.appointment_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td><strong>{apt.patient_name || 'Unknown'}</strong></td>
                  <td>{apt.clinic_name || '-'}</td>
                  <td>{apt.staff_name || 'Not assigned'}</td>
                  <td>
                    <span className={`status-badge ${apt.status.toLowerCase()}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td>
                    {apt.status === 'Scheduled' ? (
                      <button
                        className="btn btn-success"
                        onClick={() => checkInPatient(apt.appointment_id)}
                      >
                        ✅ Check In
                      </button>
                    ) : (
                      <span style={{ color: '#10b981' }}>✓ Checked In</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && appointments.length === 0 && searchTerm && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No appointments found</h3>
          <p>No appointments found for today with the search term</p>
        </div>
      )}

      {!searchTerm && (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>Patient Check-In</h3>
          <p>Search for a patient to check them in for their appointment</p>
        </div>
      )}
    </div>
  );
}

export default CheckIn;
