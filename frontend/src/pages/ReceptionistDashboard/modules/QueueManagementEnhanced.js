import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function QueueManagementEnhanced() {
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [queue, setQueue] = useState([]);
  const [statistics, setStatistics] = useState({
    total_queue: 0,
    waiting_count: 0,
    in_service_count: 0,
    completed_count: 0,
    avg_wait_time_minutes: 0
  });
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [draggedItem, setDraggedItem] = useState(null);
  const [showReorderMode, setShowReorderMode] = useState(false);

  useEffect(() => {
    loadClinics();
  }, []);

  useEffect(() => {
    if (selectedClinic) {
      loadQueue();
    }
  }, [selectedClinic]);

  useEffect(() => {
    let interval;
    if (autoRefresh && selectedClinic) {
      interval = setInterval(() => {
        loadQueue();
      }, 30000); // Refresh every 30 seconds
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
      setStatistics(res.data.statistics || {
        total_queue: 0,
        waiting_count: 0,
        in_service_count: 0,
        completed_count: 0,
        avg_wait_time_minutes: 0
      });
    } catch (error) {
      console.error('Error loading queue:', error);
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async () => {
    if (!selectedClinic) return;

    try {
      const res = await api.post(`/clinics/${selectedClinic}/queue/next`);
      
      if (res.data.patient) {
        // Show notification
        showNotification(
          `Called: ${res.data.patient.patient_name}`,
          `Queue #${res.data.patient.queue_number}${res.data.patient.room_name ? ` - Room: ${res.data.patient.room_name}` : ''}`,
          'success'
        );
      } else {
        showNotification('No Patients', 'Queue is empty', 'info');
      }
      
      loadQueue();
    } catch (error) {
      console.error('Error calling next patient:', error);
      showNotification('Error', 'Failed to call next patient', 'error');
    }
  };

  const handleUpdateStatus = async (queueId, newStatus) => {
    try {
      await api.patch(`/queue/${queueId}/status`, { status: newStatus });
      showNotification('Success', 'Queue status updated', 'success');
      loadQueue();
    } catch (error) {
      console.error('Error updating queue status:', error);
      showNotification('Error', 'Failed to update status', 'error');
    }
  };

  const handleRemoveFromQueue = async (queueId) => {
    if (!confirm('Are you sure you want to remove this patient from the queue?')) {
      return;
    }

    try {
      await api.delete(`/queue/${queueId}`);
      showNotification('Success', 'Patient removed from queue', 'success');
      loadQueue();
    } catch (error) {
      console.error('Error removing from queue:', error);
      showNotification('Error', 'Failed to remove patient', 'error');
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetItem) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.queue_id === targetItem.queue_id) {
      return;
    }

    // Only allow reordering for waiting patients
    if (draggedItem.status !== 'Waiting' || targetItem.status !== 'Waiting') {
      showNotification('Warning', 'Can only reorder waiting patients', 'warning');
      return;
    }

    // Create new order
    const newQueue = [...queue];
    const draggedIndex = newQueue.findIndex(item => item.queue_id === draggedItem.queue_id);
    const targetIndex = newQueue.findIndex(item => item.queue_id === targetItem.queue_id);

    // Remove dragged item and insert at target position
    const [removed] = newQueue.splice(draggedIndex, 1);
    newQueue.splice(targetIndex, 0, removed);

    // Update queue numbers
    const queueUpdates = newQueue
      .filter(item => item.status === 'Waiting')
      .map((item, index) => ({
        queue_id: item.queue_id,
        queue_number: index + 1
      }));

    try {
      await api.post('/queue/reorder', { queueUpdates });
      showNotification('Success', 'Queue reordered successfully', 'success');
      loadQueue();
    } catch (error) {
      console.error('Error reordering queue:', error);
      showNotification('Error', 'Failed to reorder queue', 'error');
    }

    setDraggedItem(null);
  };

  const showNotification = (title, message, type = 'info') => {
    // Simple notification - you can replace with a toast library
    alert(`${title}: ${message}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Waiting':
        return { bg: '#fef3c7', color: '#92400e', icon: '⏳' };
      case 'In-Service':
        return { bg: '#dbeafe', color: '#1e40af', icon: '🏥' };
      case 'Completed':
        return { bg: '#d1fae5', color: '#065f46', icon: '✅' };
      default:
        return { bg: '#f3f4f6', color: '#374151', icon: '❓' };
    }
  };

  const getWaitingTime = (checkInTime) => {
    const now = new Date();
    const checkIn = new Date(checkInTime);
    const diffMinutes = Math.floor((now - checkIn) / 1000 / 60);
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    }
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
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
        <h2 className="module-title">🎯 Queue Management</h2>
        <div className="module-actions">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (30s)
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showReorderMode}
              onChange={(e) => setShowReorderMode(e.target.checked)}
            />
            Reorder Mode
          </label>
          <button className="btn btn-outline" onClick={loadQueue}>
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
            className="clinic-select"
          >
            {clinics.map(clinic => (
              <option key={clinic.clinic_id} value={clinic.clinic_id}>
                {clinic.clinic_name} ({clinic.campus_name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.total_queue || 0}</div>
            <div className="stat-label">Total in Queue</div>
          </div>
        </div>

        <div className="stat-card stat-waiting">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.waiting_count || 0}</div>
            <div className="stat-label">Waiting</div>
          </div>
        </div>

        <div className="stat-card stat-service">
          <div className="stat-icon">🏥</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.in_service_count || 0}</div>
            <div className="stat-label">In Service</div>
          </div>
        </div>

        <div className="stat-card stat-completed">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.completed_count || 0}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div className="stat-card stat-time">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">
              {statistics.avg_wait_time_minutes ? Math.round(statistics.avg_wait_time_minutes) : 0}m
            </div>
            <div className="stat-label">Avg Wait Time</div>
          </div>
        </div>
      </div>

      {showReorderMode && (
        <div className="info-banner">
          <span className="info-icon">ℹ️</span>
          <span>Drag and drop waiting patients to reorder the queue</span>
        </div>
      )}

      {/* Queue List */}
      <div className="queue-container">
        {queue.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No patients in queue</h3>
            <p>Queue is empty for this clinic</p>
          </div>
        ) : (
          <div className="queue-list">
            {queue.map((item) => {
              const statusStyle = getStatusColor(item.status);
              const isDraggable = showReorderMode && item.status === 'Waiting';
              
              return (
                <div
                  key={item.queue_id}
                  className={`queue-item ${item.status.toLowerCase()} ${isDraggable ? 'draggable' : ''}`}
                  draggable={isDraggable}
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, item)}
                >
                  <div className="queue-number">
                    <span className="number">#{item.queue_number}</span>
                    {isDraggable && <span className="drag-handle">⋮⋮</span>}
                  </div>

                  <div className="queue-details">
                    <div className="patient-info">
                      <h4 className="patient-name">{item.patient_name}</h4>
                      <div className="patient-meta">
                        <span>📞 {item.phone_number || 'N/A'}</span>
                        {item.appointment_time && (
                          <span>
                            🕐 {new Date(item.appointment_time).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        )}
                        {item.status === 'Waiting' && (
                          <span className="wait-time">
                            ⏱️ Waiting: {getWaitingTime(item.check_in_time)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="appointment-info">
                      {item.staff_first_name && (
                        <div className="info-item">
                          <span className="info-label">Doctor:</span>
                          <span className="info-value">
                            Dr. {item.staff_first_name} {item.staff_last_name}
                          </span>
                        </div>
                      )}
                      {item.room_name && (
                        <div className="info-item">
                          <span className="info-label">Room:</span>
                          <span className="info-value">{item.room_name}</span>
                        </div>
                      )}
                      {item.reason && (
                        <div className="info-item">
                          <span className="info-label">Reason:</span>
                          <span className="info-value">{item.reason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="queue-status">
                    <span 
                      className="status-badge" 
                      style={{ 
                        background: statusStyle.bg, 
                        color: statusStyle.color 
                      }}
                    >
                      {statusStyle.icon} {item.status}
                    </span>
                  </div>

                  <div className="queue-actions">
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
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRemoveFromQueue(item.queue_id)}
                          title="Remove from Queue"
                        >
                          ❌
                        </button>
                      </>
                    )}
                    {item.status === 'In-Service' && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleUpdateStatus(item.queue_id, 'Completed')}
                        title="Complete"
                      >
                        ✅ Complete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default QueueManagementEnhanced;
