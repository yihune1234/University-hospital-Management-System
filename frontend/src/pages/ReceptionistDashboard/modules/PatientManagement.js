import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ModuleStyles.css';

function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [queuePatient, setQueuePatient] = useState(null);
  const [schedulePatient, setSchedulePatient] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [queueForm, setQueueForm] = useState({
    clinicId: '',
    doctorId: '',
    roomId: '',
    reason: '',
    appointmentTime: ''
  });
  const [scheduleForm, setScheduleForm] = useState({
    clinicId: '',
    doctorId: '',
    roomId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: ''
  });

  useEffect(() => {
    loadAllPatients();
    loadClinics();
  }, []);

  useEffect(() => {
    if (queueForm.clinicId) {
      loadScheduledStaff(queueForm.clinicId);
      loadRooms(queueForm.clinicId);
    }
  }, [queueForm.clinicId]);

  useEffect(() => {
    if (scheduleForm.clinicId) {
      loadScheduledStaff(scheduleForm.clinicId, scheduleForm.appointmentDate);
      loadRooms(scheduleForm.clinicId);
    }
  }, [scheduleForm.clinicId, scheduleForm.appointmentDate]);

  const loadAllPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patients');
      setAllPatients(res.data || []);
      setPatients(res.data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
      setAllPatients([]);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const searchPatients = async () => {
    if (!searchTerm.trim()) {
      setPatients(allPatients);
      return;
    }

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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value.trim()) {
      setPatients(allPatients);
    }
  };

  const viewPatientDetails = async (patientId) => {
    try {
      const res = await api.get(`/patients/${patientId}`);
      setSelectedPatient(res.data);
    } catch (error) {
      console.error('Error loading patient details:', error);
      alert('Failed to load patient details');
    }
  };

  const loadClinics = async () => {
    try {
      const res = await api.get('/admin/campuses');
      const allClinics = [];
      
      for (const campus of res.data || []) {
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
      
      setClinics(allClinics.filter(c => c.status === 'Active'));
    } catch (error) {
      console.error('Error loading clinics:', error);
    }
  };

  // Load doctors/nurses scheduled for today at selected clinic
  const loadScheduledStaff = async (clinicId, date = new Date().toISOString().split('T')[0]) => {
    try {
      const res = await api.get(`/admin/staff-schedules?clinic_id=${clinicId}&shift_date=${date}`);
      const scheduledStaff = res.data || [];
      
      // Get unique staff IDs from schedules
      const staffIds = [...new Set(scheduledStaff.map(s => s.staff_id))];
      
      // Load full staff details
      const staffRes = await api.get('/admin/staff');
      const allStaff = staffRes.data || [];
      
      // Filter to only scheduled staff who are doctors or nurses
      const availableStaff = allStaff.filter(s => 
        staffIds.includes(s.staff_id) && 
        (s.role_name === 'Doctor' || s.role_name === 'Nurse') &&
        s.is_active === 1
      );
      
      setDoctors(availableStaff);
    } catch (error) {
      console.error('Error loading scheduled staff:', error);
      // Fallback: load all active doctors/nurses
      try {
        const res = await api.get('/admin/staff');
        const staffList = (res.data || []).filter(s => 
          (s.role_name === 'Doctor' || s.role_name === 'Nurse') && s.is_active === 1
        );
        setDoctors(staffList);
      } catch (err) {
        console.error('Error loading fallback staff:', err);
      }
    }
  };

  // Load available rooms for selected clinic
  const loadRooms = async (clinicId) => {
    try {
      const res = await api.get(`/admin/rooms?clinicId=${clinicId}`);
      const allRooms = res.data || [];
      
      // Filter active rooms
      const activeRooms = allRooms.filter(r => r.status === 'Active');
      
      // TODO: Check room availability (not currently occupied)
      // For now, show all active rooms
      setRooms(activeRooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
      setRooms([]);
    }
  };

  // Load patient's scheduled appointments
  const loadPatientAppointments = async (patientId) => {
    try {
      const res = await api.get(`/appointments?patient_id=${patientId}&status=Scheduled`);
      setPatientAppointments(res.data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setPatientAppointments([]);
    }
  };

  // Open schedule modal (create new appointment)
  const openScheduleModal = (patient) => {
    setSchedulePatient(patient);
    setShowScheduleModal(true);
    setScheduleForm({
      clinicId: clinics.length > 0 ? clinics[0].clinic_id : '',
      doctorId: '',
      roomId: '',
      appointmentDate: '',
      appointmentTime: '',
      reason: ''
    });
  };

  // Create scheduled appointment
  const handleCreateSchedule = async () => {
    if (!scheduleForm.clinicId || !scheduleForm.doctorId || !scheduleForm.appointmentDate) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const appointmentData = {
        patient_id: schedulePatient.patient_id, // Auto-filled
        clinic_id: scheduleForm.clinicId,
        doctor_id: scheduleForm.doctorId,
        room_id: scheduleForm.roomId || null,
        appointment_date: scheduleForm.appointmentDate,
        appointment_time: scheduleForm.appointmentTime,
        reason: scheduleForm.reason || 'Scheduled consultation',
        status: 'Scheduled'
      };

      await api.post('/appointments', appointmentData);
      alert(`✅ Appointment scheduled for ${schedulePatient.first_name} ${schedulePatient.last_name}!`);
      setShowScheduleModal(false);
      setSchedulePatient(null);
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert(error.response?.data?.message || 'Failed to create schedule');
    }
  };

  // Open queue modal - show patient's scheduled appointments
  const openQueueModal = async (patient) => {
    setQueuePatient(patient);
    await loadPatientAppointments(patient.patient_id);
    setShowQueueModal(true);
  };

  // Add existing scheduled appointment to queue
  const handleAddScheduledToQueue = async (appointment) => {
    try {
      // Add appointment to queue
      await api.post('/queue', { appointmentId: appointment.appointment_id });

      alert(`✅ ${queuePatient.first_name} ${queuePatient.last_name} added to queue!`);
      setShowQueueModal(false);
      setQueuePatient(null);
      setPatientAppointments([]);
    } catch (error) {
      console.error('Error adding to queue:', error);
      alert(error.response?.data?.message || 'Failed to add to queue');
    }
  };

  // Quick add to queue (walk-in without appointment)
  const handleQuickAddToQueue = async () => {
    if (!queueForm.clinicId || !queueForm.doctorId) {
      alert('Please select clinic and doctor');
      return;
    }

    try {
      // Create walk-in appointment
      const appointmentData = {
        patient_id: queuePatient.patient_id, // Auto-filled
        clinic_id: queueForm.clinicId,
        doctor_id: queueForm.doctorId,
        room_id: queueForm.roomId || null,
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: queueForm.appointmentTime || new Date().toTimeString().slice(0, 5),
        reason: queueForm.reason || 'Walk-in consultation',
        status: 'Scheduled'
      };

      const appointmentRes = await api.post('/appointments', appointmentData);

      // Add to queue
      await api.post('/queue', { appointmentId: appointmentRes.data.appointment_id });

      alert(`✅ ${queuePatient.first_name} ${queuePatient.last_name} added to queue!`);
      setShowQueueModal(false);
      setQueuePatient(null);
      setPatientAppointments([]);
    } catch (error) {
      console.error('Error adding to queue:', error);
      alert(error.response?.data?.message || 'Failed to add to queue');
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Patient Management</h2>
      </div>

      {/* Search Bar at Top */}
      <div className="filters-section" style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="🔍 Search by name, ID, university ID, or contact..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={(e) => e.key === 'Enter' && searchPatients()}
          style={{ flex: 1, minWidth: '300px', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
        />
        <button className="btn btn-primary" onClick={searchPatients} disabled={loading}>
          {loading ? '🔄 Searching...' : '🔍 Search'}
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={() => {
            setSearchTerm('');
            setPatients(allPatients);
          }}
          disabled={loading}
        >
          🔄 Show All
        </button>
      </div>

      {/* Patients Table */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading patients...</p>
        </div>
      ) : patients.length > 0 ? (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>University ID</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.patient_id}>
                  <td>{patient.patient_id}</td>
                  <td>{patient.university_id || '-'}</td>
                  <td><strong>{patient.first_name} {patient.middle_name} {patient.last_name}</strong></td>
                  <td>{patient.gender || '-'}</td>
                  <td>{patient.contact || '-'}</td>
                  <td>{patient.email || '-'}</td>
                  <td>
                    <div className="action-btns" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        className="btn-icon"
                        onClick={() => viewPatientDetails(patient.patient_id)}
                        title="View Details"
                      >
                        👁️
                      </button>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => openScheduleModal(patient)}
                        title="Schedule Appointment"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                      >
                        📅 Schedule
                      </button>
                      <button 
                        className="btn btn-sm btn-success"
                        onClick={() => openQueueModal(patient)}
                        title="Add to Queue"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                      >
                        ➕ Add to Queue
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No patients found</h3>
          <p>{searchTerm ? 'No patients match your search criteria' : 'No patients registered in the system'}</p>
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Patient Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <strong>Patient ID:</strong> {selectedPatient.patient_id}
              </div>
              <div>
                <strong>University ID:</strong> {selectedPatient.university_id || '-'}
              </div>
              <div>
                <strong>Name:</strong> {selectedPatient.first_name} {selectedPatient.middle_name} {selectedPatient.last_name}
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
              <div>
                <strong>Campus:</strong> {selectedPatient.campus_name || '-'}
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedPatient(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Queue Modal - Shows Scheduled Appointments */}
      {showQueueModal && queuePatient && (
        <div className="modal-overlay" onClick={() => { setShowQueueModal(false); setPatientAppointments([]); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <h3>➕ Add Patient to Queue</h3>
            
            <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <strong>Patient:</strong> {queuePatient.first_name} {queuePatient.last_name}
              <br />
              <strong>ID:</strong> {queuePatient.patient_id} | <strong>Contact:</strong> {queuePatient.contact || 'N/A'}
            </div>

            {/* Show Scheduled Appointments */}
            {patientAppointments.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>📅 Scheduled Appointments</h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                  {patientAppointments.map((apt) => (
                    <div 
                      key={apt.appointment_id} 
                      style={{ 
                        padding: '1rem', 
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div><strong>Date:</strong> {new Date(apt.appointment_date).toLocaleDateString()}</div>
                        <div><strong>Time:</strong> {apt.appointment_time}</div>
                        <div><strong>Doctor:</strong> Dr. {apt.doctor_name || 'N/A'}</div>
                        <div><strong>Clinic:</strong> {apt.clinic_name || 'N/A'}</div>
                      </div>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleAddScheduledToQueue(apt)}
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        ➕ Add to Queue
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Walk-in Option */}
            <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>🚶 Walk-in (No Appointment)</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label><strong>Select Clinic *</strong></label>
                  <select
                    value={queueForm.clinicId}
                    onChange={(e) => setQueueForm({...queueForm, clinicId: e.target.value, roomId: ''})}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                  >
                    <option value="">-- Select Clinic --</option>
                    {clinics.map(clinic => (
                      <option key={clinic.clinic_id} value={clinic.clinic_id}>
                        {clinic.clinic_name} ({clinic.campus_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label><strong>Select Doctor/Nurse * (Scheduled Today)</strong></label>
                  <select
                    value={queueForm.doctorId}
                    onChange={(e) => setQueueForm({...queueForm, doctorId: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                  >
                    <option value="">-- Select Staff --</option>
                    {doctors.map(staff => (
                      <option key={staff.staff_id} value={staff.staff_id}>
                        {staff.role_name === 'Doctor' ? 'Dr.' : ''} {staff.first_name} {staff.last_name} ({staff.role_name})
                      </option>
                    ))}
                  </select>
                  {doctors.length === 0 && (
                    <small style={{ color: '#f59e0b', marginTop: '0.25rem', display: 'block' }}>
                      No staff scheduled for this clinic today
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label><strong>Select Room (Optional - Available Rooms)</strong></label>
                  <select
                    value={queueForm.roomId}
                    onChange={(e) => setQueueForm({...queueForm, roomId: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                    disabled={!queueForm.clinicId}
                  >
                    <option value="">-- Select Room --</option>
                    {rooms.map(room => (
                      <option key={room.room_id} value={room.room_id}>
                        {room.room_name} - {room.room_type}
                      </option>
                    ))}
                  </select>
                  {!queueForm.clinicId && (
                    <small style={{ color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
                      Select a clinic first
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label><strong>Reason for Visit</strong></label>
                  <textarea
                    value={queueForm.reason}
                    onChange={(e) => setQueueForm({...queueForm, reason: e.target.value})}
                    placeholder="Enter reason for visit..."
                    rows="2"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowQueueModal(false);
                  setQueuePatient(null);
                  setPatientAppointments([]);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-success" 
                onClick={handleQuickAddToQueue}
                disabled={!queueForm.clinicId || !queueForm.doctorId}
              >
                ✅ Add Walk-in to Queue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Appointment Modal */}
      {showScheduleModal && schedulePatient && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h3>📅 Schedule Appointment</h3>
            
            <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <strong>Patient:</strong> {schedulePatient.first_name} {schedulePatient.last_name}
              <br />
              <strong>ID:</strong> {schedulePatient.patient_id} | <strong>Contact:</strong> {schedulePatient.contact || 'N/A'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label><strong>Select Clinic *</strong></label>
                <select
                  value={scheduleForm.clinicId}
                  onChange={(e) => setScheduleForm({...scheduleForm, clinicId: e.target.value, roomId: ''})}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                  required
                >
                  <option value="">-- Select Clinic --</option>
                  {clinics.map(clinic => (
                    <option key={clinic.clinic_id} value={clinic.clinic_id}>
                      {clinic.clinic_name} ({clinic.campus_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label><strong>Select Doctor/Nurse * (Scheduled for Selected Date)</strong></label>
                <select
                  value={scheduleForm.doctorId}
                  onChange={(e) => setScheduleForm({...scheduleForm, doctorId: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                  required
                >
                  <option value="">-- Select Staff --</option>
                  {doctors.map(staff => (
                    <option key={staff.staff_id} value={staff.staff_id}>
                      {staff.role_name === 'Doctor' ? 'Dr.' : ''} {staff.first_name} {staff.last_name} ({staff.role_name})
                    </option>
                  ))}
                </select>
                {doctors.length === 0 && scheduleForm.appointmentDate && (
                  <small style={{ color: '#f59e0b', marginTop: '0.25rem', display: 'block' }}>
                    No staff scheduled for this clinic on selected date
                  </small>
                )}
              </div>

              <div className="form-group">
                <label><strong>Select Room (Optional - Available Rooms)</strong></label>
                <select
                  value={scheduleForm.roomId}
                  onChange={(e) => setScheduleForm({...scheduleForm, roomId: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                  disabled={!scheduleForm.clinicId}
                >
                  <option value="">-- Select Room --</option>
                  {rooms.map(room => (
                    <option key={room.room_id} value={room.room_id}>
                      {room.room_name} - {room.room_type}
                    </option>
                  ))}
                </select>
                {!scheduleForm.clinicId && (
                  <small style={{ color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
                    Select a clinic first
                  </small>
                )}
              </div>

              <div className="form-group">
                <label><strong>Appointment Date *</strong></label>
                <input
                  type="date"
                  value={scheduleForm.appointmentDate}
                  onChange={(e) => setScheduleForm({...scheduleForm, appointmentDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                  required
                />
              </div>

              <div className="form-group">
                <label><strong>Appointment Time *</strong></label>
                <input
                  type="time"
                  value={scheduleForm.appointmentTime}
                  onChange={(e) => setScheduleForm({...scheduleForm, appointmentTime: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                  required
                />
              </div>

              <div className="form-group">
                <label><strong>Reason for Visit</strong></label>
                <textarea
                  value={scheduleForm.reason}
                  onChange={(e) => setScheduleForm({...scheduleForm, reason: e.target.value})}
                  placeholder="Enter reason for visit..."
                  rows="3"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowScheduleModal(false);
                  setSchedulePatient(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleCreateSchedule}
                disabled={!scheduleForm.clinicId || !scheduleForm.doctorId || !scheduleForm.appointmentDate}
              >
                📅 Schedule Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientManagement;
