import { useState, useEffect } from 'react';
import { payrollAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiEdit, FiDollarSign } from 'react-icons/fi';

const AdminPayroll = () => {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    basic: 0,
    allowances: 0,
    deductions: 0,
  });

  useEffect(() => {
    loadPayroll();
  }, []);

  const loadPayroll = async () => {
    try {
      const response = await payrollAPI.getAll();
      setPayroll(response.data);
    } catch (error) {
      console.error('Error loading payroll:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      basic: emp.salary?.basic || 0,
      allowances: emp.salary?.allowances || 0,
      deductions: emp.salary?.deductions || 0,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await payrollAPI.update(editingEmployee.employee.id, formData);
      toast.success('Salary updated successfully!');
      setEditingEmployee(null);
      loadPayroll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  // Stats
  const totalPayroll = payroll.reduce((sum, p) => sum + (p.salary?.netSalary || 0), 0);

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
        <h1 className="text-2xl font-bold text-gray-800">All Payroll</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiDollarSign className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Employees</p>
              <p className="text-2xl font-bold">{payroll.length}</p>
            </div>
          </div>
        </div>
        <div className="card col-span-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <p className="text-blue-100 text-sm">Total Monthly Payroll</p>
          <p className="text-3xl font-bold">Rs. {totalPayroll.toLocaleString()}</p>
        </div>
      </div>

      {/* Edit Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              Update Salary - {editingEmployee.employee?.name}
            </h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Basic Salary
                </label>
                <input
                  type="number"
                  value={formData.basic}
                  onChange={(e) => setFormData({ ...formData, basic: Number(e.target.value) })}
                  className="input-field"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allowances
                </label>
                <input
                  type="number"
                  value={formData.allowances}
                  onChange={(e) => setFormData({ ...formData, allowances: Number(e.target.value) })}
                  className="input-field"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deductions
                </label>
                <input
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: Number(e.target.value) })}
                  className="input-field"
                  min="0"
                />
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Net Salary</p>
                <p className="text-xl font-bold text-blue-600">
                  Rs. {(formData.basic + formData.allowances - formData.deductions).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Employee</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Department</th>
              <th className="text-right py-3 px-4 text-gray-600 font-medium">Basic</th>
              <th className="text-right py-3 px-4 text-gray-600 font-medium">Allowances</th>
              <th className="text-right py-3 px-4 text-gray-600 font-medium">Deductions</th>
              <th className="text-right py-3 px-4 text-gray-600 font-medium">Net Salary</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payroll.map((emp) => (
              <tr key={emp.employee?.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium">{emp.employee?.name}</p>
                    <p className="text-sm text-gray-500">{emp.employee?.employeeId}</p>
                  </div>
                </td>
                <td className="py-3 px-4">{emp.employee?.department || 'N/A'}</td>
                <td className="py-3 px-4 text-right">Rs. {emp.salary?.basic?.toLocaleString() || 0}</td>
                <td className="py-3 px-4 text-right text-green-600">
                  +Rs. {emp.salary?.allowances?.toLocaleString() || 0}
                </td>
                <td className="py-3 px-4 text-right text-red-600">
                  -Rs. {emp.salary?.deductions?.toLocaleString() || 0}
                </td>
                <td className="py-3 px-4 text-right font-semibold">
                  Rs. {emp.salary?.netSalary?.toLocaleString() || 0}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleEdit(emp)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <FiEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPayroll;
