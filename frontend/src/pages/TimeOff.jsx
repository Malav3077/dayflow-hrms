import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { leaveAPI } from '../services/api';
import { FiPlus, FiCheck, FiX, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';

const TimeOff = () => {
  const { user, isAdmin } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('my'); // 'my' or 'all'

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      const myRes = await leaveAPI.getMy();
      setLeaves(myRes.data);

      if (isAdmin()) {
        const allRes = await leaveAPI.getAll();
        setAllLeaves(allRes.data);
      }
    } catch (error) {
      console.error('Error loading leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await leaveAPI.updateStatus(id, 'approved');
      toast.success('Leave approved');
      loadLeaves();
    } catch (error) {
      toast.error('Failed to approve leave');
    }
  };

  const handleReject = async (id) => {
    try {
      await leaveAPI.updateStatus(id, 'rejected');
      toast.success('Leave rejected');
      loadLeaves();
    } catch (error) {
      toast.error('Failed to reject leave');
    }
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '8px',
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

  const currentLeaves = activeTab === 'my' ? leaves : allLeaves;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setActiveTab('my')} style={tabStyle(activeTab === 'my')}>
            My Time Off
          </button>
          {isAdmin() && (
            <button onClick={() => setActiveTab('all')} style={tabStyle(activeTab === 'all')}>
              All Requests
            </button>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          <FiPlus size={16} />
          Request Time Off
        </button>
      </div>

      {/* Leave Types Legend */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', fontSize: '12px' }}>
        <span><span style={{ color: '#22c55e' }}>●</span> Paid Time off</span>
        <span><span style={{ color: '#f59e0b' }}>●</span> Sick Leave</span>
        <span><span style={{ color: '#ef4444' }}>●</span> Unpaid Leave</span>
      </div>

      {/* Leave Table */}
      <div style={cardStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {activeTab === 'all' && (
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Employee</th>
              )}
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Time Off Type</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Start Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>End Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Days</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Status</th>
              {activeTab === 'all' && isAdmin() && (
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={activeTab === 'all' ? 7 : 5} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading...</td>
              </tr>
            ) : currentLeaves.length === 0 ? (
              <tr>
                <td colSpan={activeTab === 'all' ? 7 : 5} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No time off requests</td>
              </tr>
            ) : (
              currentLeaves.map((leave) => {
                const startDate = new Date(leave.startDate);
                const endDate = new Date(leave.endDate);
                const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

                return (
                  <tr key={leave._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    {activeTab === 'all' && (
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>
                        {leave.employee?.firstName} {leave.employee?.lastName}
                      </td>
                    )}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '500',
                        textTransform: 'capitalize',
                        background: leave.leaveType === 'paid' ? '#dcfce7' : leave.leaveType === 'sick' ? '#fef3c7' : '#fee2e2',
                        color: leave.leaveType === 'paid' ? '#166534' : leave.leaveType === 'sick' ? '#b45309' : '#dc2626'
                      }}>
                        {leave.leaveType} Leave
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>
                      {startDate.toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>
                      {endDate.toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>
                      {days}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '500',
                        textTransform: 'capitalize',
                        background: leave.status === 'approved' ? '#dcfce7' : leave.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                        color: leave.status === 'approved' ? '#166534' : leave.status === 'rejected' ? '#dc2626' : '#b45309'
                      }}>
                        {leave.status}
                      </span>
                    </td>
                    {activeTab === 'all' && isAdmin() && (
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {leave.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(leave._id)}
                              style={{
                                background: '#dcfce7',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 10px',
                                cursor: 'pointer',
                                marginRight: '6px',
                                color: '#166534'
                              }}
                            >
                              <FiCheck size={14} />
                            </button>
                            <button
                              onClick={() => handleReject(leave._id)}
                              style={{
                                background: '#fee2e2',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 10px',
                                cursor: 'pointer',
                                color: '#dc2626'
                              }}
                            >
                              <FiX size={14} />
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Request Modal */}
      {showModal && (
        <TimeOffModal
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); loadLeaves(); }}
        />
      )}
    </div>
  );
};

// Time Off Request Modal
const TimeOffModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    leaveType: 'paid',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await leaveAPI.create(formData);
      toast.success('Time off request submitted');
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    fontSize: '13px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <FiCalendar size={20} style={{ color: '#7c3aed' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
            Time Off Type Request
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Time Off Type *</label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              style={inputStyle}
            >
              <option value="paid">Paid Time Off</option>
              <option value="sick">Sick Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>From *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>To *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Duration</label>
            <p style={{ fontSize: '13px', color: '#374151', margin: 0 }}>
              {formData.startDate && formData.endDate
                ? `${Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1} Days`
                : '- Days'}
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              placeholder="Why do you need time off?"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                background: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 16px',
                background: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeOff;
