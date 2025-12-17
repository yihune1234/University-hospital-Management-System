import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function PatientQueueEnhanced() {
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [queue, setQueue] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Reassignment states
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [reassignForm, setReassignForm] = useState({
    doctorId: '',
    roomId: '',
    reason: ''
  });

  useEffect(() => {
    loadClinics();
  }, []);

  useEffect(() => {
    if (selectedClinic) {
      loadQueue();
      loadDoctors();
      loadRooms();
    }
  }, [selectedClinic]);

  useEffect(() => {
    let interval;
    if (autoRefresh && selectedClinic) {
      interval = setInterval(() => {
        loadQueue();
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, selectedClinic]);

  const loadClinics = async () => {
    try {
      const res = await api.get('/admin/campuses');
      const allClinics = [];
      
      for (const campus of res.data || []) {
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
      if (allClinics.length > 0) {
        setSelectedClinic(allClinics[0].clinic_id);
      }
    } catch (error) {
      console.error('Error loading clinics:', error);
    }
  };

  const loadQueue = async () => {
    if (!selectedClinic) return;

    try {
      setLoading(true);
      const res = await api.get(`/clinics/${selectedClinic}/queue`);
      setQueue(res.data.queue || []);
      setStatistics(res.data.statistics || {});
    } catch (error) {
      console.error('Error loading queue:', error);
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const res = await api.get('/admin/staff');
      const doctorsList = (res.data || []).filter(s => 
        (s.role_name === 'Doctor' || s.role_name === 'Nurse') && s.is_active === 1
      );
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const loadRooms = async () => {
    try {
      const res = await api.get(`/admin/rooms?clinicId=${selectedClinic}`);
      setRooms((res.data || []).filter(r => r.status === 'Active'));
    } catch (error) {
      console.error('Error loading rooms:', error);
      setRooms([]);
    }
  };

  const handleCallNext = async () => {
    if (!selectedClinic) return;

    try {
      const res = await api.post(`/clinics/${selectedClinic}/queue/next`);
      
      if (res.data.patient) {
        alert(`Called: ${res.data.patient.patient_name} (Queue #${res.data.patient.queue_number})`);
      } else {
        alert('No patients waiting in queue');
      }
      
      loadQueue();
    } catch (error) {
      console.error('Error calling next patient:', error);
      alert('Failed to call next patient');
    }
  };

  const handleUpdateStatus = async (queueId, newStatus) => {
    try {
      await api.patch(`/queue/${queueId}/status`, { status: newStatus });
      alert('Queue status updated!');
      loadQueue();
    } catch (error) {
      console.error('Error updating queue status:', error);
      alert('Failed to update queue status');
    }
  };

  const openReassignModal = (patient) => {
    setSelectedPatient(patient);
    setReassignForm({
      doctorId: patient.staff_id || '',
      roomId: patient.room_id || '',
      reason: ''
    });
    setShowReassignModal(true);
  };

  const handleReassign = async () => {
    if (!selectedPatient) return;

    try {
      const updates = [];

      // Reassign doctor if changed
      if (reassignForm.doctorId && reassignForm.doctorId !== selectedPatient.staff_id) {
        await api.patch(`/appointments/${selectedPatient.appointment_id}/doctor`, {
          staff_id: reassignForm.doctorId,
          reason: reassignForm.reason
        });
        updates.push('doctor');
      }

      // Reassign room if changed
      if (reassignForm.roomId && reassignForm.roomId !== selectedPatient.room_id) {
        await api.patch(`/appointments/${selectedPatient.appointment_id}/room`, {
          room_id: reassignForm.roomId,
          reason: reassignForm.reason
        });
        updates.push('room');
      }

      if (updates.length > 0) {
        alert(`✅ Successfully reassigned ${updates.join(' and ')}!`);
        setShowReassignModal(false);
        setSelectedPatient(null);
        loadQueue();
      } else {
        alert('No changes made');
      }
    } catch (error) {
      console.error('Error reassigning:', error);
      alert(error.response?.data?.message || 'Failed to reassign');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Waiting':
        return { bg: '#fef3c7', color: '#92400e' };
      case 'In-Service':
        return { bg: '#dbeafe', color: '#1e40af' };
      case 'Completed':
        return { bg: '#d1fae5', color: '#065f46' };
      default:
        return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  if (loading && !selectedClinic) {
    return (
      <div className="module-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Patient Queue Management</h2>
        <div className="module-actions">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (30s)
          </label>
          <button className="btn btn-primary" onClick={loadQueue}>
            🔄 Refresh
          </button>
          <button className="btn btn-success" onClick={handleCallNext}>
            📢 Call Next Patient
          </button>
        </div>
      </div>

      {/* Clinic Selector */}
      <div className="filter-card">
        <div className="form-group">
          <label>Select Clinic:</label>
          <select
            value={selectedClinic}
            onChange={(e) => setSelectedClinic(e.target.value)}
            style={{ padding: '0.75rem', fontSize: '1rem', minWidth: '300px' }}
          >
            {clinics.map(clinic => (
              <option key={clinic.clinic_id} value={clinic.clinic_id}>
                {clinic.clinic_name} ({clinic.campus_name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' }}>
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.total_queue || 0}</div>
            <div className="stat-label">Total in Queue</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.waiting_count || 0}</div>
            <div className="stat-label">Waiting</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
          <div className="stat-icon">🏥</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.in_service_count || 0}</div>
            <div className="stat-label">In Service</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.completed_count || 0}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">
              {statistics.avg_wait_time_minutes ? Math.round(statistics.avg_wait_time_minutes) : 0}m
            </div>
            <div className="stat-label">Avg Wait Time</div>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Queue #</th>
              <th>Patient Name</th>
              <th>Phone</th>
              <th>Time</th>
              <th>Doctor/Nurse</th>
              <th>Room</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {queue.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>No patients in queue</h3>
                    <p>Queue is empty for this clinic</p>
                  </div>
                </td>
              </tr>
            ) : (
              queue.map((item) => {
                const statusStyle = getStatusColor(item.status);
                return (
                  <tr key={item.queue_id}>
                    <td>
                      <strong style={{ fontSize: '1.25rem', color: '#14b8a6' }}>
                        #{item.queue_number}
                      </strong>
                    </td>
                    <td><strong>{item.patient_name}</strong></td>
                    <td>{item.phone_number || '-'}</td>
                    <td>
                      {item.appointment_time ? 
                        new Date(item.appointment_time).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : '-'}
                    </td>
                    <td>
                      {item.staff_first_name && item.staff_last_name ? 
                        `${item.staff_first_name} ${item.staff_last_name}` : '-'}
                    </td>
                    <td>{item.room_name || '-'}</td>
                    <td>{item.reason || '-'}</td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ 
                          background: statusStyle.bg, 
                          color: statusStyle.color 
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {item.status === 'Waiting' && (
                          <>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleUpdateStatus(item.queue_id, 'In-Service')}
                              title="Start Service"
                            >
                              ▶️ Start
                            </button>
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => openReassignModal(item)}
                              title="Reassign"
                            >
                              🔄 Reassign
                            </button>
                          </>
                        )}
                        {item.status === 'In-Service' && (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleUpdateStatus(item.queue_id, 'Completed')}
                              title="Complete"
                            >
                              ✅ Complete
                            </button>
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => openReassignModal(item)}
                              title="Reassign"
                            >
                              🔄 Reassign
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Reassign Modal */}
      {showReassignModal && selectedPatient && (
        <div className="modal-overlay" onClick={() => setShowReassignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h3>🔄 Reassign Patient</h3>
            
            <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <strong>Patient:</strong> {selectedPatient.patient_name}
              <br />
              <strong>Queue #:</strong> {selectedPatient.queue_number}
              <br />
              <strong>Current Doctor:</strong> {selectedPatient.staff_first_name} {selectedPatient.staff_last_name}
              <br />
              <strong>Current Room:</strong> {selectedPatient.room_name || 'Not assigned'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label><strong>Reassign to Doctor/Nurse</strong></label>
                <select
                  value={reassignForm.doctorId}
                  onChange={(e) => setReassignForm({...reassignForm, doctorId: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                >
                  <option value="">-- Keep Current --</option>
                  {doctors.map(doctor => (
                    <option key={doctor.staff_id} value={doctor.staff_id}>
                      {doctor.role_name === 'Doctor' ? 'Dr.' : ''} {doctor.first_name} {doctor.last_name} ({doctor.role_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label><strong>Reassign to Room</strong></label>
                <select
                  value={reassignForm.roomId}
                  onChange={(e) => setReassignForm({...reassignForm, roomId: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                >
                  <option value="">-- Keep Current --</option>
                  {rooms.map(room => (
                    <option key={room.room_id} value={room.room_id}>
                      {room.room_name} - {room.room_type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label><strong>Reason for Reassignment</strong></label>
                <textarea
                  value={reassignForm.reason}
                  onChange={(e) => setReassignForm({...reassignForm, reason: e.target.value})}
                  placeholder="Enter reason for reassignment..."
                  rows="3"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowReassignModal(false);
                  setSelectedPatient(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleReassign}
              >
                🔄 Reassign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientQueueEnhanced;
