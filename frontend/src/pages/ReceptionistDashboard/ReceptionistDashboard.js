import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './ReceptionistDashboard.css';

// Import module components
import ReceptionistOverview from './modules/ReceptionistOverview';
import PatientRegistration from './modules/PatientRegistration';
import PatientManagement from './modules/PatientManagement';
import AppointmentManagement from './modules/AppointmentManagement';
import QueueManagement from './modules/QueueManagementEnhanced';
import CheckIn from './modules/CheckIn';

function ReceptionistDashboard() {
  const { user, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      module: 'dashboard'
    },
    {
      id: 'patient-registration',
      label: 'Patient Registration',
      icon: '➕',
      module: 'patient-registration'
    },
    {
      id: 'patient-management',
      label: 'Patient Management',
      icon: '👥',
      module: 'patient-management'
    },
    {
      id: 'appointment-management',
      label: 'Manage Appointments',
      icon: '📋',
      module: 'appointment-management'
    },
    {
      id: 'queue-management',
      label: 'Queue Management',
      icon: '⏱️',
      module: 'queue-management'
    },
    {
      id: 'check-in',
      label: 'Patient Check-In',
      icon: '✅',
      module: 'check-in'
    }
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <ReceptionistOverview />;
      case 'patient-registration':
        return <PatientRegistration />;
      case 'patient-management':
        return <PatientManagement />;
      case 'appointment-management':
        return <AppointmentManagement />;
      case 'queue-management':
        return <QueueManagement />;
      case 'check-in':
        return <CheckIn />;
      default:
        return <ReceptionistOverview />;
    }
  };

  return (
    <div className="receptionist-layout">
      {/* Sidebar */}
      <aside className={`receptionist-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🏥</span>
            {!sidebarCollapsed && <span className="logo-text">Reception Desk</span>}
          </div>
          <button 
            className="collapse-btn" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.charAt(0) || 'R'}</div>
          {!sidebarCollapsed && (
            <div className="user-info">
              <div className="user-name">{user?.name || 'Receptionist'}</div>
              <div className="user-role">{user?.role || 'Front Desk'}</div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div key={item.id} className="nav-item-wrapper">
              <button
                className={`nav-item ${activeModule === item.module ? 'active' : ''}`}
                onClick={() => setActiveModule(item.module)}
                title={sidebarCollapsed ? item.label : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
              </button>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="receptionist-main">
        <header className="receptionist-header">
          <div className="header-left">
            <h1 className="page-title">
              {menuItems.find(item => item.module === activeModule)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="header-right">
            <button className="header-btn" title="Notifications">
              <span className="icon">🔔</span>
              <span className="badge">3</span>
            </button>
            <button className="header-btn" title="Help">
              <span className="icon">❓</span>
            </button>
          </div>
        </header>

        <div className="receptionist-content">
          {renderModule()}
        </div>
      </main>
    </div>
  );
}

export default ReceptionistDashboard;
