import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

import './Navigation.css';

const roleLinks = {
  admin: [
    { path: '/', label: 'Admin Dashboard' },
    { path: '/manage-users', label: 'Manage Users' },
    { path: '/reports', label: 'Reports' },
  ],
  receptionist: [
    { path: '/', label: 'Receptionist Dashboard' },
    { path: '/appointments', label: 'Appointments' },
  ],
  nurse: [
    { path: '/', label: 'Nurse Dashboard' },
    { path: '/patients', label: 'Patients' },
  ],
  doctor: [
    { path: '/', label: 'Doctor Dashboard' },
    { path: '/patients', label: 'Patients' },
    { path: '/consultations', label: 'Consultations' },
  ],
  labtech: [
    { path: '/', label: 'Lab Technician Dashboard' },
    { path: '/tests', label: 'Tests' },
  ],
  pharmacist: [
    { path: '/', label: 'Pharmacist Dashboard' },
    { path: '/prescriptions', label: 'Prescriptions' },
  ],
  cashier: [
    { path: '/', label: 'Cashier Dashboard' },
    { path: '/payments', label: 'Payments' },
  ],
  manager: [
    { path: '/', label: 'Manager Dashboard' },
    { path: '/inventory', label: 'Inventory' },
    { path: '/reports', label: 'Reports' },
  ],
};

function Navigation({ user }) {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  if (!user) return null;

  const links = roleLinks[user.role.toLowerCase()] || [];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="nav" aria-label="Main Navigation">
      <div className="nav-header">
        <h1 className="nav-title">UICMS</h1>
      </div>
      <ul className="nav-links">
        {links.map(({ path, label }) => (
          <li key={path}>
            <NavLink
              to={path}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              tabIndex="0"
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="nav-logout"
        onClick={handleLogout}
        aria-label="Logout"
      >
        Logout
      </button>
    </nav>
  );
}

Navigation.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string.isRequired,
  }).isRequired,
};

export default Navigation;
