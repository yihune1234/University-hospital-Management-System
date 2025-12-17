import { useState, useEffect } from 'react';
import api from '../../../../utils/api';
import '../ModuleStyles.css';

function CampusClinicSettings() {
  const [activeTab, setActiveTab] = useState('campuses');
  const [campuses, setCampuses] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Campus form
  const [showCampusForm, setShowCampusForm] = useState(false);
  const [campusForm, setCampusForm] = useState({
    campus_name: '',
    location: '',
    status: 'Active'
  });
  const [editingCampusId, setEditingCampusId] = useState(null);
  
  // Clinic form
  const [showClinicForm, setShowClinicForm] = useState(false);
  const [clinicForm, setClinicForm] = useState({
    campus_id: '',
    clinic_name: '',
    clinic_type: '',
    open_time: '08:00',
    close_time: '17:00',
    status: 'Active'
  });
  const [editingClinicId, setEditingClinicId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const campusesRes = await api.get('/admin/campuses');
      setCampuses(campusesRes.data || []);
      
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

  // Campus handlers
  const handleCampusSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCampusId) {
        await api.put(`/admin/campuses/${editingCampusId}`, campusForm);
        alert('✅ Campus updated successfully!');
      } else {
        await api.post('/admin/campuses', campusForm);
        alert('✅ Campus created successfully!');
      }
      setShowCampusForm(false);
      setCampusForm({ campus_name: '', location: '', status: 'Active' });
      setEditingCampusId(null);
      loadData();
    } catch (error) {
      console.error('Error saving campus:', error);
      alert(error.response?.data?.message || 'Failed to save campus');
    }
  };

  const handleEditCampus = (campus) => {
    setCampusForm({
      campus_name: campus.campus_name,
      location: campus.location,
      status: campus.status
    });
    setEditingCampusId(campus.campus_id);
    setShowCampusForm(true);
  };

  const handleCancelCampus = () => {
    setShowCampusForm(false);
    setEditingCampusId(null);
    setCampusForm({ campus_name: '', location: '', status: 'Active' });
  };

  // Clinic handlers
  const handleClinicSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClinicId) {
        await api.put(`/admin/clinics/${editingClinicId}`, clinicForm);
        alert('✅ Clinic updated successfully!');
      } else {
        await api.post('/admin/clinics', clinicForm);
        alert('✅ Clinic created successfully!');
      }
      setShowClinicForm(false);
      setClinicForm({
        campus_id: '',
        clinic_name: '',
        clinic_type: '',
        open_time: '08:00',
        close_time: '17:00',
        status: 'Active'
      });
      setEditingClinicId(null);
      loadData();
    } catch (error) {
      console.error('Error saving clinic:', error);
      alert(error.response?.data?.message || 'Failed to save clinic');
    }
  };

  const handleEditClinic = (clinic) => {
    setClinicForm({
      campus_id: clinic.campus_id,
      clinic_name: clinic.clinic_name,
      clinic_type: clinic.clinic_type,
      open_time: clinic.open_time,
      close_time: clinic.close_time,
      status: clinic.status
    });
    setEditingClinicId(clinic.clinic_id);
    setShowClinicForm(true);
  };

  const handleCancelClinic = () => {
    setShowClinicForm(false);
    setEditingClinicId(null);
    setClinicForm({
      campus_id: '',
      clinic_name: '',
      clinic_type: '',
      open_time: '08:00',
      close_time: '17:00',
      status: 'Active'
    });
  };

  const toggleClinicStatus = async (clinicId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await api.patch(`/admin/clinics/${clinicId}/status`, { status: newStatus });
      alert('✅ Clinic status updated!');
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update clinic status');
    }
  };

  if (loading) {
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
        <h2 className="module-title">Campus & Clinic Management</h2>
        <div className="module-actions">
          <button className="btn btn-primary" onClick={loadData}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`tab-btn ${activeTab === 'campuses' ? 'active' : ''}`}
          onClick={() => setActiveTab('campuses')}
        >
          🏫 Campuses ({campuses.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'clinics' ? 'active' : ''}`}
          onClick={() => setActiveTab('clinics')}
        >
          🏥 Clinics ({clinics.length})
        </button>
      </div>

      {/* Campus Tab */}
      {activeTab === 'campuses' && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowCampusForm(!showCampusForm)}
            >
              {showCampusForm ? '✖ Cancel' : '➕ Add Campus'}
            </button>
          </div>

          {showCampusForm && (
            <div className="form-card">
              <h3>{editingCampusId ? '✏️ Edit Campus' : '➕ Add New Campus'}</h3>
              <form onSubmit={handleCampusSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Campus Name *</label>
                    <input
                      type="text"
                      value={campusForm.campus_name}
                      onChange={(e) => setCampusForm({ ...campusForm, campus_name: e.target.value })}
                      required
                      placeholder="e.g., Main Campus"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      value={campusForm.location}
                      onChange={(e) => setCampusForm({ ...campusForm, location: e.target.value })}
                      required
                      placeholder="e.g., 123 University Ave"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={campusForm.status}
                      onChange={(e) => setCampusForm({ ...campusForm, status: e.target.value })}
                      className="form-control"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingCampusId ? '💾 Update Campus' : '➕ Create Campus'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleCancelCampus}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Campus Name</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campuses.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                      <div className="empty-state">
                        <div className="empty-icon">🏫</div>
                        <h3>No campuses found</h3>
                        <p>Click "Add Campus" to create your first campus</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  campuses.map((campus) => (
                    <tr key={campus.campus_id}>
                      <td>{campus.campus_id}</td>
                      <td><strong>{campus.campus_name}</strong></td>
                      <td>{campus.location}</td>
                      <td>
                        <span 
                          className="status-badge" 
                          style={{ 
                            background: campus.status === 'Active' ? '#d1fae5' : '#fee2e2',
                            color: campus.status === 'Active' ? '#065f46' : '#991b1b'
                          }}
                        >
                          {campus.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleEditCampus(campus)}
                          title="Edit"
                        >
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Clinic Tab */}
      {activeTab === 'clinics' && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowClinicForm(!showClinicForm)}
            >
              {showClinicForm ? '✖ Cancel' : '➕ Add Clinic'}
            </button>
          </div>

          {showClinicForm && (
            <div className="form-card">
              <h3>{editingClinicId ? '✏️ Edit Clinic' : '➕ Add New Clinic'}</h3>
              <form onSubmit={handleClinicSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Campus *</label>
                    <select
                      value={clinicForm.campus_id}
                      onChange={(e) => setClinicForm({ ...clinicForm, campus_id: e.target.value })}
                      required
                      className="form-control"
                    >
                      <option value="">Select Campus</option>
                      {campuses.map((campus) => (
                        <option key={campus.campus_id} value={campus.campus_id}>
                          {campus.campus_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Clinic Name *</label>
                    <input
                      type="text"
                      value={clinicForm.clinic_name}
                      onChange={(e) => setClinicForm({ ...clinicForm, clinic_name: e.target.value })}
                      required
                      placeholder="e.g., General Medicine"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Clinic Type</label>
                    <input
                      type="text"
                      value={clinicForm.clinic_type}
                      onChange={(e) => setClinicForm({ ...clinicForm, clinic_type: e.target.value })}
                      placeholder="e.g., General, Dental"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Open Time</label>
                    <input
                      type="time"
                      value={clinicForm.open_time}
                      onChange={(e) => setClinicForm({ ...clinicForm, open_time: e.target.value })}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Close Time</label>
                    <input
                      type="time"
                      value={clinicForm.close_time}
                      onChange={(e) => setClinicForm({ ...clinicForm, close_time: e.target.value })}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={clinicForm.status}
                      onChange={(e) => setClinicForm({ ...clinicForm, status: e.target.value })}
                      className="form-control"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingClinicId ? '💾 Update Clinic' : '➕ Create Clinic'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleCancelClinic}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Clinic Name</th>
                  <th>Type</th>
                  <th>Campus</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clinics.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      <div className="empty-state">
                        <div className="empty-icon">🏥</div>
                        <h3>No clinics found</h3>
                        <p>Click "Add Clinic" to create your first clinic</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  clinics.map((clinic) => (
                    <tr key={clinic.clinic_id}>
                      <td>{clinic.clinic_id}</td>
                      <td><strong>{clinic.clinic_name}</strong></td>
                      <td>{clinic.clinic_type || '-'}</td>
                      <td>{clinic.campus_name}</td>
                      <td>{clinic.open_time} - {clinic.close_time}</td>
                      <td>
                        <span 
                          className="status-badge" 
                          style={{ 
                            background: clinic.status === 'Active' ? '#d1fae5' : '#fee2e2',
                            color: clinic.status === 'Active' ? '#065f46' : '#991b1b'
                          }}
                        >
                          {clinic.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleEditClinic(clinic)}
                            title="Edit"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className={`btn btn-sm ${clinic.status === 'Active' ? 'btn-danger' : 'btn-success'}`}
                            onClick={() => toggleClinicStatus(clinic.clinic_id, clinic.status)}
                            title="Toggle Status"
                          >
                            {clinic.status === 'Active' ? '🔴 Deactivate' : '🟢 Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default CampusClinicSettings;
