import React, { useState, useEffect } from 'react';
import api from '../../../../utils/api';
import '../ModuleStyles.css';
import './ReportStyles.css';

function FinancialReports() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [payments, setPayments] = useState([]);
  const [outstanding, setOutstanding] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(dateRange);
      
      const [overviewRes, revenueRes, paymentsRes, outstandingRes] = await Promise.all([
        api.get(`/reports/financial/overview?${params}`),
        api.get(`/reports/financial/revenue?${params}&groupBy=day`),
        api.get(`/reports/financial/payments?${params}`),
        api.get('/reports/financial/outstanding')
      ]);

      setOverview(overviewRes.data);
      setRevenue(revenueRes.data);
      setPayments(paymentsRes.data);
      setOutstanding(outstandingRes.data);
    } catch (error) {
      console.error('Error fetching financial reports:', error);
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

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Financial Reports & Analytics</h2>
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
          className={`tab-btn ${activeTab === 'revenue' ? 'active' : ''}`}
          onClick={() => setActiveTab('revenue')}
        >
          Revenue Trends
        </button>
        <button 
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payment Methods
        </button>
        <button 
          className={`tab-btn ${activeTab === 'outstanding' ? 'active' : ''}`}
          onClick={() => setActiveTab('outstanding')}
        >
          Outstanding Bills
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading reports...</div>
      ) : (
        <div className="report-content">
          {activeTab === 'overview' && overview && (
            <div className="stats-grid">
              <div className="stat-card success">
                <div className="stat-icon">💰</div>
                <div className="stat-value">{formatCurrency(overview.total_revenue)}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
              <div className="stat-card primary">
                <div className="stat-icon">✅</div>
                <div className="stat-value">{formatCurrency(overview.total_collected)}</div>
                <div className="stat-label">Collected</div>
              </div>
              <div className="stat-card warning">
                <div className="stat-icon">⏳</div>
                <div className="stat-value">{formatCurrency(overview.total_outstanding)}</div>
                <div className="stat-label">Outstanding</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📄</div>
                <div className="stat-value">{overview.total_bills}</div>
                <div className="stat-label">Total Bills</div>
              </div>
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Revenue</th>
                    <th>Collected</th>
                    <th>Bills</th>
                    <th>Collection Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.period}</td>
                      <td>{formatCurrency(item.revenue)}</td>
                      <td>{formatCurrency(item.collected)}</td>
                      <td>{item.bill_count}</td>
                      <td>
                        <span className="badge badge-success">
                          {((item.collected / item.revenue) * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="chart-container">
              <h3>Payment Methods Distribution</h3>
              <div className="chart-list">
                {payments.map((item, idx) => (
                  <div key={idx} className="chart-item">
                    <span className="chart-label">{item.payment_method || 'Not Specified'}</span>
                    <div className="chart-bar">
                      <div 
                        className="chart-fill" 
                        style={{width: `${(item.total_amount / payments.reduce((a,b) => a + parseFloat(b.total_amount), 0)) * 100}%`}}
                      />
                    </div>
                    <span className="chart-value">
                      {formatCurrency(item.total_amount)} ({item.transaction_count} txns)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'outstanding' && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Bill ID</th>
                    <th>Patient</th>
                    <th>Total Amount</th>
                    <th>Paid</th>
                    <th>Outstanding</th>
                    <th>Days</th>
                  </tr>
                </thead>
                <tbody>
                  {outstanding.map((item, idx) => (
                    <tr key={idx}>
                      <td>#{item.bill_id}</td>
                      <td>{item.patient_name}</td>
                      <td>{formatCurrency(item.total_amount)}</td>
                      <td>{formatCurrency(item.amount_paid)}</td>
                      <td className="text-warning">{formatCurrency(item.outstanding)}</td>
                      <td>
                        <span className={`badge ${item.days_outstanding > 30 ? 'badge-danger' : 'badge-warning'}`}>
                          {item.days_outstanding} days
                        </span>
                      </td>
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

export default FinancialReports;
