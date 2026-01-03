import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

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

  const isGoogleUser = user?.authProvider === 'google';

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validation - Google users don't need current password
    if (!isGoogleUser && !passwordData.currentPassword) {
      toast.error('Please enter current password');
      return;
    }

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success(isGoogleUser ? 'Password set successfully! You can now login with email/password too.' : 'Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

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
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
            {isGoogleUser ? 'Set Password' : 'Change Password'}
          </h3>

          {isGoogleUser && (
            <div style={{
              padding: '12px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#0369a1'
            }}>
              You signed in with Google. Set a password to also login with email/password.
            </div>
          )}

          <form onSubmit={handlePasswordChange} style={{ maxWidth: '300px' }}>
            {!isGoogleUser && (
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter current password"
                />
              </div>
            )}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '13px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
                placeholder="Min 6 characters"
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '13px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
                placeholder="Confirm new password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 16px',
                background: loading ? '#94a3b8' : '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings;
