import React, { useState, useEffect } from 'react';
import api from '../../../../utils/api';
import '../ModuleStyles.css';
import './ReportStyles.css';

function StaffReports() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [performance, setPerformance] = useState([]);
  const [utilization, setUtilization] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState('performance');

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(dateRange);
      
      const [performanceRes, utilizationRes, schedulesRes] = await Promise.all([
        api.get(`/reports/staff/performance?${params}`),
        api.get(`/reports/staff/utilization?${params}`),
        api.get(`/reports/staff/schedules?${params}`)
      ]);

      setPerformance(performanceRes.data);
      setUtilization(utilizationRes.data);
      setSchedules(schedulesRes.data);
    } catch (error) {
      console.error('Error fetching staff reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Staff Performance & Utilization</h2>
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
          className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </button>
        <button 
          className={`tab-btn ${activeTab === 'utilization' ? 'active' : ''}`}
          onClick={() => setActiveTab('utilization')}
        >
          Utilization
        </button>
        <button 
          className={`tab-btn ${activeTab === 'schedules' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedules')}
        >
          Schedules
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading reports...</div>
      ) : (
        <div className="report-content">
          {activeTab === 'performance' && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Role</th>
                    <th>Appointments</th>
                    <th>Records Created</th>
                    <th>Avg Consultation Time</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.staff_name}</td>
                      <td><span className="badge badge-primary">{item.role_name}</span></td>
                      <td>{item.appointments_handled}</td>
                      <td>{item.records_created}</td>
                      <td>{Math.round(item.avg_consultation_time || 0)} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'utilization' && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Role</th>
                    <th>Scheduled Shifts</th>
                    <th>Appointments</th>
                    <th>Utilization Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {utilization.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.staff_name}</td>
                      <td><span className="badge badge-primary">{item.role_name}</span></td>
                      <td>{item.scheduled_shifts}</td>
                      <td>{item.appointments}</td>
                      <td>
                        <span className={`badge ${
                          item.utilization_rate > 0.8 ? 'badge-success' : 
                          item.utilization_rate > 0.5 ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {((item.utilization_rate || 0) * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'schedules' && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Clinic</th>
                    <th>Staff Count</th>
                    <th>Roles</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((item, idx) => (
                    <tr key={idx}>
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                      <td>{item.clinic_name}</td>
                      <td>{item.staff_count}</td>
                      <td>{item.roles}</td>
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

export default StaffReports;
