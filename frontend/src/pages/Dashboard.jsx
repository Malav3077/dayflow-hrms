import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI, employeeAPI } from '../services/api';
import { FiUser, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [attendanceRes] = await Promise.all([
        attendanceAPI.getToday(),
      ]);
      setTodayAttendance(attendanceRes.data);

      // Load employees for admin
      if (isAdmin()) {
        const empRes = await employeeAPI.getAll();
        setEmployees(empRes.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await attendanceAPI.checkIn();
      toast.success('Checked in successfully!');
      loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceAPI.checkOut();
      toast.success('Checked out successfully!');
      loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #e5e7eb'
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Admin: Employee Cards Grid */}
      {isAdmin() && employees.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
            Employees ({employees.length})
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '12px'
          }}>
            {employees.slice(0, 12).map((emp) => (
              <div
                key={emp._id}
                style={{
                  ...cardStyle,
                  padding: '12px',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: '#f3f4f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px'
                }}>
                  <FiUser style={{ color: '#9ca3af' }} size={18} />
                </div>
                <p style={{ fontSize: '11px', color: '#374151', margin: 0, fontWeight: '500' }}>
                  {emp.firstName}
                </p>
                <p style={{ fontSize: '10px', color: '#9ca3af', margin: '2px 0 0 0' }}>
                  {emp.employeeId?.slice(-7) || 'N/A'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* Left: My Attendance Info */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
            My Attendance Information
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Working Locations</p>
            <p style={{ fontSize: '13px', color: '#111827' }}>Office - Main Branch</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Check In Time</p>
              <p style={{ fontSize: '13px', color: '#111827', fontWeight: '500' }}>
                {todayAttendance?.checkIn
                  ? new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Check Out Time</p>
              <p style={{ fontSize: '13px', color: '#111827', fontWeight: '500' }}>
                {todayAttendance?.checkOut
                  ? new Date(todayAttendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Working Hours</p>
            <p style={{ fontSize: '13px', color: '#111827', fontWeight: '500' }}>
              {todayAttendance?.workHours ? `${todayAttendance.workHours} hrs` : '0 hrs'}
            </p>
          </div>

          <div>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Status</p>
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              background: todayAttendance?.status === 'present' ? '#dcfce7' : '#fef3c7',
              color: todayAttendance?.status === 'present' ? '#166534' : '#92400e'
            }}>
              {todayAttendance?.status || 'Not Marked'}
            </span>
          </div>
        </div>

        {/* Right: Check In/Out Panel */}
        <div style={cardStyle}>
          <div style={{ textAlign: 'center' }}>
            {/* Current Time Display */}
            <div style={{
              background: '#f9fafb',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '16px'
            }}>
              <FiClock size={32} style={{ color: '#6b7280', marginBottom: '8px' }} />
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                {formatTime(currentTime)}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Check In Button */}
            <button
              onClick={handleCheckIn}
              disabled={todayAttendance?.checkIn}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                background: todayAttendance?.checkIn ? '#9ca3af' : '#22c55e',
                border: 'none',
                borderRadius: '6px',
                cursor: todayAttendance?.checkIn ? 'not-allowed' : 'pointer'
              }}
            >
              {todayAttendance?.checkIn ? '✓ Checked In' : 'Check In'}
            </button>

            {/* Check Out Button */}
            <button
              onClick={handleCheckOut}
              disabled={!todayAttendance?.checkIn || todayAttendance?.checkOut}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                background: (!todayAttendance?.checkIn || todayAttendance?.checkOut) ? '#9ca3af' : '#ef4444',
                border: 'none',
                borderRadius: '6px',
                cursor: (!todayAttendance?.checkIn || todayAttendance?.checkOut) ? 'not-allowed' : 'pointer'
              }}
            >
              {todayAttendance?.checkOut ? '✓ Checked Out' : 'Check Out'}
            </button>

            {/* Status Messages */}
            {!todayAttendance?.checkIn && (
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px' }}>
                Start your day by checking in
              </p>
            )}
            {todayAttendance?.checkIn && !todayAttendance?.checkOut && (
              <p style={{ fontSize: '12px', color: '#22c55e', marginTop: '12px' }}>
                ✓ You are currently checked in
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
