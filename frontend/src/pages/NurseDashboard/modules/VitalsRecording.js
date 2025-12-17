import { useState, useEffect, useContext } from 'react';
import api from '../../../utils/api';
import { AuthContext } from '../../../context/AuthContext';
import './ModuleStyles.css';

function VitalsRecording() {
  const { user } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    temperature: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    heart_rate: '',
    respiratory_rate: '',
    oxygen_saturation: '',
    weight: '',
    height: '',
    notes: '',
    recorded_by: user?.staff_id || ''
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patients');
      setPatients(res.data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setShowForm(true);
    setFormData({
      patient_id: patient.patient_id,
      temperature: '',
      blood_pressure_systolic: '',
      blood_pressure_diastolic: '',
      heart_rate: '',
      respiratory_rate: '',
      oxygen_saturation: '',
      weight: '',
      height: '',
      notes: '',
      recorded_by: user?.staff_id || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create medical record with vitals
      const recordData = {
        patient_id: formData.patient_id,
        staff_id: formData.recorded_by,
        visit_type: 'Vitals Check',
        chief_complaint: 'Routine vitals recording',
        vital_signs: JSON.stringify({
          temperature: formData.temperature,
          blood_pressure: `${formData.blood_pressure_systolic}/${formData.blood_pressure_diastolic}`,
          heart_rate: formData.heart_rate,
          respiratory_rate: formData.respiratory_rate,
          oxygen_saturation: formData.oxygen_saturation,
          weight: formData.weight,
          height: formData.height
        }),
        notes: formData.notes
      };

      await api.post('/medical-records', recordData);
      alert('Vitals recorded successfully!');
      
      setShowForm(false);
      setSelectedPatient(null);
      setFormData({
        patient_id: '',
        temperature: '',
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        heart_rate: '',
        respiratory_rate: '',
        oxygen_saturation: '',
        weight: '',
        height: '',
        notes: '',
        recorded_by: user?.staff_id || ''
      });
    } catch (error) {
      console.error('Error recording vitals:', error);
      alert(error.response?.data?.message || 'Failed to record vitals');
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
        <h2 className="module-title">Record Vitals</h2>
        <button className="btn btn-primary" onClick={loadPatients}>
          🔄 Refresh
        </button>
      </div>

      {/* Vitals Form */}
      {showForm && selectedPatient && (
        <div className="form-card">
          <div className="form-header">
            <h3>Record Vitals for {selectedPatient.first_name} {selectedPatient.last_name}</h3>
            <button className="btn-close" onClick={() => setShowForm(false)}>✖</button>
          </div>
          
          <div className="info-grid">
            <div className="info-item">
              <label>Patient ID:</label>
              <span>{selectedPatient.patient_id}</span>
            </div>
            <div className="info-item">
              <label>Age:</label>
              <span>{selectedPatient.date_of_birth ? 
                Math.floor((new Date() - new Date(selectedPatient.date_of_birth)) / 31557600000) : '-'} years
              </span>
            </div>
            <div className="info-item">
              <label>Gender:</label>
              <span>{selectedPatient.gender}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Temperature (°C) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  required
                  placeholder="36.5"
                />
              </div>

              <div className="form-group">
                <label>Blood Pressure (Systolic) *</label>
                <input
                  type="number"
                  value={formData.blood_pressure_systolic}
                  onChange={(e) => setFormData({ ...formData, blood_pressure_systolic: e.target.value })}
                  required
                  placeholder="120"
                />
              </div>

              <div className="form-group">
                <label>Blood Pressure (Diastolic) *</label>
                <input
                  type="number"
                  value={formData.blood_pressure_diastolic}
                  onChange={(e) => setFormData({ ...formData, blood_pressure_diastolic: e.target.value })}
                  required
                  placeholder="80"
                />
              </div>

              <div className="form-group">
                <label>Heart Rate (bpm) *</label>
                <input
                  type="number"
                  value={formData.heart_rate}
                  onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
                  required
                  placeholder="72"
                />
              </div>

              <div className="form-group">
                <label>Respiratory Rate (breaths/min) *</label>
                <input
                  type="number"
                  value={formData.respiratory_rate}
                  onChange={(e) => setFormData({ ...formData, respiratory_rate: e.target.value })}
                  required
                  placeholder="16"
                />
              </div>

              <div className="form-group">
                <label>Oxygen Saturation (%) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.oxygen_saturation}
                  onChange={(e) => setFormData({ ...formData, oxygen_saturation: e.target.value })}
                  required
                  placeholder="98"
                />
              </div>

              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="70"
                />
              </div>

              <div className="form-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="170"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional observations..."
                  rows="3"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                ✅ Record Vitals
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Patients Table */}
      {!showForm && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="empty-state">
                      <div className="empty-icon">👥</div>
                      <h3>No patients found</h3>
                      <p>Patients will appear here</p>
                    </div>
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.patient_id}>
                    <td>{patient.patient_id}</td>
                    <td>
                      <strong>
                        {patient.first_name} {patient.middle_name ? patient.middle_name + ' ' : ''}{patient.last_name}
                      </strong>
                    </td>
                    <td>
                      {patient.date_of_birth ? 
                        Math.floor((new Date() - new Date(patient.date_of_birth)) / 31557600000) : '-'}
                    </td>
                    <td>{patient.gender}</td>
                    <td>{patient.phone_number || '-'}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-primary" 
                        onClick={() => handleSelectPatient(patient)}
                      >
                        📝 Record Vitals
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default VitalsRecording;
