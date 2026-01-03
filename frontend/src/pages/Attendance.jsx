import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI } from '../services/api';

const Attendance = () => {
  const { user, isAdmin } = useAuth();
  const [myAttendance, setMyAttendance] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const myRes = await attendanceAPI.getMy();
      setMyAttendance(myRes.data);

      if (isAdmin()) {
        const allRes = await attendanceAPI.getAll();
        setAllAttendance(allRes.data);
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
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

  const inputStyle = {
    padding: '6px 12px',
    fontSize: '13px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none'
  };

  // Filter data
  let currentData = activeTab === 'my' ? myAttendance : allAttendance;

  if (dateFilter) {
    currentData = currentData.filter(att =>
      new Date(att.date).toISOString().split('T')[0] === dateFilter
    );
  }

  if (statusFilter) {
    currentData = currentData.filter(att => att.status === statusFilter);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setActiveTab('my')} style={tabStyle(activeTab === 'my')}>
            My Attendance
          </button>
          {isAdmin() && (
            <button onClick={() => setActiveTab('all')} style={tabStyle(activeTab === 'all')}>
              All Attendance
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={inputStyle}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={inputStyle}
          >
            <option value="">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
          {(dateFilter || statusFilter) && (
            <button
              onClick={() => { setDateFilter(''); setStatusFilter(''); }}
              style={{ ...inputStyle, cursor: 'pointer', background: '#f3f4f6' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Note for Admin */}
      {isAdmin() && activeTab === 'all' && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '6px',
          padding: '12px 16px',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#92400e'
        }}>
          <strong>Note:</strong> As Admin/HR Officer, you can see attendance of all employees.
          Attendance data serves as the basis for salary generation.
        </div>
      )}

      {/* Attendance Table */}
      <div style={cardStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {activeTab === 'all' && (
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Employee</th>
              )}
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Check In</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Check Out</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Total Working Hrs</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={activeTab === 'all' ? 6 : 5} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading...</td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={activeTab === 'all' ? 6 : 5} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No attendance records found</td>
              </tr>
            ) : (
              currentData.map((att) => (
                <tr key={att._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {activeTab === 'all' && (
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>
                      {att.employee?.firstName} {att.employee?.lastName}
                    </td>
                  )}
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>
                    {new Date(att.date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>
                    {att.checkIn ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>
                    {att.checkOut ? new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>
                    {att.workHours ? `${att.workHours} hrs` : '-'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '500',
                      textTransform: 'capitalize',
                      background: att.status === 'present' ? '#dcfce7' : att.status === 'late' ? '#fef3c7' : '#fee2e2',
                      color: att.status === 'present' ? '#166534' : att.status === 'late' ? '#b45309' : '#dc2626'
                    }}>
                      {att.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary for Employee */}
      {activeTab === 'my' && myAttendance.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>This Month Summary</h4>
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
            <div>
              <span style={{ color: '#6b7280' }}>Present Days: </span>
              <strong>{myAttendance.filter(a => a.status === 'present').length}</strong>
            </div>
            <div>
              <span style={{ color: '#6b7280' }}>Late Days: </span>
              <strong>{myAttendance.filter(a => a.status === 'late').length}</strong>
            </div>
            <div>
              <span style={{ color: '#6b7280' }}>Total Hours: </span>
              <strong>{myAttendance.reduce((sum, a) => sum + (a.workHours || 0), 0).toFixed(1)} hrs</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
