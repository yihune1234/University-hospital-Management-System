import { useState, useEffect } from 'react';
import api from '../../../../utils/api';
import '../ModuleStyles.css';

function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action_type: '',
    user_id: '',
    start_date: '',
    end_date: '',
    limit: 100
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
    loadLogs();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get('/admin/staff');
      setUsers(res.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.action_type) params.append('action_type', filters.action_type);
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      params.append('limit', filters.limit);

      const res = await api.get(`/admin/audit-logs?${params.toString()}`);
      setLogs(res.data || []);
    } catch (error) {
      console.error('Error loading logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    loadLogs();
  };

  const handleClearFilters = () => {
    setFilters({
      action_type: '',
      user_id: '',
      start_date: '',
      end_date: '',
      limit: 100
    });
    setTimeout(() => loadLogs(), 100);
  };

  const getActionBadgeColor = (actionType) => {
    switch (actionType?.toUpperCase()) {
      case 'CREATE':
      case 'INSERT':
        return { bg: '#d1fae5', color: '#065f46' };
      case 'UPDATE':
      case 'EDIT':
        return { bg: '#dbeafe', color: '#1e40af' };
      case 'DELETE':
      case 'REMOVE':
        return { bg: '#fee2e2', color: '#991b1b' };
      case 'LOGIN':
        return { bg: '#fef3c7', color: '#92400e' };
      case 'LOGOUT':
        return { bg: '#f3f4f6', color: '#374151' };
      default:
        return { bg: '#e0e7ff', color: '#3730a3' };
    }
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Table', 'Record ID', 'Details'].join(','),
      ...logs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.user_name || 'System',
        log.action_type,
        log.table_name,
        log.record_id || '-',
        (log.details || '').replace(/,/g, ';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="module-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">System Audit Logs</h2>
        <div className="module-actions">
          <button className="btn btn-secondary" onClick={exportLogs}>
            📥 Export CSV
          </button>
          <button className="btn btn-primary" onClick={loadLogs}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-card">
        <div className="filter-grid">
          <div className="form-group">
            <label>Action Type</label>
            <select
              value={filters.action_type}
              onChange={(e) => handleFilterChange('action_type', e.target.value)}
              className="form-control"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
            </select>
          </div>

          <div className="form-group">
            <label>User</label>
            <select
              value={filters.user_id}
              onChange={(e) => handleFilterChange('user_id', e.target.value)}
              className="form-control"
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user.staff_id} value={user.staff_id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Limit</label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="form-control"
            >
              <option value="50">50 records</option>
              <option value="100">100 records</option>
              <option value="500">500 records</option>
              <option value="1000">1000 records</option>
            </select>
          </div>
        </div>

        <div className="filter-actions">
          <button className="btn btn-primary" onClick={handleApplyFilters}>
            🔍 Apply Filters
          </button>
          <button className="btn btn-secondary" onClick={handleClearFilters}>
            ✖️ Clear Filters
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-value">{logs.length}</div>
            <div className="stat-label">Total Logs</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
          <div className="stat-icon">➕</div>
          <div className="stat-content">
            <div className="stat-value">
              {logs.filter(l => l.action_type === 'CREATE').length}
            </div>
            <div className="stat-label">Create Actions</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
          <div className="stat-icon">✏️</div>
          <div className="stat-content">
            <div className="stat-value">
              {logs.filter(l => l.action_type === 'UPDATE').length}
            </div>
            <div className="stat-label">Update Actions</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
          <div className="stat-icon">🗑️</div>
          <div className="stat-content">
            <div className="stat-value">
              {logs.filter(l => l.action_type === 'DELETE').length}
            </div>
            <div className="stat-label">Delete Actions</div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Table</th>
              <th>Record ID</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>No logs found</h3>
                    <p>Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log, index) => {
                const actionStyle = getActionBadgeColor(log.action_type);
                return (
                  <tr key={index}>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>
                        {new Date(log.timestamp).toLocaleDateString()}
                        <br />
                        <span style={{ color: '#6b7280' }}>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <strong>{log.user_name || 'System'}</strong>
                    </td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ background: actionStyle.bg, color: actionStyle.color }}
                      >
                        {log.action_type}
                      </span>
                    </td>
                    <td>{log.table_name}</td>
                    <td>{log.record_id || '-'}</td>
                    <td>
                      <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.details || '-'}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SystemLogs;
