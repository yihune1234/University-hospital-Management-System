import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function AppointmentScheduling() {
  const [clinics, setClinics] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    clinic_id: '',
    staff_id: '',
    appointment_time: '',
    reason: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const campusesRes = await api.get('/admin/campuses').catch(() => ({ data: [] }));
      const allClinics = [];
      
      for (const campus of campusesRes.data || []) {
        try {
          const clinicsRes = await api.get(`/admin/campuses/${campus.campus_id}/clinics`);
          allClinics.push(...(clinicsRes.data || []).map(c => ({ 
            ...c, 
            campus_name: campus.campus_name 
          })));
        } catch (err) {
          console.error(`Error loading clinics for campus ${campus.campus_id}:`, err);
        }
      }
      
      setClinics(allClinics);
      
      // Load staff (doctors)
      const staffRes = await api.get('/admin/staff').catch(() => ({ data: [] }));
      setStaff((staffRes.data || []).filter(s => s.role_id === 3)); // Only doctors
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const submitData = { ...formData };
      if (!submitData.staff_id) submitData.staff_id = null;
      if (!submitData.reason) submitData.reason = null;

      await api.post('/appointments', submitData);
      alert('Appointment scheduled successfully!');
      
      setFormData({
        patient_id: '',
        clinic_id: '',
        staff_id: '',
        appointment_time: '',
        reason: ''
      });
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert(error.response?.data?.message || 'Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Schedule Appointment</h2>
      </div>

      <div className="form-card">
        <h3>New Appointment</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Patient ID *</label>
              <input
                type="number"
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                required
                placeholder="Enter patient ID"
              />
            </div>
            <div className="form-group">
              <label>Clinic *</label>
              <select
                value={formData.clinic_id}
                onChange={(e) => setFormData({ ...formData, clinic_id: e.target.value })}
                required
              >
                <option value="">Select Clinic</option>
                {clinics.map(clinic => (
                  <option key={clinic.clinic_id} value={clinic.clinic_id}>
                    {clinic.clinic_name} ({clinic.campus_name})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Doctor (Optional)</label>
              <select
                value={formData.staff_id}
                onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
              >
                <option value="">Any Available Doctor</option>
                {staff.map(doctor => (
                  <option key={doctor.staff_id} value={doctor.staff_id}>
                    Dr. {doctor.first_name} {doctor.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Appointment Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.appointment_time}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                required
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Reason for Visit</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Brief description of the reason for visit..."
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Scheduling...' : '📅 Schedule Appointment'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setFormData({
                patient_id: '',
                clinic_id: '',
                staff_id: '',
                appointment_time: '',
                reason: ''
              })}
            >
              🔄 Clear
            </button>
          </div>
        </form>
      </div>

      {/* Quick Tips */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#eff6ff', borderRadius: '0.5rem', border: '1px solid #bfdbfe' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>💡 Quick Tips</h4>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#1e40af' }}>
          <li>Make sure the patient is registered before scheduling</li>
          <li>Check clinic availability before booking</li>
          <li>If no specific doctor is selected, any available doctor will be assigned</li>
          <li>Appointment time should be during clinic hours</li>
        </ul>
      </div>
    </div>
  );
}

export default AppointmentScheduling;
