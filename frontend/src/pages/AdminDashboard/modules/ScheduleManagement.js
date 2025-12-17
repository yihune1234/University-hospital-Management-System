import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';
import './ScheduleStyles.css';

function ScheduleManagement() {
  const [schedules, setSchedules] = useState([]);
  const [staff, setStaff] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    staff_id: '',
    clinic_id: '',
    room_id: '',
    shift_date: new Date().toISOString().split('T')[0],
    start_time: '08:00',
    end_time: '17:00',
    status: 'Active',
  });
  const [bulkData, setBulkData] = useState({
    staff_id: '',
    clinic_id: '',
    room_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    start_time: '08:00',
    end_time: '17:00',
    days_of_week: [1, 2, 3, 4, 5], // Monday to Friday
  });
  const [editingId, setEditingId] = useState(null);
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadSchedulesByDate(selectedDate);
    }
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, staffRes, campusesRes] = await Promise.all([
        api.get('/admin/staff-schedules').catch(() => ({ data: [] })),
        api.get('/admin/staff').catch(() => ({ data: [] })),
        api.get('/admin/campuses').catch(() => ({ data: [] })),
      ]);

      setSchedules(schedulesRes.data || []);
      setStaff(staffRes.data || []);

      // Load all clinics and rooms
      const allClinics = [];
      const allRooms = [];
      for (const campus of campusesRes.data || []) {
        try {
          const clinicsRes = await api.get(`/admin/campuses/${campus.campus_id}/clinics`);
          const campusClinics = (clinicsRes.data || []).map(c => ({ 
            ...c, 
            campus_name: campus.campus_name 
          }));
          allClinics.push(...campusClinics);

          // Load rooms for each clinic
          for (const clinic of campusClinics) {
            try {
              const roomsRes = await api.get(`/admin/clinics/${clinic.clinic_id}/rooms`);
              allRooms.push(...(roomsRes.data || []).map(r => ({ 
                ...r, 
                clinic_name: clinic.clinic_name 
              })));
            } catch (err) {
              console.error(`Error loading rooms for clinic ${clinic.clinic_id}:`, err);
            }
          }
        } catch (err) {
          console.error(`Error loading clinics for campus ${campus.campus_id}:`, err);
        }
      }
      setClinics(allClinics);
      setRooms(allRooms);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedulesByDate = async (date) => {
    try {
      const response = await api.get(`/admin/staff-schedules?date=${date}`);
      setSchedules(response.data || []);
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  const checkConflicts = async (scheduleData) => {
    try {
      const response = await api.post('/admin/staff-schedules/check-conflicts', scheduleData);
      setConflicts(response.data.conflicts || []);
      return response.data.conflicts || [];
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for conflicts
    const foundConflicts = await checkConflicts(formData);
    if (foundConflicts.length > 0) {
      const proceed = window.confirm(
        `Warning: ${foundConflicts.length} scheduling conflict(s) detected!\n\n` +
        foundConflicts.map(c => c.message).join('\n') +
        '\n\nDo you want to proceed anyway?'
      );
      if (!proceed) return;
    }

    try {
      if (editingId) {
        await api.put(`/admin/staff-schedules/${editingId}`, formData);
        alert('Schedule updated successfully!');
      } else {
        await api.post('/admin/staff-schedules', formData);
        alert('Schedule created successfully!');
      }
      
      setShowForm(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert(error.response?.data?.message || 'Failed to save schedule');
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/admin/staff-schedules/bulk', bulkData);
      alert(`Successfully created ${response.data.created} schedule(s)!`);
      setShowBulkForm(false);
      setBulkData({
        staff_id: '',
        clinic_id: '',
        room_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        start_time: '08:00',
        end_time: '17:00',
        days_of_week: [1, 2, 3, 4, 5],
      });
      loadData();
    } catch (error) {
      console.error('Error creating bulk schedules:', error);
      alert(error.response?.data?.message || 'Failed to create schedules');
    }
  };

  const handleEdit = (schedule) => {
    setFormData({
      staff_id: schedule.staff_id,
      clinic_id: schedule.clinic_id,
      room_id: schedule.room_id || '',
      shift_date: schedule.shift_date,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      status: schedule.status,
    });
    setEditingId(schedule.schedule_id);
    setShowForm(true);
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      await api.delete(`/admin/staff-schedules/${scheduleId}`);
      alert('Schedule deleted successfully!');
      loadData();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Failed to delete schedule');
    }
  };

  const toggleStatus = async (scheduleId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await api.patch(`/admin/staff-schedules/${scheduleId}/status`, { status: newStatus });
      alert('Schedule status updated!');
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update schedule status');
    }
  };

  const resetForm = () => {
    setFormData({
      staff_id: '',
      clinic_id: '',
      room_id: '',
      shift_date: new Date().toISOString().split('T')[0],
      start_time: '08:00',
      end_time: '17:00',
      status: 'Active',
    });
    setEditingId(null);
    setConflicts([]);
  };

  const getStaffName = (staffId) => {
    const staffMember = staff.find(s => s.staff_id === staffId);
    return staffMember ? `${staffMember.first_name} ${staffMember.last_name}` : 'Unknown';
  };

  const getClinicName = (clinicId) => {
    const clinic = clinics.find(c => c.clinic_id === clinicId);
    return clinic ? clinic.clinic_name : 'Unknown';
  };

  const getRoomName = (roomId) => {
    const room = rooms.find(r => r.room_id === roomId);
    return room ? room.room_name : '-';
  };

  // Group schedules by date for calendar view
  const schedulesByDate = schedules.reduce((acc, schedule) => {
    const date = schedule.shift_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(schedule);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="module-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Schedule Management</h2>
        <div className="module-actions">
          <button 
            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('list')}
          >
            📋 List View
          </button>
          <button 
            className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setViewMode('calendar')}
          >
            📅 Calendar View
          </button>
          <button className="btn btn-outline" onClick={() => setShowBulkForm(!showBulkForm)}>
            📥 Bulk Create
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✖ Cancel' : '➕ Add Schedule'}
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ marginRight: '0.5rem', fontWeight: '500' }}>Filter by Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
        />
      </div>

      {/* Add Schedule Form */}
      {showForm && (
        <div className="form-card">
          <h3>{editingId ? 'Edit Schedule' : 'Add New Schedule'}</h3>
          {conflicts.length > 0 && (
            <div className="alert alert-warning">
              <strong>⚠️ Conflicts Detected:</strong>
              <ul>
                {conflicts.map((conflict, idx) => (
                  <li key={idx}>{conflict.message}</li>
                ))}
              </ul>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Staff Member *</label>
                <select
                  value={formData.staff_id}
                  onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                  required
                >
                  <option value="">Select Staff</option>
                  {staff.filter(s => s.is_active).map(s => (
                    <option key={s.staff_id} value={s.staff_id}>
                      {s.first_name} {s.last_name} - {s.role_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Clinic *</label>
                <select
                  value={formData.clinic_id}
                  onChange={(e) => setFormData({ ...formData, clinic_id: e.target.value })}
                  required
                >
                  <option value="">Select Clinic</option>
                  {clinics.map(c => (
                    <option key={c.clinic_id} value={c.clinic_id}>
                      {c.clinic_name} ({c.campus_name})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Room</label>
                <select
                  value={formData.room_id}
                  onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                >
                  <option value="">No Specific Room</option>
                  {rooms.filter(r => r.clinic_id === parseInt(formData.clinic_id)).map(r => (
                    <option key={r.room_id} value={r.room_id}>
                      {r.room_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={formData.shift_date}
                  onChange={(e) => setFormData({ ...formData, shift_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Start Time *</label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Time *</label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Schedule' : 'Create Schedule'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => {
                setShowForm(false);
                resetForm();
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Create Form */}
      {showBulkForm && (
        <div className="form-card">
          <h3>Bulk Create Schedules</h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Create multiple schedules for a staff member across a date range
          </p>
          <form onSubmit={handleBulkSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Staff Member *</label>
                <select
                  value={bulkData.staff_id}
                  onChange={(e) => setBulkData({ ...bulkData, staff_id: e.target.value })}
                  required
                >
                  <option value="">Select Staff</option>
                  {staff.filter(s => s.is_active).map(s => (
                    <option key={s.staff_id} value={s.staff_id}>
                      {s.first_name} {s.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Clinic *</label>
                <select
                  value={bulkData.clinic_id}
                  onChange={(e) => setBulkData({ ...bulkData, clinic_id: e.target.value })}
                  required
                >
                  <option value="">Select Clinic</option>
                  {clinics.map(c => (
                    <option key={c.clinic_id} value={c.clinic_id}>
                      {c.clinic_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  value={bulkData.start_date}
                  onChange={(e) => setBulkData({ ...bulkData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  value={bulkData.end_date}
                  onChange={(e) => setBulkData({ ...bulkData, end_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Start Time *</label>
                <input
                  type="time"
                  value={bulkData.start_time}
                  onChange={(e) => setBulkData({ ...bulkData, start_time: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Time *</label>
                <input
                  type="time"
                  value={bulkData.end_time}
                  onChange={(e) => setBulkData({ ...bulkData, end_time: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Days of Week</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { value: 1, label: 'Mon' },
                  { value: 2, label: 'Tue' },
                  { value: 3, label: 'Wed' },
                  { value: 4, label: 'Thu' },
                  { value: 5, label: 'Fri' },
                  { value: 6, label: 'Sat' },
                  { value: 0, label: 'Sun' },
                ].map(day => (
                  <label key={day.value} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <input
                      type="checkbox"
                      checked={bulkData.days_of_week.includes(day.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBulkData({
                            ...bulkData,
                            days_of_week: [...bulkData.days_of_week, day.value]
                          });
                        } else {
                          setBulkData({
                            ...bulkData,
                            days_of_week: bulkData.days_of_week.filter(d => d !== day.value)
                          });
                        }
                      }}
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Create Schedules
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowBulkForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schedule Display */}
      {viewMode === 'list' ? (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Staff</th>
                <th>Clinic</th>
                <th>Room</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="empty-state">
                      <div className="empty-icon">📅</div>
                      <h3>No schedules found</h3>
                      <p>Click "Add Schedule" to create a new schedule</p>
                    </div>
                  </td>
                </tr>
              ) : (
                schedules.map((schedule) => (
                  <tr key={schedule.schedule_id}>
                    <td>{schedule.schedule_id}</td>
                    <td><strong>{getStaffName(schedule.staff_id)}</strong></td>
                    <td>{getClinicName(schedule.clinic_id)}</td>
                    <td>{getRoomName(schedule.room_id)}</td>
                    <td>{new Date(schedule.shift_date).toLocaleDateString()}</td>
                    <td>{schedule.start_time} - {schedule.end_time}</td>
                    <td>
                      <span className={`status-badge ${schedule.status.toLowerCase()}`}>
                        {schedule.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="btn-icon"
                          onClick={() => handleEdit(schedule)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => toggleStatus(schedule.schedule_id, schedule.status)}
                          title="Toggle Status"
                        >
                          {schedule.status === 'Active' ? '🔴' : '🟢'}
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleDelete(schedule.schedule_id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="calendar-view">
          <h3>Calendar View for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
          {schedulesByDate[selectedDate] && schedulesByDate[selectedDate].length > 0 ? (
            <div className="schedule-cards">
              {schedulesByDate[selectedDate].map(schedule => (
                <div key={schedule.schedule_id} className="schedule-card">
                  <div className="schedule-card-header">
                    <strong>{getStaffName(schedule.staff_id)}</strong>
                    <span className={`status-badge ${schedule.status.toLowerCase()}`}>
                      {schedule.status}
                    </span>
                  </div>
                  <div className="schedule-card-body">
                    <div>🏥 {getClinicName(schedule.clinic_id)}</div>
                    <div>🚪 {getRoomName(schedule.room_id)}</div>
                    <div>🕐 {schedule.start_time} - {schedule.end_time}</div>
                  </div>
                  <div className="schedule-card-actions">
                    <button className="btn-icon" onClick={() => handleEdit(schedule)}>✏️</button>
                    <button className="btn-icon" onClick={() => handleDelete(schedule.schedule_id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <p>No schedules for this date</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ScheduleManagement;
