import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './ManagerDashboard.css';

// Import report components from AdminDashboard
import DashboardReports from '../AdminDashboard/modules/reports/DashboardReports';
import PatientReports from '../AdminDashboard/modules/reports/PatientReports';
import FinancialReports from '../AdminDashboard/modules/reports/FinancialReports';
import AppointmentReports from '../AdminDashboard/modules/reports/AppointmentReports';
import StaffReports from '../AdminDashboard/modules/reports/StaffReports';
import InventoryManagement from '../PharmacistDashboard/modules/InventoryManagement';

function ManagerDashboard() {
  const { user, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({ reports: true });

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: '📊',
      module: 'dashboard'
    },
    {
      id: 'inventory',
      label: 'Inventory Status',
      icon: '📦',
      module: 'inventory'
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: '📋',
      submenu: [
        { id: 'dashboard-reports', label: 'Dashboard Overview', module: 'dashboard-reports' },
        { id: 'patient-reports', label: 'Patient Reports', module: 'patient-reports' },
        { id: 'financial-reports', label: 'Financial Reports', module: 'financial-reports' },
        { id: 'appointment-reports', label: 'Appointment Reports', module: 'appointment-reports' },
        { id: 'staff-reports', label: 'Staff Reports', module: 'staff-reports' }
      ]
    }
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardReports />;
      case 'inventory':
        return <InventoryManagement />;
      case 'dashboard-reports':
        return <DashboardReports />;
      case 'patient-reports':
        return <PatientReports />;
      case 'financial-reports':
        return <FinancialReports />;
      case 'appointment-reports':
        return <AppointmentReports />;
      case 'staff-reports':
        return <StaffReports />;
      default:
        return <DashboardReports />;
    }
  };

  return (
    <div className="manager-layout">
      {/* Sidebar */}
      <aside className={`manager-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">📈</span>
            {!sidebarCollapsed && <span className="logo-text">Manager Portal</span>}
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
          <div className="user-avatar">{user?.name?.charAt(0) || 'M'}</div>
          {!sidebarCollapsed && (
            <div className="user-info">
              <div className="user-name">{user?.name || 'Manager'}</div>
              <div className="user-role">{user?.role || 'Management'}</div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div key={item.id} className="nav-item-wrapper">
              {item.submenu ? (
                <>
                  <button
                    className={`nav-item ${expandedMenus[item.id] ? 'expanded' : ''}`}
                    onClick={() => toggleMenu(item.id)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {!sidebarCollapsed && (
                      <>
                        <span className="nav-label">{item.label}</span>
                        <span className="nav-arrow">{expandedMenus[item.id] ? '▼' : '▶'}</span>
                      </>
                    )}
                  </button>
                  {expandedMenus[item.id] && !sidebarCollapsed && (
                    <div className="submenu">
                      {item.submenu.map((subItem) => (
                        <button
                          key={subItem.id}
                          className={`submenu-item ${activeModule === subItem.module ? 'active' : ''}`}
                          onClick={() => setActiveModule(subItem.module)}
                        >
                          <span className="submenu-dot">•</span>
                          <span className="submenu-label">{subItem.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  className={`nav-item ${activeModule === item.module ? 'active' : ''}`}
                  onClick={() => setActiveModule(item.module)}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                </button>
              )}
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
      <main className="manager-main">
        <header className="manager-header">
          <div className="header-left">
            <h1 className="page-title">
              {menuItems.find(item => item.module === activeModule)?.label || 
               menuItems.flatMap(item => item.submenu || []).find(sub => sub.module === activeModule)?.label ||
               'Overview'}
            </h1>
          </div>
          <div className="header-right">
            <button className="header-btn" title="Notifications">
              <span className="icon">🔔</span>
              <span className="badge">1</span>
            </button>
            <button className="header-btn" title="Help">
              <span className="icon">❓</span>
            </button>
          </div>
        </header>

        <div className="manager-content">
          {renderModule()}
        </div>
      </main>
    </div>
  );
}

export default ManagerDashboard;
