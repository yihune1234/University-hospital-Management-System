import React, { useState, useEffect } from 'react';
import api from '../../../../utils/api';
import '../ModuleStyles.css';
import './ReportStyles.css';

function AppointmentReports() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [noShows, setNoShows] = useState([]);
  const [waitTimes, setWaitTimes] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(dateRange);
      
      const [overviewRes, trendsRes, noShowsRes, waitTimesRes] = await Promise.all([
        api.get(`/reports/appointments/overview?${params}`),
        api.get(`/reports/appointments/trends?${params}&groupBy=day`),
        api.get(`/reports/appointments/no-shows?${params}`),
        api.get(`/reports/appointments/wait-times?${params}`)
      ]);

      setOverview(overviewRes.data);
      setTrends(trendsRes.data);
      setNoShows(noShowsRes.data);
      setWaitTimes(waitTimesRes.data);
    } catch (error) {
      console.error('Error fetching appointment reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Appointment Reports & Analytics</h2>
        <div className="module-actions">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            className="date-input"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            className="date-input"
          />
          <button className="btn btn-outline" onClick={fetchReports}>
            🔄 Refresh
          </button>
          <button className="btn btn-primary">
            📥 Export
          </button>
        </div>
      </div>

      <div className="report-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          Trends
        </button>
        <button 
          className={`tab-btn ${activeTab === 'no-shows' ? 'active' : ''}`}
          onClick={() => setActiveTab('no-shows')}
        >
          No-Shows
        </button>
        <button 
          className={`tab-btn ${activeTab === 'wait-times' ? 'active' : ''}`}
          onClick={() => setActiveTab('wait-times')}
        >
          Wait Times
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading reports...</div>
      ) : (
        <div className="report-content">
          {activeTab === 'overview' && overview && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-value">{overview.total_appointments}</div>
                <div className="stat-label">Total Appointments</div>
              </div>
              <div className="stat-card success">
                <div className="stat-icon">✅</div>
                <div className="stat-value">{overview.completed}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card warning">
                <div className="stat-icon">❌</div>
                <div className="stat-value">{overview.cancelled}</div>
                <div className="stat-label">Cancelled</div>
              </div>
              <div className="stat-card danger">
                <div className="stat-icon">👻</div>
                <div className="stat-value">{overview.no_shows}</div>
                <div className="stat-label">No-Shows</div>
              </div>
              <div className="stat-card primary">
                <div className="stat-icon">⏰</div>
                <div className="stat-value">{overview.scheduled}</div>
                <div className="stat-label">Scheduled</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-value">
                  {((overview.completed / overview.total_appointments) * 100).toFixed(1)}%
                </div>
                <div className="stat-label">Completion Rate</div>
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Total</th>
                    <th>Completed</th>
                    <th>Cancelled</th>
                    <th>Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {trends.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.period}</td>
                      <td>{item.total}</td>
                      <td>{item.completed}</td>
                      <td>{item.cancelled}</td>
                      <td>
                        <span className="badge badge-success">
                          {((item.completed / item.total) * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'no-shows' && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Patient Name</th>
                    <th>No-Show Count</th>
                    <th>Last No-Show</th>
                  </tr>
                </thead>
                <tbody>
                  {noShows.map((item, idx) => (
                    <tr key={idx}>
                      <td>#{item.patient_id}</td>
                      <td>{item.patient_name}</td>
                      <td>
                        <span className={`badge ${item.no_show_count > 3 ? 'badge-danger' : 'badge-warning'}`}>
                          {item.no_show_count}
                        </span>
                      </td>
                      <td>{new Date(item.last_no_show).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'wait-times' && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Clinic</th>
                    <th>Avg Wait Time</th>
                    <th>Min Wait Time</th>
                    <th>Max Wait Time</th>
                    <th>Patients</th>
                  </tr>
                </thead>
                <tbody>
                  {waitTimes.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.clinic_name}</td>
                      <td>
                        <span className={`badge ${item.avg_wait_minutes > 30 ? 'badge-warning' : 'badge-success'}`}>
                          {Math.round(item.avg_wait_minutes)} min
                        </span>
                      </td>
                      <td>{Math.round(item.min_wait_minutes)} min</td>
                      <td>{Math.round(item.max_wait_minutes)} min</td>
                      <td>{item.patient_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AppointmentReports;
