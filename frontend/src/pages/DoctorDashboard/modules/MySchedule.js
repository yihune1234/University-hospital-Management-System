import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function MySchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadSchedules();
  }, [filterDate]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      // This would need to be filtered by current doctor's staff_id
      const res = await api.get(`/admin/staff-schedules?date=${filterDate}`);
      setSchedules(res.data || []);
    } catch (error) {
      console.error('Error loading schedules:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="module-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">My Schedule</h2>
      </div>

      {/* Date Filter */}
      <div className="filters-section">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <button className="btn btn-primary" onClick={loadSchedules}>
          🔄 Refresh
        </button>
      </div>

      {/* Schedule Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Clinic</th>
              <th>Room</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <div className="empty-icon">🕐</div>
                    <h3>No schedule found</h3>
                    <p>No schedule assigned for the selected date</p>
                  </div>
                </td>
              </tr>
            ) : (
              schedules.map((schedule) => (
                <tr key={schedule.schedule_id}>
                  <td>{new Date(schedule.shift_date).toLocaleDateString()}</td>
                  <td>{schedule.clinic_name || '-'}</td>
                  <td>{schedule.room_name || '-'}</td>
                  <td>{schedule.start_time}</td>
                  <td>{schedule.end_time}</td>
                  <td>
                    <span className={`status-badge ${schedule.status?.toLowerCase()}`}>
                      {schedule.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Weekly View */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Weekly Overview</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '1rem' 
        }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} style={{
              background: '#f9fafb',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{day}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                No schedule
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MySchedule;
