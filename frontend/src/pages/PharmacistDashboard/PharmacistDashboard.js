import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './PharmacistDashboard.css';

// Import module components
import PharmacistOverview from './modules/PharmacistOverview';
import PrescriptionQueue from './modules/PrescriptionQueue';
import DispenseMedication from './modules/DispenseMedication';
import InventoryManagement from './modules/InventoryManagement';
import StockAlerts from './modules/StockAlerts';
import DispenseHistory from './modules/DispenseHistory';

function PharmacistDashboard() {
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
      id: 'prescriptions',
      label: 'Prescription Queue',
      icon: '📋',
      module: 'prescriptions'
    },
    {
      id: 'dispense',
      label: 'Dispense Medication',
      icon: '💊',
      module: 'dispense'
    },
    {
      id: 'inventory',
      label: 'Inventory Management',
      icon: '📦',
      module: 'inventory'
    },
    {
      id: 'alerts',
      label: 'Stock Alerts',
      icon: '⚠️',
      module: 'alerts'
    },
    {
      id: 'history',
      label: 'Dispense History',
      icon: '📜',
      module: 'history'
    }
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <PharmacistOverview />;
      case 'prescriptions':
        return <PrescriptionQueue />;
      case 'dispense':
        return <DispenseMedication />;
      case 'inventory':
        return <InventoryManagement />;
      case 'alerts':
        return <StockAlerts />;
      case 'history':
        return <DispenseHistory />;
      default:
        return <PharmacistOverview />;
    }
  };

  return (
    <div className="pharmacist-layout">
      <aside className={`pharmacist-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">💊</span>
            {!sidebarCollapsed && <span className="logo-text">Pharmacy</span>}
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
          <div className="user-avatar">{user?.name?.charAt(0) || 'P'}</div>
          {!sidebarCollapsed && (
            <div className="user-info">
              <div className="user-name">{user?.name || 'Pharmacist'}</div>
              <div className="user-role">{user?.role || 'Pharmacy'}</div>
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

      <main className="pharmacist-main">
        <header className="pharmacist-header">
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

        <div className="pharmacist-content">
          {renderModule()}
        </div>
      </main>
    </div>
  );
}

export default PharmacistDashboard;
