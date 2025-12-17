import { useState, useEffect } from 'react';
import api from '../../../../utils/api';
import '../ModuleStyles.css';

function RoleManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    role_id: '',
    is_active: 1
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/admin/staff'),
        api.get('/auth/roles')
      ]);
      setUsers(usersRes.data || []);
      setRoles(rolesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      role_id: user.role_id,
      is_active: user.is_active
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      await api.patch(`/admin/staff/${selectedUser.staff_id}`, editForm);
      alert('✅ User role updated successfully!');
      setShowEditModal(false);
      setSelectedUser(null);
      loadData();
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
      return;
    }

    try {
      await api.patch(`/admin/staff/${userId}`, { is_active: currentStatus ? 0 : 1 });
      alert('✅ User status updated!');
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !filterRole || user.role_id === parseInt(filterRole);
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case 'Admin': return { bg: '#fee2e2', color: '#991b1b' };
      case 'Receptionist': return { bg: '#dbeafe', color: '#1e40af' };
      case 'Doctor': return { bg: '#d1fae5', color: '#065f46' };
      case 'Nurse': return { bg: '#fef3c7', color: '#92400e' };
      case 'Lab Technician': return { bg: '#e0e7ff', color: '#3730a3' };
      case 'Pharmacist': return { bg: '#fce7f3', color: '#9f1239' };
      default: return { bg: '#f3f4f6', color: '#374151' };
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
        <h2 className="module-title">User Role Management</h2>
        <div className="module-actions">
          <button className="btn btn-primary" onClick={loadData}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-card">
        <div className="filter-grid">
          <div className="form-group">
            <label>Search Users</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Filter by Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="form-control"
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role.role_id} value={role.role_id}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{users.filter(u => u.is_active === 1).length}</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <div className="stat-value">{users.filter(u => u.is_active === 0).length}</div>
            <div className="stat-label">Inactive Users</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
          <div className="stat-icon">🎭</div>
          <div className="stat-content">
            <div className="stat-value">{roles.length}</div>
            <div className="stat-label">Total Roles</div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Current Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>No users found</h3>
                    <p>Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const roleStyle = getRoleBadgeColor(user.role_name);
                return (
                  <tr key={user.staff_id}>
                    <td>{user.staff_id}</td>
                    <td>
                      <strong>{user.first_name} {user.last_name}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ background: roleStyle.bg, color: roleStyle.color }}
                      >
                        {user.role_name}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ 
                          background: user.is_active ? '#d1fae5' : '#fee2e2',
                          color: user.is_active ? '#065f46' : '#991b1b'
                        }}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => openEditModal(user)}
                          title="Change Role"
                        >
                          🔄 Change Role
                        </button>
                        <button
                          className={`btn btn-sm ${user.is_active ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleToggleStatus(user.staff_id, user.is_active)}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {user.is_active ? '❌ Deactivate' : '✅ Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Role Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>🔄 Change User Role</h3>
            
            <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <strong>User:</strong> {selectedUser.first_name} {selectedUser.last_name}
              <br />
              <strong>Email:</strong> {selectedUser.email}
              <br />
              <strong>Current Role:</strong> {selectedUser.role_name}
            </div>

            <div className="form-group">
              <label><strong>New Role</strong></label>
              <select
                value={editForm.role_id}
                onChange={(e) => setEditForm({...editForm, role_id: parseInt(e.target.value)})}
                className="form-control"
              >
                {roles.map(role => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={editForm.is_active === 1}
                  onChange={(e) => setEditForm({...editForm, is_active: e.target.checked ? 1 : 0})}
                />
                <span>User is Active</span>
              </label>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleUpdateUser}
              >
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleManagement;
