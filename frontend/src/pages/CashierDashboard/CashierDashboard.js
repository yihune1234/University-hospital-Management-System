import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './CashierDashboard.css';

// Import module components
import CashierOverview from './modules/CashierOverview';
import BillingManagement from './modules/BillingManagement';

function CashierDashboard() {
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
      label: 'Overview',
      icon: '📊',
      module: 'dashboard'
    },
    {
      id: 'billing',
      label: 'Billing & Payments',
      icon: '💳',
      module: 'billing'
    }
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <CashierOverview />;
      case 'billing':
        return <BillingManagement />;
      default:
        return <CashierOverview />;
    }
  };

  return (
    <div className="cashier-layout">
      {/* Sidebar */}
      <aside className={`cashier-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">💰</span>
            {!sidebarCollapsed && <span className="logo-text">Cashier Portal</span>}
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
          <div className="user-avatar">{user?.name?.charAt(0) || 'C'}</div>
          {!sidebarCollapsed && (
            <div className="user-info">
              <div className="user-name">{user?.name || 'Cashier'}</div>
              <div className="user-role">{user?.role || 'Finance'}</div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeModule === item.module ? 'active' : ''}`}
              onClick={() => setActiveModule(item.module)}
              title={sidebarCollapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
            </button>
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
      <main className="cashier-main">
        <header className="cashier-header">
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

        <div className="cashier-content">
          {renderModule()}
        </div>
      </main>
    </div>
  );
}

export default CashierDashboard;
