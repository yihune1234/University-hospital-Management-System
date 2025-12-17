import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function StockAlerts() {
  const [lowStockDrugs, setLowStockDrugs] = useState([]);
  const [expiredDrugs, setExpiredDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(10);

  useEffect(() => {
    loadAlerts();
  }, [threshold]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const [lowStockRes, allDrugsRes] = await Promise.all([
        api.get(`/pharmacy/drugs/low-stock?threshold=${threshold}`).catch(() => ({ data: [] })),
        api.get('/pharmacy/drugs').catch(() => ({ data: [] }))
      ]);

      setLowStockDrugs(lowStockRes.data || []);

      // Filter expired drugs
      const today = new Date();
      const expired = (allDrugsRes.data || []).filter(drug => {
        if (!drug.expiry_date) return false;
        return new Date(drug.expiry_date) < today;
      });
      setExpiredDrugs(expired);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (drugId, currentStock) => {
    const newStock = prompt(`Enter new stock quantity (current: ${currentStock}):`);
    if (newStock === null) return;

    try {
      await api.patch(`/pharmacy/drugs/${drugId}/stock`, {
        stock_quantity: parseInt(newStock)
      });
      alert('Stock updated successfully!');
      loadAlerts();
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
    }
  };

  if (loading) {
    return (
      <div className="module-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Stock Alerts</h2>
        <div className="module-actions">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Threshold:
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value) || 10)}
              min="1"
              style={{ width: '80px', padding: '0.5rem' }}
            />
          </label>
          <button className="btn btn-primary" onClick={loadAlerts}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{lowStockDrugs.length}</div>
            <div className="stat-label">Low Stock Items</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
          <div className="stat-icon">🚫</div>
          <div className="stat-content">
            <div className="stat-value">{expiredDrugs.length}</div>
            <div className="stat-label">Expired Items</div>
          </div>
        </div>
      </div>

      {/* Low Stock Drugs */}
      <div className="alert-section">
        <h3 style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ⚠️ Low Stock Drugs (≤ {threshold} units)
        </h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Drug Name</th>
                <th>Brand</th>
                <th>Current Stock</th>
                <th>Unit</th>
                <th>Expiry Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lowStockDrugs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="empty-state">
                      <div className="empty-icon">✅</div>
                      <h3>No low stock alerts</h3>
                      <p>All drugs are adequately stocked</p>
                    </div>
                  </td>
                </tr>
              ) : (
                lowStockDrugs.map((drug) => (
                  <tr key={drug.drug_id}>
                    <td>{drug.drug_id}</td>
                    <td><strong>{drug.drug_name}</strong></td>
                    <td>{drug.brand || '-'}</td>
                    <td>
                      <span className="status-badge low-stock">
                        {drug.stock_quantity}
                      </span>
                    </td>
                    <td>{drug.unit}</td>
                    <td>{drug.expiry_date ? new Date(drug.expiry_date).toLocaleDateString() : '-'}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleUpdateStock(drug.drug_id, drug.stock_quantity)}
                      >
                        📦 Restock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expired Drugs */}
      <div className="alert-section" style={{ marginTop: '2rem' }}>
        <h3 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🚫 Expired Drugs
        </h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Drug Name</th>
                <th>Brand</th>
                <th>Stock</th>
                <th>Unit</th>
                <th>Expiry Date</th>
                <th>Days Expired</th>
              </tr>
            </thead>
            <tbody>
              {expiredDrugs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="empty-state">
                      <div className="empty-icon">✅</div>
                      <h3>No expired drugs</h3>
                      <p>All drugs are within expiry date</p>
                    </div>
                  </td>
                </tr>
              ) : (
                expiredDrugs.map((drug) => {
                  const expiryDate = new Date(drug.expiry_date);
                  const today = new Date();
                  const daysExpired = Math.floor((today - expiryDate) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <tr key={drug.drug_id}>
                      <td>{drug.drug_id}</td>
                      <td><strong>{drug.drug_name}</strong></td>
                      <td>{drug.brand || '-'}</td>
                      <td>{drug.stock_quantity}</td>
                      <td>{drug.unit}</td>
                      <td>
                        <span className="status-badge expired">
                          {expiryDate.toLocaleDateString()}
                        </span>
                      </td>
                      <td>{daysExpired} days</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StockAlerts;
