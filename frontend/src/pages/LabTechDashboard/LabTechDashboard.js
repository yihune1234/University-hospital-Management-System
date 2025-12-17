import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './LabTechDashboard.css';

// Import module components
import LabTechOverview from './modules/LabTechOverview';
import PendingRequests from './modules/PendingRequests';
import ProcessTest from './modules/ProcessTest';
import TestResults from './modules/TestResults';
import CompletedTests from './modules/CompletedTests';

function LabTechDashboard() {
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
      id: 'pending',
      label: 'Pending Requests',
      icon: '⏳',
      module: 'pending'
    },
    {
      id: 'process',
      label: 'Process Test',
      icon: '🔬',
      module: 'process'
    },
    {
      id: 'results',
      label: 'Enter Results',
      icon: '📝',
      module: 'results'
    },
    {
      id: 'completed',
      label: 'Completed Tests',
      icon: '✅',
      module: 'completed'
    }
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <LabTechOverview />;
      case 'pending':
        return <PendingRequests />;
      case 'process':
        return <ProcessTest />;
      case 'results':
        return <TestResults />;
      case 'completed':
        return <CompletedTests />;
      default:
        return <LabTechOverview />;
    }
  };

  return (
    <div className="labtech-layout">
      <aside className={`labtech-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🔬</span>
            {!sidebarCollapsed && <span className="logo-text">Lab Portal</span>}
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
          <div className="user-avatar">{user?.name?.charAt(0) || 'L'}</div>
          {!sidebarCollapsed && (
            <div className="user-info">
              <div className="user-name">{user?.name || 'Lab Tech'}</div>
              <div className="user-role">{user?.role || 'Laboratory'}</div>
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

      <main className="labtech-main">
        <header className="labtech-header">
          <div className="header-left">
            <h1 className="page-title">
              {menuItems.find(item => item.module === activeModule)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="header-right">
            <button className="header-btn" title="Notifications">
              <span className="icon">🔔</span>
              <span className="badge">2</span>
            </button>
            <button className="header-btn" title="Help">
              <span className="icon">❓</span>
            </button>
          </div>
        </header>

        <div className="labtech-content">
          {renderModule()}
        </div>
      </main>
    </div>
  );
}

export default LabTechDashboard;
