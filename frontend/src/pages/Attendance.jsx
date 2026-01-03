import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI } from '../services/api';

const Attendance = () => {
  const { user, isAdmin } = useAuth();
  const [myAttendance, setMyAttendance] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my');
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'weekly'
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

  // Group by week for weekly view
  const getWeekNumber = (date) => {
    const d = new Date(date);
    const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
    const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const getWeekRange = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const weeklyData = currentData.reduce((acc, att) => {
    const year = new Date(att.date).getFullYear();
    const week = getWeekNumber(att.date);
    const weekKey = `${year}-${String(week).padStart(2, '0')}`; // Pad week for proper sorting
    if (!acc[weekKey]) {
      acc[weekKey] = {
        weekRange: getWeekRange(att.date),
        year,
        week,
        records: [],
        presentDays: 0,
        halfDays: 0,
        leaveDays: 0,
        absentDays: 0,
        totalHours: 0
      };
    }
    acc[weekKey].records.push(att);
    if (att.status === 'present') acc[weekKey].presentDays++;
    if (att.status === 'half-day') acc[weekKey].halfDays++;
    if (att.status === 'leave') acc[weekKey].leaveDays++;
    if (att.status === 'absent') acc[weekKey].absentDays++;
    acc[weekKey].totalHours += att.workHours || 0;
    return acc;
  }, {});

  // Sort by year descending, then week descending (most recent first)
  const weeklyArray = Object.entries(weeklyData).sort((a, b) => {
    const [, weekA] = a;
    const [, weekB] = b;
    if (weekA.year !== weekB.year) return weekB.year - weekA.year;
    return weekB.week - weekA.week;
  });

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

        {/* View Toggle & Filters */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Daily/Weekly Toggle */}
          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '6px', padding: '2px' }}>
            <button
              onClick={() => setViewMode('daily')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '500',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                background: viewMode === 'daily' ? 'white' : 'transparent',
                color: viewMode === 'daily' ? '#7c3aed' : '#6b7280',
                boxShadow: viewMode === 'daily' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '500',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                background: viewMode === 'weekly' ? 'white' : 'transparent',
                color: viewMode === 'weekly' ? '#7c3aed' : '#6b7280',
                boxShadow: viewMode === 'weekly' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Weekly
            </button>
          </div>

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
            <option value="half-day">Half-day</option>
            <option value="leave">Leave</option>
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

      {/* Attendance View */}
      {viewMode === 'daily' ? (
        /* Daily View Table */
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
                        background: att.status === 'present' ? '#dcfce7' : att.status === 'half-day' ? '#fef3c7' : att.status === 'leave' ? '#e0e7ff' : '#fee2e2',
                        color: att.status === 'present' ? '#166534' : att.status === 'half-day' ? '#b45309' : att.status === 'leave' ? '#4338ca' : '#dc2626'
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
      ) : (
        /* Weekly View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <div style={{ ...cardStyle, padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
          ) : weeklyArray.length === 0 ? (
            <div style={{ ...cardStyle, padding: '40px', textAlign: 'center', color: '#6b7280' }}>No attendance records found</div>
          ) : (
            weeklyArray.map(([weekKey, week]) => (
              <div key={weekKey} style={cardStyle}>
                <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#374151' }}>
                    Week: {week.weekRange}
                  </h4>
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ textAlign: 'center', padding: '12px', background: '#dcfce7', borderRadius: '8px' }}>
                      <div style={{ fontSize: '20px', fontWeight: '600', color: '#166534' }}>{week.presentDays}</div>
                      <div style={{ fontSize: '11px', color: '#166534' }}>Present</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '12px', background: '#fef3c7', borderRadius: '8px' }}>
                      <div style={{ fontSize: '20px', fontWeight: '600', color: '#b45309' }}>{week.halfDays}</div>
                      <div style={{ fontSize: '11px', color: '#b45309' }}>Half-day</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '12px', background: '#e0e7ff', borderRadius: '8px' }}>
                      <div style={{ fontSize: '20px', fontWeight: '600', color: '#4338ca' }}>{week.leaveDays}</div>
                      <div style={{ fontSize: '11px', color: '#4338ca' }}>Leave</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '12px', background: '#fee2e2', borderRadius: '8px' }}>
                      <div style={{ fontSize: '20px', fontWeight: '600', color: '#dc2626' }}>{week.absentDays}</div>
                      <div style={{ fontSize: '11px', color: '#dc2626' }}>Absent</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '12px', background: '#f3e8ff', borderRadius: '8px' }}>
                      <div style={{ fontSize: '20px', fontWeight: '600', color: '#7c3aed' }}>{week.totalHours.toFixed(1)}</div>
                      <div style={{ fontSize: '11px', color: '#7c3aed' }}>Total Hours</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {week.records.length} day(s) recorded
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

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
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: '#6b7280' }}>Present Days: </span>
              <strong>{myAttendance.filter(a => a.status === 'present').length}</strong>
            </div>
            <div>
              <span style={{ color: '#6b7280' }}>Half-day: </span>
              <strong>{myAttendance.filter(a => a.status === 'half-day').length}</strong>
            </div>
            <div>
              <span style={{ color: '#6b7280' }}>Leave Days: </span>
              <strong>{myAttendance.filter(a => a.status === 'leave').length}</strong>
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
