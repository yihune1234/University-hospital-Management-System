import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function BillingManagement() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'Cash',
    payment_reference: ''
  });

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bills');
      setBills(res.data || []);
    } catch (error) {
      console.error('Error loading bills:', error);
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/bills?search=${searchTerm}`);
      setBills(res.data || []);
    } catch (error) {
      console.error('Error searching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewBillDetails = async (billId) => {
    try {
      const res = await api.get(`/bills/${billId}`);
      setSelectedBill(res.data);
    } catch (error) {
      console.error('Error loading bill details:', error);
      alert('Failed to load bill details');
    }
  };

  const openPaymentModal = (bill) => {
    setSelectedBill(bill);
    setPaymentForm({
      amount: (bill.total_amount - (bill.total_paid || 0)).toString(),
      payment_method: 'Cash',
      payment_reference: ''
    });
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    try {
      await api.post(`/bills/${selectedBill.bill_id}/payments`, {
        amount: parseFloat(paymentForm.amount),
        payment_method: paymentForm.payment_method,
        payment_reference: paymentForm.payment_reference
      });

      alert('✅ Payment processed successfully!');
      setShowPaymentModal(false);
      loadBills();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert(error.response?.data?.message || 'Failed to process payment');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid': return { bg: '#d1fae5', color: '#065f46' };
      case 'Partial': return { bg: '#fef3c7', color: '#92400e' };
      case 'Unpaid': return { bg: '#fee2e2', color: '#991b1b' };
      case 'Cancelled': return { bg: '#f3f4f6', color: '#374151' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Billing & Payment Management</h2>
        <div className="module-actions">
          <button className="btn btn-primary" onClick={loadBills}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="filter-card">
        <div className="filter-grid" style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Search by patient name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1, padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
          <button className="btn btn-primary" onClick={handleSearch}>
            🔍 Search
          </button>
        </div>
      </div>

      {/* Bills Table */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading bills...</p>
        </div>
      ) : bills.length > 0 ? (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Patient Name</th>
                <th>Total Amount</th>
                <th>Total Paid</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.bill_id}>
                  <td>{bill.bill_id}</td>
                  <td><strong>{bill.patient_name}</strong></td>
                  <td>${parseFloat(bill.total_amount).toFixed(2)}</td>
                  <td>${parseFloat(bill.total_paid || 0).toFixed(2)}</td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ 
                        background: getStatusStyle(bill.status).bg, 
                        color: getStatusStyle(bill.status).color 
                      }}
                    >
                      {bill.status}
                    </span>
                  </td>
                  <td>{new Date(bill.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="btn-icon"
                        onClick={() => viewBillDetails(bill.bill_id)}
                        title="View Details"
                      >
                        👁️
                      </button>
                      {bill.status !== 'Paid' && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => openPaymentModal(bill)}
                          title="Process Payment"
                        >
                          💳 Pay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">💸</div>
          <h3>No bills found</h3>
          <p>There are no bills matching your search criteria.</p>
        </div>
      )}

      {/* Bill Details Modal */}
      {selectedBill && !showPaymentModal && (
        <div className="modal-overlay" onClick={() => setSelectedBill(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Bill Details #{selectedBill.bill_id}</h3>
            <div className="details-grid">
              <div><strong>Patient:</strong> {selectedBill.patient_name}</div>
              <div><strong>University ID:</strong> {selectedBill.university_id || 'N/A'}</div>
              <div><strong>Total Amount:</strong> ${parseFloat(selectedBill.total_amount).toFixed(2)}</div>
              <div><strong>Status:</strong> {selectedBill.status}</div>
              <div><strong>Created At:</strong> {new Date(selectedBill.created_at).toLocaleString()}</div>
              <div><strong>Due Date:</strong> {selectedBill.due_date ? new Date(selectedBill.due_date).toLocaleDateString() : 'N/A'}</div>
            </div>
            
            <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Payment History</h4>
            {selectedBill.payments && selectedBill.payments.length > 0 ? (
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.payments.map(p => (
                    <tr key={p.payment_id}>
                      <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                      <td>${parseFloat(p.amount).toFixed(2)}</td>
                      <td>{p.payment_method}</td>
                      <td>{p.payment_reference || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No payments recorded yet.</p>
            )}

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedBill(null)}>
                Close
              </button>
              {selectedBill.status !== 'Paid' && (
                <button 
                  className="btn btn-primary"
                  onClick={() => openPaymentModal(selectedBill)}
                >
                  💳 Process Payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedBill && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Process Payment</h3>
            <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <strong>Patient:</strong> {selectedBill.patient_name}<br />
              <strong>Bill ID:</strong> {selectedBill.bill_id}<br />
              <strong>Remaining:</strong> ${ (selectedBill.total_amount - (selectedBill.total_paid || 0)).toFixed(2) }
            </div>

            <div className="form-group">
              <label>Payment Amount</label>
              <input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <select
                value={paymentForm.payment_method}
                onChange={(e) => setPaymentForm({...paymentForm, payment_method: e.target.value})}
                className="form-control"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Mobile Money">Mobile Money</option>
              </select>
            </div>

            <div className="form-group">
              <label>Reference # (Optional)</label>
              <input
                type="text"
                value={paymentForm.payment_reference}
                onChange={(e) => setPaymentForm({...paymentForm, payment_reference: e.target.value})}
                className="form-control"
                placeholder="Transaction ID, Receipt #, etc."
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleProcessPayment}>
                ✅ Complete Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillingManagement;
