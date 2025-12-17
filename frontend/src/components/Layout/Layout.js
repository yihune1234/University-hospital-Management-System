import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Layout.css';

function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Role-specific color
  const roleColors = {
    Admin: { primary: '#6366f1', secondary: '#8b5cf6' },
    HealthAdmin: { primary: '#14b8a6', secondary: '#06b6d4' },
    ClinicManager: { primary: '#3b82f6', secondary: '#2563eb' },
    Doctor: { primary: '#10b981', secondary: '#059669' },
    Nurse: { primary: '#ec4899', secondary: '#db2777' },
    Receptionist: { primary: '#f59e0b', secondary: '#d97706' },
    Pharmacist: { primary: '#06b6d4', secondary: '#0891b2' },
    LabStaff: { primary: '#6366f1', secondary: '#4f46e5' },
  };

  const colors = roleColors[user.role] || roleColors.Admin;

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`layout-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
          <h1 className="sidebar-title">UCMS</h1>
          <p className="sidebar-subtitle">{user.role}</p>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
            {user.name.charAt(0)}
          </div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main</div>
            <button className="nav-item active" style={{ '--accent-color': colors.primary }}>
              <span className="nav-icon">📊</span>
              <span className="nav-label">Dashboard</span>
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-secondary" onClick={handleLogout} style={{ width: '100%' }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="layout-main">
        {/* Top Header */}
        <header className="layout-header">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div className="header-title">
            <h2>{user.campus || 'University Hospital Management System'}</h2>
          </div>
          <div className="header-actions">
            <button className="header-icon-btn" aria-label="Notifications">
              🔔
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
