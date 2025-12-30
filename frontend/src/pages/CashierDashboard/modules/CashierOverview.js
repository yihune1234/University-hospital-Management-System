import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function CashierOverview() {
  const [stats, setStats] = useState({
    totalBills: 0,
    paidBills: 0,
    unpaidBills: 0,
    totalCollected: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      // We can use the bills list to calculate some basic stats if there's no dedicated endpoint
      const res = await api.get('/bills');
      const bills = res.data || [];
      
      const totalCollected = bills.reduce((sum, bill) => sum + parseFloat(bill.total_paid || 0), 0);
      const paid = bills.filter(b => b.status === 'Paid').length;
      const unpaid = bills.filter(b => b.status === 'Unpaid' || b.status === 'Partial').length;

      setStats({
        totalBills: bills.length,
        paidBills: paid,
        unpaidBills: unpaid,
        totalCollected: totalCollected
      });
    } catch (error) {
      console.error('Error loading cashier stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading overview...</div>;

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Cashier Overview</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalBills}</div>
            <div className="stat-label">Total Bills</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.paidBills}</div>
            <div className="stat-label">Paid Bills</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.unpaidBills}</div>
            <div className="stat-label">Pending Bills</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">${stats.totalCollected.toFixed(2)}</div>
            <div className="stat-label">Total Collected</div>
          </div>
        </div>
      </div>

      <div className="welcome-section" style={{ marginTop: '2rem', padding: '2rem', background: '#fff', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <h3>👋 Welcome back!</h3>
        <p>You can manage patient billing and process payments from the Billing Management section.</p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', flex: 1 }}>
            <h4>💡 Quick Tip</h4>
            <p>You can search for bills by patient name or university ID to quickly process payments.</p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', flex: 1 }}>
            <h4>🕒 Recent Activity</h4>
            <p>Recent payments will appear in the Billing Management history.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CashierOverview;
