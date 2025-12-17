import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './DoctorDashboard.css';

// Import module components
import DoctorOverview from './modules/DoctorOverview';
import MyAppointments from './modules/MyAppointments';
import PatientConsultation from './modules/PatientConsultation';
import MedicalRecords from './modules/MedicalRecords';
import Prescriptions from './modules/Prescriptions';
import LabRequests from './modules/LabRequests';
import Referrals from './modules/Referrals';
import MySchedule from './modules/MySchedule';

function DoctorDashboard() {
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
      id: 'appointments',
      label: 'My Appointments',
      icon: '📅',
      module: 'appointments'
    },
    {
      id: 'consultation',
      label: 'Patient Consultation',
      icon: '🩺',
      module: 'consultation'
    },
    {
      id: 'medical-records',
      label: 'Medical Records',
      icon: '📋',
      module: 'medical-records'
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      icon: '💊',
      module: 'prescriptions'
    },
    {
      id: 'lab-requests',
      label: 'Lab Requests',
      icon: '🔬',
      module: 'lab-requests'
    },
    {
      id: 'referrals',
      label: 'Referrals',
      icon: '🔄',
      module: 'referrals'
    },
    {
      id: 'schedule',
      label: 'My Schedule',
      icon: '🕐',
      module: 'schedule'
    }
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DoctorOverview />;
      case 'appointments':
        return <MyAppointments />;
      case 'consultation':
        return <PatientConsultation />;
      case 'medical-records':
        return <MedicalRecords />;
      case 'prescriptions':
        return <Prescriptions />;
      case 'lab-requests':
        return <LabRequests />;
      case 'referrals':
        return <Referrals />;
      case 'schedule':
        return <MySchedule />;
      default:
        return <DoctorOverview />;
    }
  };

  return (
    <div className="doctor-layout">
      {/* Sidebar */}
      <aside className={`doctor-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">👨‍⚕️</span>
            {!sidebarCollapsed && <span className="logo-text">Doctor Portal</span>}
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
          <div className="user-avatar">{user?.name?.charAt(0) || 'D'}</div>
          {!sidebarCollapsed && (
            <div className="user-info">
              <div className="user-name">{user?.name || 'Doctor'}</div>
              <div className="user-role">{user?.role || 'Physician'}</div>
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
      <main className="doctor-main">
        <header className="doctor-header">
          <div className="header-left">
            <h1 className="page-title">
              {menuItems.find(item => item.module === activeModule)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="header-right">
            <button className="header-btn" title="Notifications">
              <span className="icon">🔔</span>
              <span className="badge">5</span>
            </button>
            <button className="header-btn" title="Help">
              <span className="icon">❓</span>
            </button>
          </div>
        </header>

        <div className="doctor-content">
          {renderModule()}
        </div>
      </main>
    </div>
  );
}

export default DoctorDashboard;
