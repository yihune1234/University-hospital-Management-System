import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './AdminDashboard.css';

// Import module components
import DashboardOverview from './modules/DashboardOverview';
import StaffManagement from './modules/StaffManagement';
import ScheduleManagement from './modules/ScheduleManagement';
import RoomManagement from './modules/RoomManagement';
import PatientReports from './modules/reports/PatientReports';
import FinancialReports from './modules/reports/FinancialReports';
import AppointmentReports from './modules/reports/AppointmentReports';
import StaffReports from './modules/reports/StaffReports';
import DashboardReports from './modules/reports/DashboardReports';
import GeneralSettings from './modules/settings/GeneralSettings';
import RoleManagement from './modules/settings/RoleManagement';
import SystemLogs from './modules/settings/SystemLogs';
import CampusClinicSettings from './modules/settings/CampusClinicSettings';

function AdminDashboard() {
  const { user, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

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
      label: 'Dashboard',
      icon: '📊',
      module: 'dashboard'
    },
    {
      id: 'room',
      label: 'Room Management',
      icon: '🚪',
      module: 'room'
    },
    {
      id: 'staff',
      label: 'Staff Management',
      icon: '👥',
      module: 'staff'
    },
    {
      id: 'schedule',
      label: 'Schedule Management',
      icon: '�',
      module: 'schedule'
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: '�',
      submenu: [
        { id: 'dashboard-reports', label: 'Dashboard Overview', module: 'dashboard-reports' },
        { id: 'patient-reports', label: 'Patient Reports', module: 'patient-reports' },
        { id: 'financial-reports', label: 'Financial Reports', module: 'financial-reports' },
        { id: 'appointment-reports', label: 'Appointment Reports', module: 'appointment-reports' },
        { id: 'staff-reports', label: 'Staff Reports', module: 'staff-reports' },
        { id: 'audit-logs', label: 'Audit Logs', module: 'audit-logs' }
      ]
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: '⚙️',
      submenu: [
        { id: 'general-settings', label: 'General Settings', module: 'general-settings' },
        { id: 'role-management', label: 'Role Management', module: 'role-management' },
        { id: 'campus-clinic-settings', label: 'Campus & Clinics', module: 'campus-clinic-settings' },
        { id: 'system-logs', label: 'System Logs', module: 'system-logs' }
      ]
    }
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'room':
        return <RoomManagement />;
      case 'staff':
        return <StaffManagement />;
      case 'schedule':
        return <ScheduleManagement />;
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
      case 'audit-logs':
        return <SystemLogs />;
      case 'general-settings':
        return <GeneralSettings />;
      case 'role-management':
        return <RoleManagement />;
      case 'campus-clinic-settings':
        return <CampusClinicSettings />;
      case 'system-logs':
        return <SystemLogs />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🏥</span>
            {!sidebarCollapsed && <span className="logo-text">UCMS Admin</span>}
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
          <div className="user-avatar">{user?.name?.charAt(0) || 'A'}</div>
          {!sidebarCollapsed && (
            <div className="user-info">
              <div className="user-name">{user?.name || 'Admin'}</div>
              <div className="user-role">{user?.role || 'Administrator'}</div>
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
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <h1 className="page-title">
              {menuItems.find(item => item.module === activeModule)?.label || 
               menuItems.flatMap(item => item.submenu || []).find(sub => sub.module === activeModule)?.label ||
               'Dashboard'}
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

        <div className="admin-content">
          {renderModule()}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
