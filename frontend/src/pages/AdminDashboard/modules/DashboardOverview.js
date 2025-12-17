import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function DashboardOverview() {
  const [stats, setStats] = useState({
    totalCampuses: 0,
    totalClinics: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalStaff: 0,
    activeStaff: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [campusesRes, patientsRes, appointmentsRes] = await Promise.all([
        api.get('/admin/campuses').catch(() => ({ data: [] })),
        api.get('/patients').catch(() => ({ data: [] })),
        api.get('/appointments').catch(() => ({ data: [] })),
      ]);

      setStats({
        totalCampuses: campusesRes.data?.length || 0,
        totalClinics: campusesRes.data?.reduce((sum, campus) => sum + (campus.clinics?.length || 0), 0) || 0,
        totalPatients: patientsRes.data?.length || 0,
        totalAppointments: appointmentsRes.data?.length || 0,
        totalStaff: 0, // Will be implemented
        activeStaff: 0, // Will be implemented
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="module-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">🏫</div>
          <div className="stat-content">
            <h3>{stats.totalCampuses}</h3>
            <p>Total Campuses</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">🏥</div>
          <div className="stat-content">
            <h3>{stats.totalClinics}</h3>
            <p>Total Clinics</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalPatients}</h3>
            <p>Total Patients</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.totalAppointments}</h3>
            <p>Appointments</p>
          </div>
        </div>

        <div className="stat-card pink">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-content">
            <h3>{stats.totalStaff}</h3>
            <p>Total Staff</p>
          </div>
        </div>

        <div className="stat-card teal">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.activeStaff}</h3>
            <p>Active Staff</p>
          </div>
        </div>
      </div>

      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="action-cards">
          <div className="action-card">
            <div className="action-icon">➕</div>
            <h3>Add Campus</h3>
            <p>Create a new campus location</p>
          </div>
          <div className="action-card">
            <div className="action-icon">🏥</div>
            <h3>Add Clinic</h3>
            <p>Set up a new clinic</p>
          </div>
          <div className="action-card">
            <div className="action-icon">👤</div>
            <h3>Add Staff</h3>
            <p>Register new staff member</p>
          </div>
          <div className="action-card">
            <div className="action-icon">📊</div>
            <h3>View Reports</h3>
            <p>Access system reports</p>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">🏫</div>
            <div className="activity-content">
              <p className="activity-title">New campus added</p>
              <p className="activity-time">2 hours ago</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">👤</div>
            <div className="activity-content">
              <p className="activity-title">Staff member registered</p>
              <p className="activity-time">5 hours ago</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">📅</div>
            <div className="activity-content">
              <p className="activity-title">Schedule updated</p>
              <p className="activity-time">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
