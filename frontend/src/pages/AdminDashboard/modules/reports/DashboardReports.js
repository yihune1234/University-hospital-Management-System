import React, { useState, useEffect } from 'react';
import api from '../../../../utils/api';
import '../ModuleStyles.css';
import './ReportStyles.css';

function DashboardReports() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    patients: null,
    financial: null,
    appointments: null,
    clinics: null,
    lab: null,
    pharmacy: null
  });

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0];
      const params = `startDate=${startDate}&endDate=${endDate}`;

      const [
        patientsRes,
        financialRes,
        appointmentsRes,
        clinicsRes,
        labRes,
        pharmacyRes
      ] = await Promise.all([
        api.get(`/reports/patients/overview?${params}`),
        api.get(`/reports/financial/overview?${params}`),
        api.get(`/reports/appointments/overview?${params}`),
        api.get(`/reports/clinics/utilization?${params}`),
        api.get(`/reports/lab/overview?${params}`),
        api.get(`/reports/pharmacy/overview?${params}`)
      ]);

      setData({
        patients: patientsRes.data,
        financial: financialRes.data,
        appointments: appointmentsRes.data,
        clinics: clinicsRes.data,
        lab: labRes.data,
        pharmacy: pharmacyRes.data
      });
    } catch (error) {
      console.error('Error fetching dashboard reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading) {
    return <div className="loading-state">Loading dashboard...</div>;
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Reports Dashboard Overview</h2>
        <div className="module-actions">
          <button className="btn btn-outline" onClick={fetchAllReports}>
            🔄 Refresh All
          </button>
        </div>
      </div>

      <div className="report-content">
        {/* Patient Metrics */}
        <div className="report-section">
          <h3 className="section-title">📊 Patient Metrics (Last 30 Days)</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-value">{data.patients?.totalPatients || 0}</div>
              <div className="stat-label">Total Patients</div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon">✨</div>
              <div className="stat-value">{data.patients?.newPatients || 0}</div>
              <div className="stat-label">New Patients</div>
            </div>
            <div className="stat-card primary">
              <div className="stat-icon">🏥</div>
              <div className="stat-value">{data.patients?.activePatients || 0}</div>
              <div className="stat-label">Active Patients</div>
            </div>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="report-section">
          <h3 className="section-title">💰 Financial Metrics (Last 30 Days)</h3>
          <div className="stats-grid">
            <div className="stat-card success">
              <div className="stat-icon">💵</div>
              <div className="stat-value">{formatCurrency(data.financial?.total_revenue)}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
            <div className="stat-card primary">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{formatCurrency(data.financial?.total_collected)}</div>
              <div className="stat-label">Collected</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon">⏳</div>
              <div className="stat-value">{formatCurrency(data.financial?.total_outstanding)}</div>
              <div className="stat-label">Outstanding</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📄</div>
              <div className="stat-value">{data.financial?.total_bills || 0}</div>
              <div className="stat-label">Total Bills</div>
            </div>
          </div>
        </div>

        {/* Appointment Metrics */}
        <div className="report-section">
          <h3 className="section-title">📅 Appointment Metrics (Last 30 Days)</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-value">{data.appointments?.total_appointments || 0}</div>
              <div className="stat-label">Total Appointments</div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{data.appointments?.completed || 0}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon">❌</div>
              <div className="stat-value">{data.appointments?.cancelled || 0}</div>
              <div className="stat-label">Cancelled</div>
            </div>
            <div className="stat-card danger">
              <div className="stat-icon">👻</div>
              <div className="stat-value">{data.appointments?.no_shows || 0}</div>
              <div className="stat-label">No-Shows</div>
            </div>
            <div className="stat-card primary">
              <div className="stat-icon">⏰</div>
              <div className="stat-value">{data.appointments?.scheduled || 0}</div>
              <div className="stat-label">Scheduled</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-value">
                {data.appointments?.total_appointments 
                  ? ((data.appointments.completed / data.appointments.total_appointments) * 100).toFixed(1)
                  : 0}%
              </div>
              <div className="stat-label">Completion Rate</div>
            </div>
          </div>
        </div>

        {/* Lab Metrics */}
        <div className="report-section">
          <h3 className="section-title">🔬 Laboratory Metrics (Last 30 Days)</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🧪</div>
              <div className="stat-value">{data.lab?.total_requests || 0}</div>
              <div className="stat-label">Total Requests</div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{data.lab?.completed || 0}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon">⏳</div>
              <div className="stat-value">{data.lab?.pending || 0}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card primary">
              <div className="stat-icon">🔄</div>
              <div className="stat-value">{data.lab?.in_progress || 0}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
        </div>

        {/* Pharmacy Metrics */}
        <div className="report-section">
          <h3 className="section-title">💊 Pharmacy Metrics (Last 30 Days)</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-value">{data.pharmacy?.total_prescriptions || 0}</div>
              <div className="stat-label">Total Prescriptions</div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{data.pharmacy?.dispensed || 0}</div>
              <div className="stat-label">Dispensed</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon">⏳</div>
              <div className="stat-value">{data.pharmacy?.pending || 0}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card primary">
              <div className="stat-icon">💊</div>
              <div className="stat-value">{data.pharmacy?.unique_medications || 0}</div>
              <div className="stat-label">Unique Medications</div>
            </div>
          </div>
        </div>

        {/* Clinic Utilization */}
        {data.clinics && data.clinics.length > 0 && (
          <div className="report-section">
            <h3 className="section-title">🏥 Top Clinic Utilization (Last 30 Days)</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Clinic</th>
                    <th>Appointments</th>
                    <th>Patients</th>
                    <th>Staff</th>
                    <th>Avg Wait Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.clinics.slice(0, 5).map((clinic, idx) => (
                    <tr key={idx}>
                      <td>{clinic.clinic_name}</td>
                      <td>{clinic.total_appointments}</td>
                      <td>{clinic.total_patients}</td>
                      <td>{clinic.staff_assigned}</td>
                      <td>
                        <span className={`badge ${
                          clinic.avg_wait_time > 30 ? 'badge-warning' : 'badge-success'
                        }`}>
                          {Math.round(clinic.avg_wait_time || 0)} min
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardReports;
