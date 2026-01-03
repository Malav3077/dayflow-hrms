import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { employeeAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCalendar, FiDollarSign } from 'react-icons/fi';

const Profile = () => {
  const { user, loadUser, isAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    department: ''
  });
  const [salaryData, setSalaryData] = useState({
    basic: 0,
    allowances: 0,
    deductions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const response = await employeeAPI.getById(user?.id || user?._id);
      setProfile(response.data);
      setFormData({
        phone: response.data.phone || '',
        address: response.data.address || '',
        department: response.data.department || ''
      });
      setSalaryData(response.data.salary || { basic: 0, allowances: 0, deductions: 0 });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await employeeAPI.update(user?.id || user?._id, formData);
      toast.success('Profile updated successfully!');
      setEditing(false);
      loadProfile();
      loadUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

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

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    fontSize: '13px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
    );
  }

  const netSalary = (salaryData.basic || 0) + (salaryData.allowances || 0) - (salaryData.deductions || 0);

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>My Profile</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('profile')} style={tabStyle(activeTab === 'profile')}>
          Profile Info
        </button>
        <button onClick={() => setActiveTab('salary')} style={tabStyle(activeTab === 'salary')}>
          Salary Info
        </button>
      </div>

      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '20px' }}>
          {/* Profile Card */}
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#fee2e2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <FiUser style={{ color: '#dc2626' }} size={32} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
              {profile?.firstName} {profile?.lastName}
            </h3>
            <p style={{ fontSize: '13px', color: '#6b7280', textTransform: 'capitalize' }}>{profile?.role}</p>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>ID: {profile?.employeeId}</p>
          </div>

          {/* Details */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Personal Information</h3>
              <button
                onClick={() => setEditing(!editing)}
                style={{
                  padding: '6px 12px',
                  background: editing ? '#fee2e2' : '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  color: editing ? '#dc2626' : '#374151'
                }}
              >
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleUpdate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={inputStyle}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      style={inputStyle}
                      placeholder="Department"
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                    placeholder="Address"
                  />
                </div>
                <button type="submit" style={{
                  padding: '8px 16px',
                  background: '#7c3aed',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}>
                  Save Changes
                </button>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiMail style={{ color: '#9ca3af' }} />
                  <div>
                    <p style={{ fontSize: '11px', color: '#6b7280' }}>Email</p>
                    <p style={{ fontSize: '13px', color: '#111827' }}>{profile?.email}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiPhone style={{ color: '#9ca3af' }} />
                  <div>
                    <p style={{ fontSize: '11px', color: '#6b7280' }}>Phone</p>
                    <p style={{ fontSize: '13px', color: '#111827' }}>{profile?.phone || '-'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiBriefcase style={{ color: '#9ca3af' }} />
                  <div>
                    <p style={{ fontSize: '11px', color: '#6b7280' }}>Department</p>
                    <p style={{ fontSize: '13px', color: '#111827' }}>{profile?.department || '-'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiCalendar style={{ color: '#9ca3af' }} />
                  <div>
                    <p style={{ fontSize: '11px', color: '#6b7280' }}>Joining Date</p>
                    <p style={{ fontSize: '13px', color: '#111827' }}>
                      {profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', gridColumn: 'span 2' }}>
                  <FiMapPin style={{ color: '#9ca3af' }} />
                  <div>
                    <p style={{ fontSize: '11px', color: '#6b7280' }}>Address</p>
                    <p style={{ fontSize: '13px', color: '#111827' }}>{profile?.address || '-'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'salary' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>My Salary Sheet</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Left - Salary Breakdown */}
            <div>
              <table style={{ width: '100%', fontSize: '13px' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px 0', color: '#6b7280' }}>Basic Salary</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: '500' }}>₹{salaryData.basic?.toLocaleString() || 0}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px 0', color: '#6b7280' }}>Allowances (HRA, etc.)</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: '500', color: '#16a34a' }}>+₹{salaryData.allowances?.toLocaleString() || 0}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px 0', color: '#6b7280' }}>Deductions (Tax, PF)</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: '500', color: '#dc2626' }}>-₹{salaryData.deductions?.toLocaleString() || 0}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 0', fontWeight: '600', color: '#111827' }}>Net Salary (Monthly)</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: '700', fontSize: '16px', color: '#7c3aed' }}>₹{netSalary.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right - Annual Summary */}
            <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>Annual Summary</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: '#6b7280' }}>Yearly Gross</span>
                <span style={{ fontWeight: '500' }}>₹{((salaryData.basic + salaryData.allowances) * 12).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: '#6b7280' }}>Total Deductions</span>
                <span style={{ fontWeight: '500', color: '#dc2626' }}>₹{(salaryData.deductions * 12).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                <span style={{ fontWeight: '600' }}>Net Annual</span>
                <span style={{ fontWeight: '700', color: '#7c3aed' }}>₹{(netSalary * 12).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            background: '#fef3c7',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#92400e'
          }}>
            <strong>Note:</strong> Salary information shown here is based on your current salary structure.
            For any discrepancies, please contact HR department.
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
