import React, { useState, useEffect } from 'react';
import api from '../../../../utils/api';
import '../ModuleStyles.css';

function GeneralSettings() {
  const [settings, setSettings] = useState({
    systemName: 'University Clinic Management System',
    timezone: 'Asia/Manila',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    language: 'en',
    appointmentDuration: 30,
    maxAppointmentsPerDay: 50,
    enableNotifications: true,
    enableEmailNotifications: false,
    enableSMSNotifications: false,
    autoLogoutMinutes: 30
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would save to backend
      // await api.post('/admin/settings', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: '✅ Settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Failed to save settings' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-section">
      <h3 className="section-title">General System Settings</h3>
      
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="settings-grid">
        {/* System Information */}
        <div className="settings-card">
          <h4 className="card-title">System Information</h4>
          
          <div className="form-group">
            <label>System Name</label>
            <input
              type="text"
              value={settings.systemName}
              onChange={(e) => handleChange('systemName', e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="form-control"
            >
              <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
              <option value="America/New_York">America/New York (GMT-5)</option>
              <option value="Europe/London">Europe/London (GMT+0)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Language</label>
            <select
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)}
              className="form-control"
            >
              <option value="en">English</option>
              <option value="fil">Filipino</option>
              <option value="es">Spanish</option>
            </select>
          </div>
        </div>

        {/* Date & Time Format */}
        <div className="settings-card">
          <h4 className="card-title">Date & Time Format</h4>
          
          <div className="form-group">
            <label>Date Format</label>
            <select
              value={settings.dateFormat}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
              className="form-control"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div className="form-group">
            <label>Time Format</label>
            <select
              value={settings.timeFormat}
              onChange={(e) => handleChange('timeFormat', e.target.value)}
              className="form-control"
            >
              <option value="12h">12-hour (AM/PM)</option>
              <option value="24h">24-hour</option>
            </select>
          </div>
        </div>

        {/* Appointment Settings */}
        <div className="settings-card">
          <h4 className="card-title">Appointment Settings</h4>
          
          <div className="form-group">
            <label>Default Appointment Duration (minutes)</label>
            <input
              type="number"
              value={settings.appointmentDuration}
              onChange={(e) => handleChange('appointmentDuration', parseInt(e.target.value))}
              className="form-control"
              min="15"
              max="120"
              step="15"
            />
          </div>

          <div className="form-group">
            <label>Max Appointments Per Day</label>
            <input
              type="number"
              value={settings.maxAppointmentsPerDay}
              onChange={(e) => handleChange('maxAppointmentsPerDay', parseInt(e.target.value))}
              className="form-control"
              min="10"
              max="200"
            />
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-card">
          <h4 className="card-title">Notification Settings</h4>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => handleChange('enableNotifications', e.target.checked)}
              />
              <span>Enable System Notifications</span>
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.enableEmailNotifications}
                onChange={(e) => handleChange('enableEmailNotifications', e.target.checked)}
              />
              <span>Enable Email Notifications</span>
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.enableSMSNotifications}
                onChange={(e) => handleChange('enableSMSNotifications', e.target.checked)}
              />
              <span>Enable SMS Notifications</span>
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="settings-card">
          <h4 className="card-title">Security Settings</h4>
          
          <div className="form-group">
            <label>Auto Logout After (minutes)</label>
            <input
              type="number"
              value={settings.autoLogoutMinutes}
              onChange={(e) => handleChange('autoLogoutMinutes', parseInt(e.target.value))}
              className="form-control"
              min="5"
              max="120"
              step="5"
            />
            <small className="form-text">Users will be logged out after this period of inactivity</small>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button 
          className="btn btn-primary btn-lg" 
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? '💾 Saving...' : '💾 Save Settings'}
        </button>
      </div>
    </div>
  );
}

export default GeneralSettings;
