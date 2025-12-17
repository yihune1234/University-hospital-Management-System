import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function PatientRegistration() {
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    university_id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
    contact: '',
    email: '',
    campus_id: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    address: '',
    blood_group: '',
    allergies: ''
  });

  useEffect(() => {
    loadCampuses();
  }, []);

  const loadCampuses = async () => {
    try {
      const res = await api.get('/admin/campuses');
      setCampuses(res.data || []);
    } catch (error) {
      console.error('Error loading campuses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Prepare data - remove empty fields
      const submitData = { ...formData };
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          submitData[key] = null;
        }
      });

      await api.post('/patients', submitData);
      alert('Patient registered successfully!');
      
      // Reset form
      setFormData({
        university_id: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        gender: '',
        date_of_birth: '',
        contact: '',
        email: '',
        campus_id: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        address: '',
        blood_group: '',
        allergies: ''
      });
    } catch (error) {
      console.error('Error registering patient:', error);
      alert(error.response?.data?.message || 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Patient Registration</h2>
      </div>

      <div className="form-card">
        <h3>Register New Patient</h3>
        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <h4 style={{ marginBottom: '1rem', color: '#0891b2' }}>Personal Information</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>University ID</label>
              <input
                type="text"
                value={formData.university_id}
                onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
                placeholder="e.g., STU12345"
              />
            </div>
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Middle Name</label>
              <input
                type="text"
                value={formData.middle_name}
                onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Blood Group</label>
              <select
                value={formData.blood_group}
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          {/* Contact Information */}
          <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#0891b2' }}>Contact Information</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patient@example.com"
              />
            </div>
            <div className="form-group">
              <label>Campus</label>
              <select
                value={formData.campus_id}
                onChange={(e) => setFormData({ ...formData, campus_id: e.target.value })}
              >
                <option value="">Select Campus</option>
                {campuses.map(campus => (
                  <option key={campus.campus_id} value={campus.campus_id}>
                    {campus.campus_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address..."
                rows="2"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#0891b2' }}>Emergency Contact</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Emergency Contact Name</label>
              <input
                type="text"
                value={formData.emergency_contact_name}
                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div className="form-group">
              <label>Emergency Contact Phone</label>
              <input
                type="tel"
                value={formData.emergency_contact_phone}
                onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
          </div>

          {/* Medical Information */}
          <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#0891b2' }}>Medical Information</h4>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Known Allergies</label>
              <textarea
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="List any known allergies..."
                rows="2"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registering...' : '✅ Register Patient'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => setFormData({
                university_id: '',
                first_name: '',
                middle_name: '',
                last_name: '',
                gender: '',
                date_of_birth: '',
                contact: '',
                email: '',
                campus_id: '',
                emergency_contact_name: '',
                emergency_contact_phone: '',
                address: '',
                blood_group: '',
                allergies: ''
              })}
            >
              🔄 Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PatientRegistration;
