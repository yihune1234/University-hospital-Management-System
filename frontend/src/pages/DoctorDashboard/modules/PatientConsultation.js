import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function PatientConsultation() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const searchPatients = async () => {
    if (!searchTerm) return;
    
    try {
      setLoading(true);
      const res = await api.get(`/patients?search=${searchTerm}`);
      setPatients(res.data || []);
    } catch (error) {
      console.error('Error searching patients:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientDetails = async (patientId) => {
    try {
      const res = await api.get(`/patients/${patientId}`);
      setSelectedPatient(res.data);
    } catch (error) {
      console.error('Error loading patient details:', error);
      alert('Failed to load patient details');
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Patient Consultation</h2>
      </div>

      {/* Patient Search */}
      <div className="form-card">
        <h3>Search Patient</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Search by name, ID, or university ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchPatients()}
            style={{ flex: 1, padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
          />
          <button className="btn btn-primary" onClick={searchPatients}>
            🔍 Search
          </button>
        </div>
      </div>

      {/* Search Results */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Searching...</p>
        </div>
      ) : patients.length > 0 ? (
        <div className="data-table-container" style={{ marginBottom: '2rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>University ID</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.patient_id}>
                  <td>{patient.patient_id}</td>
                  <td><strong>{patient.first_name} {patient.last_name}</strong></td>
                  <td>{patient.university_id || '-'}</td>
                  <td>{patient.gender || '-'}</td>
                  <td>{patient.contact || '-'}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => loadPatientDetails(patient.patient_id)}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Selected Patient Details */}
      {selectedPatient && (
        <div className="form-card">
          <h3>Patient Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <strong>Name:</strong> {selectedPatient.first_name} {selectedPatient.last_name}
            </div>
            <div>
              <strong>University ID:</strong> {selectedPatient.university_id || '-'}
            </div>
            <div>
              <strong>Gender:</strong> {selectedPatient.gender || '-'}
            </div>
            <div>
              <strong>DOB:</strong> {selectedPatient.date_of_birth ? new Date(selectedPatient.date_of_birth).toLocaleDateString() : '-'}
            </div>
            <div>
              <strong>Contact:</strong> {selectedPatient.contact || '-'}
            </div>
            <div>
              <strong>Email:</strong> {selectedPatient.email || '-'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary">📋 View Medical History</button>
            <button className="btn btn-primary">💊 Write Prescription</button>
            <button className="btn btn-primary">🔬 Request Lab Test</button>
            <button className="btn btn-primary">🔄 Create Referral</button>
            <button className="btn btn-primary">📝 Add Medical Record</button>
          </div>
        </div>
      )}

      {!selectedPatient && patients.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Search for a patient</h3>
          <p>Enter patient name, ID, or university ID to begin consultation</p>
        </div>
      )}
    </div>
  );
}

export default PatientConsultation;
