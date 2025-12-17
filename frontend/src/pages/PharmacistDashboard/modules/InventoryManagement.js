import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function InventoryManagement() {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDrug, setEditingDrug] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    drug_name: '',
    brand: '',
    batch_number: '',
    stock_quantity: '',
    unit: 'tablets',
    expiry_date: ''
  });

  useEffect(() => {
    loadDrugs();
  }, []);

  const loadDrugs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pharmacy/drugs');
      setDrugs(res.data || []);
    } catch (error) {
      console.error('Error loading drugs:', error);
      setDrugs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadDrugs();
      return;
    }

    try {
      const res = await api.get(`/pharmacy/drugs/search?search=${searchTerm}`);
      setDrugs(res.data || []);
    } catch (error) {
      console.error('Error searching drugs:', error);
    }
  };

  const handleEdit = (drug) => {
    setEditingDrug(drug);
    setFormData({
      drug_name: drug.drug_name,
      brand: drug.brand || '',
      batch_number: drug.batch_number || '',
      stock_quantity: drug.stock_quantity,
      unit: drug.unit || 'tablets',
      expiry_date: drug.expiry_date ? drug.expiry_date.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingDrug) {
        await api.put(`/pharmacy/drugs/${editingDrug.drug_id}`, formData);
        alert('Drug updated successfully!');
      } else {
        await api.post('/pharmacy/drugs', formData);
        alert('Drug added successfully!');
      }

      setShowForm(false);
      setEditingDrug(null);
      setFormData({
        drug_name: '',
        brand: '',
        batch_number: '',
        stock_quantity: '',
        unit: 'tablets',
        expiry_date: ''
      });
      loadDrugs();
    } catch (error) {
      console.error('Error saving drug:', error);
      alert(error.response?.data?.message || 'Failed to save drug');
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
      loadDrugs();
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
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Inventory Management</h2>
        <div className="module-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✖ Cancel' : '➕ Add Drug'}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search drugs by name or brand..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          🔍 Search
        </button>
        <button className="btn btn-secondary" onClick={() => { setSearchTerm(''); loadDrugs(); }}>
          Show All
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="form-card">
          <h3>{editingDrug ? 'Edit Drug' : 'Add New Drug'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Drug Name *</label>
                <input
                  type="text"
                  value={formData.drug_name}
                  onChange={(e) => setFormData({ ...formData, drug_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Batch Number</label>
                <input
                  type="text"
                  value={formData.batch_number}
                  onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  required
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Unit *</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                >
                  <option value="tablets">Tablets</option>
                  <option value="capsules">Capsules</option>
                  <option value="ml">ML</option>
                  <option value="mg">MG</option>
                  <option value="bottles">Bottles</option>
                  <option value="boxes">Boxes</option>
                </select>
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingDrug ? 'Update Drug' : 'Add Drug'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => {
                setShowForm(false);
                setEditingDrug(null);
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Drugs Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Drug Name</th>
              <th>Brand</th>
              <th>Batch</th>
              <th>Stock</th>
              <th>Unit</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drugs.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3>No drugs found</h3>
                    <p>Click "Add Drug" to add inventory</p>
                  </div>
                </td>
              </tr>
            ) : (
              drugs.map((drug) => {
                const isLowStock = drug.stock_quantity <= 10;
                const isExpired = drug.expiry_date && new Date(drug.expiry_date) < new Date();
                
                return (
                  <tr key={drug.drug_id}>
                    <td>{drug.drug_id}</td>
                    <td><strong>{drug.drug_name}</strong></td>
                    <td>{drug.brand || '-'}</td>
                    <td>{drug.batch_number || '-'}</td>
                    <td>{drug.stock_quantity}</td>
                    <td>{drug.unit}</td>
                    <td>{drug.expiry_date ? new Date(drug.expiry_date).toLocaleDateString() : '-'}</td>
                    <td>
                      {isExpired ? (
                        <span className="status-badge expired">Expired</span>
                      ) : isLowStock ? (
                        <span className="status-badge low-stock">Low Stock</span>
                      ) : (
                        <span className="status-badge in-stock">In Stock</span>
                      )}
                    </td>
                    <td>
                      <div className="action-btns">
                        <button 
                          className="btn-icon" 
                          title="Edit"
                          onClick={() => handleEdit(drug)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-icon" 
                          title="Update Stock"
                          onClick={() => handleUpdateStock(drug.drug_id, drug.stock_quantity)}
                        >
                          📦
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryManagement;
