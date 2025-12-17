import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard/ReceptionistDashboard';
import NurseDashboard from './pages/NurseDashboard/NurseDashboard';
import DoctorDashboard from './pages/DoctorDashboard/DoctorDashboard';
import LabTechDashboard from './pages/LabTechDashboard/LabTechDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard/PharmacistDashboard';
import CashierDashboard from './pages/CashierDashboard/CashierDashboard';
import ManagerDashboard from './pages/ManagerDashboard/ManagerDashboard';
import PrivateRoute from './routes/PrivateRoute';
import { AuthContext } from './context/AuthContext';

function App() {
  const { user } = useContext(AuthContext);

  const getDashboard = () => {
    if (!user || !user.role) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Invalid User Role</h2>
          <p>Your account does not have a valid role assigned.</p>
          <button onClick={() => window.location.href = '/login'}>Back to Login</button>
        </div>
      );
    }

    // Normalize role name to handle variations
    const normalizeRole = (role) => {
      const normalized = role.toLowerCase().trim();
      // Handle common variations
      if (normalized === 'reception' || normalized === 'receptionist') return 'receptionist';
      if (normalized === 'lab technician' || normalized === 'labtech') return 'labtech';
      return normalized;
    };

    const roleMap = {
      admin: <AdminDashboard />,
      receptionist: <ReceptionistDashboard />,
      nurse: <NurseDashboard />,
      doctor: <DoctorDashboard />,
      labtech: <LabTechDashboard />,
      pharmacist: <PharmacistDashboard />,
      cashier: <CashierDashboard />,
      manager: <ManagerDashboard />,
    };

    const normalizedRole = normalizeRole(user.role);
    const dashboard = roleMap[normalizedRole];
    
    if (!dashboard) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Unknown Role: {user.role}</h2>
          <p>Your role is not recognized by the system.</p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>Normalized to: {normalizedRole}</p>
          <button onClick={() => window.location.href = '/login'}>Back to Login</button>
        </div>
      );
    }

    return dashboard;
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/"
        element={<PrivateRoute>{getDashboard()}</PrivateRoute>}
      />
      {/* Catch all unmatched routes */}
      <Route
        path="*"
        element={<Navigate to={user ? '/' : '/login'} replace />}
      />
    </Routes>
  );
}

export default App;
