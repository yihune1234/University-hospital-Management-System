import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function Referrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    referred_to: '',
    reason: '',
    urgency: 'Normal',
    notes: ''
  });

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/referrals');
      setReferrals(res.data || []);
    } catch (error) {
      console.error('Error loading referrals:', error);
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/referrals', formData);
      alert('Referral created successfully!');
      setShowForm(false);
      setFormData({
        patient_id: '',
        referred_to: '',
        reason: '',
        urgency: 'Normal',
        notes: ''
      });
      loadReferrals();
    } catch (error) {
      console.error('Error creating referral:', error);
      alert(error.response?.data?.message || 'Failed to create referral');
    }
  };

  if (loading) {
    return (
      <div className="module-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading referrals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Referrals</h2>
        <div className="module-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✖ Cancel' : '➕ New Referral'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="form-card">
          <h3>Create Referral</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Patient ID *</label>
                <input
                  type="number"
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Referred To *</label>
                <input
                  type="text"
                  value={formData.referred_to}
                  onChange={(e) => setFormData({ ...formData, referred_to: e.target.value })}
                  required
                  placeholder="Specialist/Department/Hospital"
                />
              </div>
              <div className="form-group">
                <label>Urgency *</label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  required
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Reason *</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                  placeholder="Reason for referral..."
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Create Referral</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Referrals Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Referred To</th>
              <th>Reason</th>
              <th>Urgency</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {referrals.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <div className="empty-icon">🔄</div>
                    <h3>No referrals found</h3>
                    <p>Click "New Referral" to create one</p>
                  </div>
                </td>
              </tr>
            ) : (
              referrals.map((referral) => (
                <tr key={referral.referral_id}>
                  <td>{referral.referral_id}</td>
                  <td><strong>{referral.patient_name || 'Unknown'}</strong></td>
                  <td>{referral.referred_to}</td>
                  <td>{referral.reason?.substring(0, 50)}{referral.reason?.length > 50 ? '...' : ''}</td>
                  <td>
                    <span className={`status-badge ${referral.urgency?.toLowerCase()}`}>
                      {referral.urgency}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${referral.status?.toLowerCase()}`}>
                      {referral.status || 'Pending'}
                    </span>
                  </td>
                  <td>{referral.referral_date ? new Date(referral.referral_date).toLocaleDateString() : '-'}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon" title="View">👁️</button>
                      <button className="btn-icon" title="Print">🖨️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Referrals;
