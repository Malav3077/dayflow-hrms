import { useState, useEffect } from 'react';
import { leaveAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

const Leave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'paid',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      const response = await leaveAPI.getMy();
      setLeaves(response.data);
    } catch (error) {
      console.error('Error loading leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await leaveAPI.apply(formData);
      toast.success('Leave request submitted!');
      setShowForm(false);
      setFormData({ leaveType: 'paid', startDate: '', endDate: '', reason: '' });
      loadLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      try {
        await leaveAPI.delete(id);
        toast.success('Leave request deleted');
        loadLeaves();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete');
      }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus />
          Apply Leave
        </button>
      </div>

      {/* Leave Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Apply for Leave</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Type
                </label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="paid">Paid Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                  <option value="casual">Casual Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Enter reason for leave"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leave Requests Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Type</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Start Date</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">End Date</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Days</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Status</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length > 0 ? (
              leaves.map((leave) => (
                <tr key={leave._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 capitalize">{leave.leaveType}</td>
                  <td className="py-3 px-4">
                    {new Date(leave.startDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">{leave.totalDays}</td>
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
                      <button
                        onClick={() => handleDelete(leave._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  No leave requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leave;
