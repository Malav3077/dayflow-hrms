import { useState, useEffect } from 'react';
import { attendanceAPI } from '../../services/api';
import { FiCalendar } from 'react-icons/fi';

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const response = await attendanceAPI.getAll({ date: selectedDate });
      setAttendance(response.data);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700';
      case 'absent':
        return 'bg-red-100 text-red-700';
      case 'half-day':
        return 'bg-yellow-100 text-yellow-700';
      case 'leave':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Stats
  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const absentCount = attendance.filter((a) => a.status === 'absent').length;
  const leaveCount = attendance.filter((a) => a.status === 'leave').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">All Attendance</h1>
        <div className="flex items-center gap-2">
          <FiCalendar className="text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-green-50">
          <p className="text-green-600 text-sm">Present</p>
          <p className="text-3xl font-bold text-green-700">{presentCount}</p>
        </div>
        <div className="card bg-red-50">
          <p className="text-red-600 text-sm">Absent</p>
          <p className="text-3xl font-bold text-red-700">{absentCount}</p>
        </div>
        <div className="card bg-blue-50">
          <p className="text-blue-600 text-sm">On Leave</p>
          <p className="text-3xl font-bold text-blue-700">{leaveCount}</p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Employee ID</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Check In</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Check Out</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Work Hours</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length > 0 ? (
                attendance.map((record) => (
                  <tr key={record._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{record.employee?.employeeId}</td>
                    <td className="py-3 px-4">
                      {record.employee?.firstName} {record.employee?.lastName}
                    </td>
                    <td className="py-3 px-4">
                      {record.checkIn
                        ? new Date(record.checkIn).toLocaleTimeString()
                        : '--:--'}
                    </td>
                    <td className="py-3 px-4">
                      {record.checkOut
                        ? new Date(record.checkOut).toLocaleTimeString()
                        : '--:--'}
                    </td>
                    <td className="py-3 px-4">{record.workHours || 0} hrs</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                          record.status
                        )}`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No attendance records for this date
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminAttendance;
