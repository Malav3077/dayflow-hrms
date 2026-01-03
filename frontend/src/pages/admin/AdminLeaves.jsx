import { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiCheck, FiX, FiFilter } from 'react-icons/fi';

const AdminLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadLeaves();
  }, [filter]);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const response = await leaveAPI.getAll({ status: filter === 'all' ? undefined : filter });
      setLeaves(response.data);
    } catch (error) {
      console.error('Error loading leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await leaveAPI.update(id, { status });
      toast.success(`Leave ${status}!`);
      loadLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Leave Requests</h1>
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-40"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-yellow-50">
          <p className="text-yellow-600 text-sm">Pending</p>
          <p className="text-3xl font-bold text-yellow-700">
            {leaves.filter((l) => l.status === 'pending').length}
          </p>
        </div>
        <div className="card bg-green-50">
          <p className="text-green-600 text-sm">Approved</p>
          <p className="text-3xl font-bold text-green-700">
            {leaves.filter((l) => l.status === 'approved').length}
          </p>
        </div>
        <div className="card bg-red-50">
          <p className="text-red-600 text-sm">Rejected</p>
          <p className="text-3xl font-bold text-red-700">
            {leaves.filter((l) => l.status === 'rejected').length}
          </p>
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
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Employee</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Dates</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Days</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Reason</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length > 0 ? (
                leaves.map((leave) => (
                  <tr key={leave._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">
                          {leave.employee?.firstName} {leave.employee?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{leave.employee?.employeeId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize">{leave.leaveType}</td>
                    <td className="py-3 px-4">
                      <p>{new Date(leave.startDate).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">
                        to {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-3 px-4">{leave.totalDays}</td>
                    <td className="py-3 px-4">
                      <p className="truncate max-w-[150px]" title={leave.reason}>
                        {leave.reason}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                          leave.status
                        )}`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {leave.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(leave._id, 'approved')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Approve"
                          >
                            <FiCheck />
                          </button>
                          <button
                            onClick={() => handleAction(leave._id, 'rejected')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Reject"
                          >
                            <FiX />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    No leave requests found
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

export default AdminLeaves;
