import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    role_id: '',
    clinic_id: '',
    contact: '',
    email: '',
    password: '',
    is_active: 1,
  });
  const [editingId, setEditingId] = useState(null);
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load staff, roles, and clinics
      const [staffRes, rolesRes, clinicsRes] = await Promise.all([
        api.get('/admin/staff').catch(() => ({ data: [] })),
        api.get('/admin/roles').catch(() => ({ data: [] })),
        api.get('/admin/campuses').catch(() => ({ data: [] })),
      ]);

      setStaff(staffRes.data || []);
      setRoles(rolesRes.data || []);
      
      // Flatten clinics from all campuses
      const allClinics = [];
      for (const campus of clinicsRes.data || []) {
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
      
      // Convert empty strings to null for optional fields
      if (!submitData.middle_name) submitData.middle_name = null;
      if (!submitData.clinic_id) submitData.clinic_id = null;
      if (!submitData.contact) submitData.contact = null;

      if (editingId) {
        // Don't send password on update unless it's changed
        const { password, ...updateData } = submitData;
        await api.put(`/admin/staff/${editingId}`, updateData);
        alert('Staff member updated successfully!');
      } else {
        // Password required for new staff
        if (!submitData.password || submitData.password.length < 6) {
          alert('Password must be at least 6 characters');
          return;
        }
        await api.post('/admin/staff', submitData);
        alert('Staff member created successfully!');
      }
      
      setShowForm(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving staff:', error);
      alert(error.response?.data?.message || 'Failed to save staff member');
    }
  };

  const handleEdit = (staffMember) => {
    setFormData({
      first_name: staffMember.first_name,
      middle_name: staffMember.middle_name || '',
      last_name: staffMember.last_name,
      role_id: staffMember.role_id,
      clinic_id: staffMember.clinic_id || '',
      contact: staffMember.contact || '',
      email: staffMember.email,
      password: '',
      is_active: staffMember.is_active,
    });
    setEditingId(staffMember.staff_id);
    setShowForm(true);
  };

  const toggleStatus = async (staffId, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await api.patch(`/admin/staff/${staffId}/status`, { is_active: newStatus });
      alert('Staff status updated!');
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update staff status');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      await api.patch(`/admin/staff/${selectedStaff.staff_id}/password`, {
        password: newPassword
      });
      alert('Password changed successfully!');
      setShowPasswordForm(false);
      setSelectedStaff(null);
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      middle_name: '',
      last_name: '',
      role_id: '',
      clinic_id: '',
      contact: '',
      email: '',
      password: '',
      is_active: 1,
    });
    setEditingId(null);
  };

  const filteredStaff = staff.filter(s => {
    const matchesRole = !filterRole || s.role_id === parseInt(filterRole);
    const matchesStatus = filterStatus === '' || s.is_active === parseInt(filterStatus);
    const matchesSearch = !searchTerm || 
      s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="module-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Staff Management</h2>
        <div className="module-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✖ Cancel' : '➕ Add Staff'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
        >
          <option value="">All Roles</option>
          {roles.map(role => (
            <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
        >
          <option value="">All Status</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="form-card">
          <h3>{editingId ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Middle Name</label>
                <input
                  type="text"
                  value={formData.middle_name}
                  onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Clinic</label>
                <select
                  value={formData.clinic_id}
                  onChange={(e) => setFormData({ ...formData, clinic_id: e.target.value })}
                >
                  <option value="">No Clinic (Admin)</option>
                  {clinics.map(clinic => (
                    <option key={clinic.clinic_id} value={clinic.clinic_id}>
                      {clinic.clinic_name} ({clinic.campus_name})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Contact</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={editingId}
                />
              </div>
              {!editingId && (
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingId}
                    placeholder="Min 6 characters"
                  />
                </div>
              )}
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })}
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Staff' : 'Create Staff'}
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

      {/* Password Change Modal */}
      {showPasswordForm && selectedStaff && (
        <div className="modal-overlay" onClick={() => setShowPasswordForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Change Password for {selectedStaff.first_name} {selectedStaff.last_name}</h3>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>New Password *</label>
                <input type="password" name="newPassword" required minLength="6" />
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <input type="password" name="confirmPassword" required minLength="6" />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Change Password</button>
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowPasswordForm(false);
                  setSelectedStaff(null);
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Clinic</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>No staff members found</h3>
                    <p>Click "Add Staff" to create a new staff member</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStaff.map((staffMember) => (
                <tr key={staffMember.staff_id}>
                  <td>{staffMember.staff_id}</td>
                  <td>
                    <strong>
                      {staffMember.first_name} {staffMember.middle_name} {staffMember.last_name}
                    </strong>
                  </td>
                  <td>
                    <span className="role-badge">
                      {roles.find(r => r.role_id === staffMember.role_id)?.role_name || 'Unknown'}
                    </span>
                  </td>
                  <td>
                    {clinics.find(c => c.clinic_id === staffMember.clinic_id)?.clinic_name || '-'}
                  </td>
                  <td>{staffMember.email}</td>
                  <td>{staffMember.contact || '-'}</td>
                  <td>
                    <span className={`status-badge ${staffMember.is_active ? 'active' : 'inactive'}`}>
                      {staffMember.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(staffMember)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => {
                          setSelectedStaff(staffMember);
                          setShowPasswordForm(true);
                        }}
                        title="Change Password"
                      >
                        🔑
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => toggleStatus(staffMember.staff_id, staffMember.is_active)}
                        title="Toggle Status"
                      >
                        {staffMember.is_active ? '🔴' : '🟢'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '0.5rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e40af' }}>{staff.length}</div>
          <div style={{ color: '#3b82f6' }}>Total Staff</div>
        </div>
        <div style={{ background: '#d1fae5', padding: '1rem', borderRadius: '0.5rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#065f46' }}>
            {staff.filter(s => s.is_active).length}
          </div>
          <div style={{ color: '#10b981' }}>Active Staff</div>
        </div>
        <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '0.5rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#92400e' }}>
            {roles.length}
          </div>
          <div style={{ color: '#f59e0b' }}>Total Roles</div>
        </div>
      </div>
    </div>
  );
}

export default StaffManagement;
