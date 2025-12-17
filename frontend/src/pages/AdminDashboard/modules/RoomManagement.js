import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clinic_id: '',
    room_name: '',
    room_type: 'Consultation',
    capacity: 1,
    status: 'Available',
  });
  const [editingId, setEditingId] = useState(null);
  const [filterClinic, setFilterClinic] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statistics, setStatistics] = useState({
    total_rooms: 0,
    available_rooms: 0,
    occupied_rooms: 0,
    maintenance_rooms: 0
  });

  const roomTypes = ['Consultation', 'Emergency', 'Vitals', 'Lab', 'Other'];
  const roomStatuses = ['Available', 'Occupied', 'Maintenance', 'Closed'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load rooms, clinics, and statistics
      const [roomsRes, clinicsRes, statsRes, campusesRes] = await Promise.all([
        api.get('/admin/rooms').catch(() => ({ data: [] })),
        api.get('/admin/campuses').catch(() => ({ data: [] })),
        api.get('/admin/rooms/statistics').catch(() => ({ data: {} })),
        api.get('/admin/campuses').catch(() => ({ data: [] })),
      ]);

      setRooms(roomsRes.data || []);
      setStatistics(statsRes.data || {});
      
      // Flatten clinics from all campuses
      const allClinics = [];
      for (const campus of campusesRes.data || []) {
        try {
          const clinicsRes = await api.get(`/admin/campuses/${campus.campus_id}/clinics`);
          allClinics.push(...(clinicsRes.data || []).map(c => ({ 
            ...c, 
            campus_name: campus.campus_name 
          })));
        } catch (err) {
          console.error(`Error loading clinics for campus ${campus.campus_id}:`, err);
        }
      }
      setClinics(allClinics);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      
      // Validate
      if (!submitData.clinic_id || !submitData.room_name || !submitData.room_type) {
        alert('Please fill in all required fields');
        return;
      }

      if (editingId) {
        await api.put(`/admin/rooms/${editingId}`, submitData);
        alert('Room updated successfully!');
      } else {
        await api.post('/admin/rooms', submitData);
        alert('Room created successfully!');
      }
      
      setShowForm(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving room:', error);
      alert(error.response?.data?.message || 'Failed to save room');
    }
  };

  const handleEdit = (room) => {
    setFormData({
      clinic_id: room.clinic_id,
      room_name: room.room_name,
      room_type: room.room_type,
      capacity: room.capacity,
      status: room.status,
    });
    setEditingId(room.room_id);
    setShowForm(true);
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      await api.delete(`/admin/rooms/${roomId}`);
      alert('Room deleted successfully!');
      loadData();
    } catch (error) {
      console.error('Error deleting room:', error);
      alert(error.response?.data?.message || 'Failed to delete room');
    }
  };

  const updateStatus = async (roomId, newStatus) => {
    try {
      await api.patch(`/admin/rooms/${roomId}/status`, { status: newStatus });
      alert('Room status updated!');
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update room status');
    }
  };

  const resetForm = () => {
    setFormData({
      clinic_id: '',
      room_name: '',
      room_type: 'Consultation',
      capacity: 1,
      status: 'Available',
    });
    setEditingId(null);
  };

  const filteredRooms = rooms.filter(r => {
    const matchesClinic = !filterClinic || r.clinic_id === parseInt(filterClinic);
    const matchesType = !filterType || r.room_type === filterType;
    const matchesStatus = !filterStatus || r.status === filterStatus;
    const matchesSearch = !searchTerm || 
      r.room_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.clinic_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClinic && matchesType && matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="module-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Room Management</h2>
        <div className="module-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✖ Cancel' : '➕ Add Room'}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '0.5rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e40af' }}>
            {statistics.total_rooms || rooms.length}
          </div>
          <div style={{ color: '#3b82f6' }}>Total Rooms</div>
        </div>
        <div style={{ background: '#d1fae5', padding: '1rem', borderRadius: '0.5rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#065f46' }}>
            {statistics.available_rooms || rooms.filter(r => r.status === 'Available').length}
          </div>
          <div style={{ color: '#10b981' }}>Available</div>
        </div>
        <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '0.5rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#92400e' }}>
            {statistics.occupied_rooms || rooms.filter(r => r.status === 'Occupied').length}
          </div>
          <div style={{ color: '#f59e0b' }}>Occupied</div>
        </div>
        <div style={{ background: '#fee2e2', padding: '1rem', borderRadius: '0.5rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#991b1b' }}>
            {statistics.maintenance_rooms || rooms.filter(r => r.status === 'Maintenance').length}
          </div>
          <div style={{ color: '#ef4444' }}>Maintenance</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Search by room name or clinic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
        />
        <select
          value={filterClinic}
          onChange={(e) => setFilterClinic(e.target.value)}
          style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
        >
          <option value="">All Clinics</option>
          {clinics.map(clinic => (
            <option key={clinic.clinic_id} value={clinic.clinic_id}>
              {clinic.clinic_name} ({clinic.campus_name})
            </option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
        >
          <option value="">All Types</option>
          {roomTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
        >
          <option value="">All Status</option>
          {roomStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="form-card">
          <h3>{editingId ? 'Edit Room' : 'Add New Room'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Clinic *</label>
                <select
                  value={formData.clinic_id}
                  onChange={(e) => setFormData({ ...formData, clinic_id: e.target.value })}
                  required
                >
                  <option value="">Select Clinic</option>
                  {clinics.map(clinic => (
                    <option key={clinic.clinic_id} value={clinic.clinic_id}>
                      {clinic.clinic_name} ({clinic.campus_name})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Room Name *</label>
                <input
                  type="text"
                  value={formData.room_name}
                  onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                  required
                  placeholder="e.g., Room 101, Consultation A"
                />
              </div>
              <div className="form-group">
                <label>Room Type *</label>
                <select
                  value={formData.room_type}
                  onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                  required
                >
                  {roomTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {roomStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Room' : 'Create Room'}
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

      {/* Rooms Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Room Name</th>
              <th>Clinic</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <div className="empty-icon">🚪</div>
                    <h3>No rooms found</h3>
                    <p>Click "Add Room" to create a new room</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRooms.map((room) => (
                <tr key={room.room_id}>
                  <td>{room.room_id}</td>
                  <td><strong>{room.room_name}</strong></td>
                  <td>{room.clinic_name || 'Unknown Clinic'}</td>
                  <td>
                    <span className="role-badge" style={{
                      background: room.room_type === 'Emergency' ? '#fee2e2' : 
                                 room.room_type === 'Consultation' ? '#dbeafe' :
                                 room.room_type === 'Lab' ? '#fef3c7' : '#f3f4f6',
                      color: room.room_type === 'Emergency' ? '#991b1b' : 
                             room.room_type === 'Consultation' ? '#1e40af' :
                             room.room_type === 'Lab' ? '#92400e' : '#374151'
                    }}>
                      {room.room_type}
                    </span>
                  </td>
                  <td>{room.capacity}</td>
                  <td>
                    <select
                      value={room.status}
                      onChange={(e) => updateStatus(room.room_id, e.target.value)}
                      className={`status-badge ${room.status.toLowerCase()}`}
                      style={{
                        border: 'none',
                        background: room.status === 'Available' ? '#d1fae5' :
                                   room.status === 'Occupied' ? '#fef3c7' :
                                   room.status === 'Maintenance' ? '#fee2e2' : '#f3f4f6',
                        color: room.status === 'Available' ? '#065f46' :
                               room.status === 'Occupied' ? '#92400e' :
                               room.status === 'Maintenance' ? '#991b1b' : '#374151',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        cursor: 'pointer'
                      }}
                    >
                      {roomStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(room)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(room.room_id)}
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
    </div>
  );
}

export default RoomManagement;
