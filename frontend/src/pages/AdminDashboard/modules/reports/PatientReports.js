import React, { useState, useEffect } from 'react';
import api from '../../../../utils/api';
import '../ModuleStyles.css';
import './ReportStyles.css';

function PatientReports() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [overview, setOverview] = useState(null);
  const [demographics, setDemographics] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [visits, setVisits] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(dateRange);
      
      const [overviewRes, demographicsRes, registrationsRes, visitsRes] = await Promise.all([
        api.get(`/reports/patients/overview?${params}`),
        api.get('/reports/patients/demographics'),
        api.get(`/reports/patients/registrations?${params}&groupBy=day`),
        api.get(`/reports/patients/visits?${params}`)
      ]);

      setOverview(overviewRes.data);
      setDemographics(demographicsRes.data);
      setRegistrations(registrationsRes.data);
      setVisits(visitsRes.data);
    } catch (error) {
      console.error('Error fetching patient reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Create CSV content
    const csvContent = [
      ['Patient Reports Export'],
      ['Date Range:', `${dateRange.startDate} to ${dateRange.endDate}`],
      [],
      ['Overview'],
      ['Total Patients', overview?.totalPatients || 0],
      ['New Patients', overview?.newPatients || 0],
      ['Active Patients', overview?.activePatients || 0],
      []
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-report-${dateRange.startDate}-${dateRange.endDate}.csv`;
    a.click();
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Patient Reports & Analytics</h2>
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
          <button className="btn btn-primary" onClick={exportReport}>
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
          className={`tab-btn ${activeTab === 'demographics' ? 'active' : ''}`}
          onClick={() => setActiveTab('demographics')}
        >
          Demographics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'registrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('registrations')}
        >
          Registrations
        </button>
        <button 
          className={`tab-btn ${activeTab === 'visits' ? 'active' : ''}`}
          onClick={() => setActiveTab('visits')}
        >
          Visit History
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading reports...</div>
      ) : (
        <div className="report-content">
          {activeTab === 'overview' && overview && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-value">{overview.totalPatients}</div>
                <div className="stat-label">Total Patients</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✨</div>
                <div className="stat-value">{overview.newPatients}</div>
                <div className="stat-label">New Patients</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏥</div>
                <div className="stat-value">{overview.activePatients}</div>
                <div className="stat-label">Active Patients</div>
              </div>
            </div>
          )}

          {activeTab === 'demographics' && demographics && (
            <div className="demographics-section">
              <div className="chart-container">
                <h3>Gender Distribution</h3>
                <div className="chart-list">
                  {demographics.genderData.map((item, idx) => (
                    <div key={idx} className="chart-item">
                      <span className="chart-label">{item.gender}</span>
                      <div className="chart-bar">
                        <div 
                          className="chart-fill" 
                          style={{width: `${(item.count / demographics.genderData.reduce((a,b) => a + b.count, 0)) * 100}%`}}
                        />
                      </div>
                      <span className="chart-value">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-container">
                <h3>Age Groups</h3>
                <div className="chart-list">
                  {demographics.ageGroups.map((item, idx) => (
                    <div key={idx} className="chart-item">
                      <span className="chart-label">{item.age_group}</span>
                      <div className="chart-bar">
                        <div 
                          className="chart-fill" 
                          style={{width: `${(item.count / demographics.ageGroups.reduce((a,b) => a + b.count, 0)) * 100}%`}}
                        />
                      </div>
                      <span className="chart-value">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'registrations' && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Registrations</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.period}</td>
                      <td>{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'visits' && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Visit Count</th>
                    <th>Last Visit</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.patient_name}</td>
                      <td>{item.visit_count}</td>
                      <td>{new Date(item.last_visit).toLocaleDateString()}</td>
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

export default PatientReports;
