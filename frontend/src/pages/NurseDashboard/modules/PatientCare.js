import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function PatientCare() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadPatients();
      return;
    }

    try {
      const res = await api.get(`/patients/search?search=${searchTerm}`);
      setPatients(res.data || []);
    } catch (error) {
      console.error('Error searching patients:', error);
    }
  };

  const handleViewPatient = async (patient) => {
    try {
      setSelectedPatient(patient);
      const [detailsRes, historyRes] = await Promise.all([
        api.get(`/patients/${patient.patient_id}`),
        api.get(`/patients/${patient.patient_id}/medical-history`).catch(() => ({ data: [] }))
      ]);
      
      setPatientDetails({
        ...detailsRes.data,
        medicalHistory: historyRes.data || []
      });
    } catch (error) {
      console.error('Error loading patient details:', error);
      alert('Failed to load patient details');
    }
  };

  const handleCloseDetails = () => {
    setSelectedPatient(null);
    setPatientDetails(null);
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
        <h2 className="module-title">Patient Care</h2>
        <button className="btn btn-primary" onClick={loadPatients}>
          🔄 Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search patients by name, ID, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          🔍 Search
        </button>
        <button className="btn btn-secondary" onClick={() => { setSearchTerm(''); loadPatients(); }}>
          Show All
        </button>
      </div>

      {/* Patient Details View */}
      {patientDetails && (
        <div className="patient-care-details">
          <div className="details-header">
            <h3>Patient Care Plan - {patientDetails.first_name} {patientDetails.last_name}</h3>
            <button className="btn-close" onClick={handleCloseDetails}>✖</button>
          </div>

          <div className="care-sections">
            {/* Patient Info */}
            <div className="care-section">
              <h4>Patient Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>Patient ID:</label>
                  <span>{patientDetails.patient_id}</span>
                </div>
                <div className="info-item">
                  <label>Name:</label>
                  <span><strong>{patientDetails.first_name} {patientDetails.middle_name} {patientDetails.last_name}</strong></span>
                </div>
                <div className="info-item">
                  <label>Date of Birth:</label>
                  <span>{patientDetails.date_of_birth ? new Date(patientDetails.date_of_birth).toLocaleDateString() : '-'}</span>
                </div>
                <div className="info-item">
                  <label>Gender:</label>
                  <span>{patientDetails.gender}</span>
                </div>
                <div className="info-item">
                  <label>Blood Type:</label>
                  <span>{patientDetails.blood_type || '-'}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{patientDetails.phone_number}</span>
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="care-section">
              <h4>Medical History</h4>
              {patientDetails.medicalHistory && patientDetails.medicalHistory.length > 0 ? (
                <div className="history-list">
                  {patientDetails.medicalHistory.map((record, index) => (
                    <div key={index} className="history-item">
                      <div className="history-date">
                        {record.visit_date ? new Date(record.visit_date).toLocaleDateString() : '-'}
                      </div>
                      <div className="history-content">
                        <strong>{record.diagnosis || 'No diagnosis'}</strong>
                        {record.symptoms && <p>Symptoms: {record.symptoms}</p>}
                        {record.treatment && <p>Treatment: {record.treatment}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">No medical history available</p>
              )}
            </div>

            {/* Allergies & Conditions */}
            <div className="care-section">
              <h4>Allergies & Chronic Conditions</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>Allergies:</label>
                  <span>{patientDetails.allergies || 'None reported'}</span>
                </div>
                <div className="info-item">
                  <label>Chronic Conditions:</label>
                  <span>{patientDetails.chronic_conditions || 'None reported'}</span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="care-section">
              <h4>Emergency Contact</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>Contact Name:</label>
                  <span>{patientDetails.emergency_contact_name || '-'}</span>
                </div>
                <div className="info-item">
                  <label>Contact Phone:</label>
                  <span>{patientDetails.emergency_contact_phone || '-'}</span>
                </div>
                <div className="info-item">
                  <label>Relationship:</label>
                  <span>{patientDetails.emergency_contact_relationship || '-'}</span>
                </div>
              </div>
            </div>

            {/* Care Notes */}
            <div className="care-section">
              <h4>Nursing Care Notes</h4>
              <textarea
                placeholder="Add care notes, observations, or special instructions..."
                rows="4"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
              />
              <button className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                💾 Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patients Table */}
      {!patientDetails && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Age</th>
                <th>Blood Type</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="empty-state">
                      <div className="empty-icon">❤️</div>
                      <h3>No patients found</h3>
                      <p>Patients will appear here</p>
                    </div>
                  </td>
                </tr>
              ) : (
                patients.map((patient) => {
                  const age = patient.date_of_birth 
                    ? Math.floor((new Date() - new Date(patient.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000))
                    : '-';
                  
                  return (
                    <tr key={patient.patient_id}>
                      <td>{patient.patient_id}</td>
                      <td><strong>{patient.first_name} {patient.last_name}</strong></td>
                      <td>{patient.gender}</td>
                      <td>{age}</td>
                      <td>{patient.blood_type || '-'}</td>
                      <td>{patient.phone_number}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-primary" 
                          onClick={() => handleViewPatient(patient)}
                        >
                          ❤️ View Care
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PatientCare;
