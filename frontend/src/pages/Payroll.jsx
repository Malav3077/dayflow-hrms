import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { payrollAPI } from '../services/api';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiDownload } from 'react-icons/fi';

const Payroll = () => {
  const { user } = useAuth();
  const [payroll, setPayroll] = useState(null);
  const [slip, setSlip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayroll();
  }, []);

  const loadPayroll = async () => {
    try {
      const [payrollRes, slipRes] = await Promise.all([
        payrollAPI.getMy(),
        payrollAPI.getSlip(user?.id || user?._id),
      ]);
      setPayroll(payrollRes.data);
      setSlip(slipRes.data);
    } catch (error) {
      console.error('Error loading payroll:', error);
    } finally {
      setLoading(false);
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
      <h1 className="text-2xl font-bold text-gray-800">My Payroll</h1>

      {/* Salary Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiDollarSign className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Basic Salary</p>
              <p className="text-xl font-bold">Rs. {payroll?.salary?.basic || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FiTrendingUp className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Allowances</p>
              <p className="text-xl font-bold">Rs. {payroll?.salary?.allowances || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <FiTrendingDown className="text-red-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Deductions</p>
              <p className="text-xl font-bold">Rs. {payroll?.salary?.deductions || 0}</p>
            </div>
          </div>
        </div>
        <div className="card bg-blue-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <FiDollarSign className="text-white text-xl" />
            </div>
            <div>
              <p className="text-sm text-blue-100">Net Salary</p>
              <p className="text-xl font-bold">Rs. {payroll?.salary?.netSalary || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Slip */}
      {slip && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Salary Slip - {slip.month}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee Details */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 border-b pb-2">Employee Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-500">Name:</p>
                <p className="font-medium">{slip.employee?.name}</p>
                <p className="text-gray-500">Employee ID:</p>
                <p className="font-medium">{slip.employee?.employeeId}</p>
                <p className="text-gray-500">Department:</p>
                <p className="font-medium">{slip.employee?.department || 'N/A'}</p>
                <p className="text-gray-500">Designation:</p>
                <p className="font-medium">{slip.employee?.designation || 'N/A'}</p>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 border-b pb-2">Attendance Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-500">Present Days:</p>
                <p className="font-medium">{slip.attendance?.presentDays || 0}</p>
                <p className="text-gray-500">Leave Days:</p>
                <p className="font-medium">{slip.attendance?.leaveDays || 0}</p>
                <p className="text-gray-500">Absent Days:</p>
                <p className="font-medium">{slip.attendance?.absentDays || 0}</p>
                <p className="text-gray-500">Total Working Days:</p>
                <p className="font-medium">{slip.attendance?.totalWorkingDays || 0}</p>
              </div>
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">Earnings</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Basic Salary</span>
                    <span>Rs. {slip.earnings?.basic || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Allowances</span>
                    <span>Rs. {slip.earnings?.allowances || 0}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total Earnings</span>
                    <span>Rs. {slip.earnings?.total || 0}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">Deductions</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Deductions</span>
                    <span>Rs. {slip.deductions?.total || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-blue-800">Net Salary</span>
                <span className="text-2xl font-bold text-blue-600">Rs. {slip.netSalary || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
