import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './NurseDashboard.css';

// Import module components
import NurseOverview from './modules/NurseOverview';
import PatientQueueEnhanced from './modules/PatientQueueEnhanced';
import VitalsRecording from './modules/VitalsRecording';
import MedicalRecords from './modules/MedicalRecords';
import LabRequests from './modules/LabRequests';
import Prescriptions from '../DoctorDashboard/modules/Prescriptions';
import Medications from './modules/Medications';
import PatientCare from './modules/PatientCare';

function NurseDashboard() {
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
      id: 'queue',
      label: 'Patient Queue',
      icon: '👥',
      module: 'queue'
    },
    {
      id: 'vitals',
      label: 'Record Vitals',
      icon: '🩺',
      module: 'vitals'
    },
    {
      id: 'records',
      label: 'Medical Records',
      icon: '📋',
      module: 'records'
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      icon: '💊',
      module: 'prescriptions'
    },
    {
      id: 'labs',
      label: 'Lab Requests',
      icon: '🔬',
      module: 'labs'
    },
    {
      id: 'medications',
      label: 'Medications',
      icon: '💉',
      module: 'medications'
    },
    {
      id: 'care',
      label: 'Patient Care',
      icon: '❤️',
      module: 'care'
    }
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <NurseOverview />;
      case 'queue':
        return <PatientQueueEnhanced />;
      case 'vitals':
        return <VitalsRecording />;
      case 'records':
        return <MedicalRecords />;
      case 'prescriptions':
        return <Prescriptions />;
      case 'labs':
        return <LabRequests />;
      case 'medications':
        return <Medications />;
      case 'care':
        return <PatientCare />;
      default:
        return <NurseOverview />;
    }
  };

  return (
    <div className="nurse-layout">
      <aside className={`nurse-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🩺</span>
            {!sidebarCollapsed && <span className="logo-text">Nursing</span>}
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
          <div className="user-avatar">{user?.name?.charAt(0) || 'N'}</div>
          {!sidebarCollapsed && (
            <div className="user-info">
              <div className="user-name">{user?.name || 'Nurse'}</div>
              <div className="user-role">{user?.role || 'Nursing'}</div>
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

      <main className="nurse-main">
        <header className="nurse-header">
          <div className="header-left">
            <h1 className="page-title">
              {menuItems.find(item => item.module === activeModule)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="header-right">
            <button className="header-btn" title="Notifications">
              <span className="icon">🔔</span>
              <span className="badge">4</span>
            </button>
            <button className="header-btn" title="Help">
              <span className="icon">❓</span>
            </button>
          </div>
        </header>

        <div className="nurse-content">
          {renderModule()}
        </div>
      </main>
    </div>
  );
}

export default NurseDashboard;
