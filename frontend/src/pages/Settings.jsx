import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');

  const cardStyle = {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #e5e7eb'
  };

  const tabStyle = (active) => ({
    padding: '8px 16px',
    background: active ? '#f3e8ff' : 'white',
    border: active ? '1px solid #c084fc' : '1px solid #e5e7eb',
    borderRadius: '6px',
    color: active ? '#7c3aed' : '#4b5563',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer'
  });

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>Settings</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('general')} style={tabStyle(activeTab === 'general')}>
          General
        </button>
        <button onClick={() => setActiveTab('notifications')} style={tabStyle(activeTab === 'notifications')}>
          Notifications
        </button>
        <button onClick={() => setActiveTab('security')} style={tabStyle(activeTab === 'security')}>
          Security
        </button>
      </div>

      {/* Content */}
      {activeTab === 'general' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>General Settings</h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Language</label>
            <select style={{
              padding: '8px 12px',
              fontSize: '13px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              width: '200px'
            }}>
              <option>English</option>
              <option>Hindi</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Timezone</label>
            <select style={{
              padding: '8px 12px',
              fontSize: '13px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              width: '200px'
            }}>
              <option>Asia/Kolkata (IST)</option>
              <option>UTC</option>
            </select>
          </div>

          <button
            onClick={() => toast.success('Settings saved!')}
            style={{
              padding: '8px 16px',
              background: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Save Changes
          </button>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Notification Preferences</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <input type="checkbox" defaultChecked />
              Email notifications for leave approvals
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <input type="checkbox" defaultChecked />
              Email notifications for attendance reminders
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <input type="checkbox" />
              Push notifications
            </label>
          </div>

          <button
            onClick={() => toast.success('Notifications saved!')}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Save Preferences
          </button>
        </div>
      )}

      {activeTab === 'security' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Change Password</h3>

          <div style={{ maxWidth: '300px' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Current Password</label>
              <input
                type="password"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '13px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>New Password</label>
              <input
                type="password"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '13px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Confirm New Password</label>
              <input
                type="password"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '13px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              onClick={() => toast.success('Password changed!')}
              style={{
                padding: '8px 16px',
                background: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Update Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
