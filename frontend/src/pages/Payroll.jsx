import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { payrollAPI } from '../services/api';
import { FiEdit2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Payroll = () => {
  const { user, isAdmin } = useAuth();
  const [myPayroll, setMyPayroll] = useState(null);
  const [salarySlip, setSalarySlip] = useState(null);
  const [allPayroll, setAllPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my');
  const [editModal, setEditModal] = useState({ show: false, employee: null });

  useEffect(() => {
    loadPayroll();
  }, []);

  const loadPayroll = async () => {
    try {
      const myRes = await payrollAPI.getMy();
      setMyPayroll(myRes.data);

      // Get salary slip
      const slipRes = await payrollAPI.getSlip(user?.id || user?._id);
      setSalarySlip(slipRes.data);

      if (isAdmin()) {
        const allRes = await payrollAPI.getAll();
        setAllPayroll(allRes.data);
      }
    } catch (error) {
      console.error('Error loading payroll:', error);
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

  const statCardStyle = {
    padding: '16px',
    background: 'white',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setActiveTab('my')} style={tabStyle(activeTab === 'my')}>
            My Payroll
          </button>
          {isAdmin() && (
            <button onClick={() => setActiveTab('all')} style={tabStyle(activeTab === 'all')}>
              All Employees
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
      ) : activeTab === 'my' ? (
        /* My Payroll View */
        <div>
          {/* Salary Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={statCardStyle}>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Basic Salary</p>
              <p style={{ fontSize: '20px', fontWeight: '600', color: '#374151' }}>
                Rs. {myPayroll?.salary?.basic?.toLocaleString() || 0}
              </p>
            </div>
            <div style={statCardStyle}>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Allowances</p>
              <p style={{ fontSize: '20px', fontWeight: '600', color: '#22c55e' }}>
                +Rs. {myPayroll?.salary?.allowances?.toLocaleString() || 0}
              </p>
            </div>
            <div style={statCardStyle}>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Deductions</p>
              <p style={{ fontSize: '20px', fontWeight: '600', color: '#ef4444' }}>
                -Rs. {myPayroll?.salary?.deductions?.toLocaleString() || 0}
              </p>
            </div>
            <div style={{ ...statCardStyle, background: '#7c3aed', border: 'none' }}>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>Net Salary</p>
              <p style={{ fontSize: '20px', fontWeight: '600', color: 'white' }}>
                Rs. {myPayroll?.salary?.netSalary?.toLocaleString() || 0}
              </p>
            </div>
          </div>

          {/* Salary Slip */}
          {salarySlip && (
            <div style={{ ...cardStyle, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>Salary Slip - {salarySlip.month}</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
                {/* Employee Details */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '500', color: '#6b7280', marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>Employee Details</h4>
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#6b7280' }}>Name</span>
                      <span style={{ fontWeight: '500' }}>{salarySlip.employee?.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#6b7280' }}>Employee ID</span>
                      <span style={{ fontWeight: '500' }}>{salarySlip.employee?.employeeId}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#6b7280' }}>Department</span>
                      <span style={{ fontWeight: '500' }}>{salarySlip.employee?.department || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Designation</span>
                      <span style={{ fontWeight: '500' }}>{salarySlip.employee?.designation || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Attendance Summary */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '500', color: '#6b7280', marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>Attendance Summary</h4>
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#6b7280' }}>Present Days</span>
                      <span style={{ fontWeight: '500', color: '#22c55e' }}>{salarySlip.attendance?.presentDays || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#6b7280' }}>Leave Days</span>
                      <span style={{ fontWeight: '500', color: '#3b82f6' }}>{salarySlip.attendance?.leaveDays || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#6b7280' }}>Absent Days</span>
                      <span style={{ fontWeight: '500', color: '#ef4444' }}>{salarySlip.attendance?.absentDays || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Total Working Days</span>
                      <span style={{ fontWeight: '500' }}>{salarySlip.attendance?.totalWorkingDays || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Earnings & Deductions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '500', color: '#6b7280', marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>Earnings</h4>
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#6b7280' }}>Basic Salary</span>
                      <span>Rs. {salarySlip.earnings?.basic?.toLocaleString() || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#6b7280' }}>Allowances</span>
                      <span style={{ color: '#22c55e' }}>+Rs. {salarySlip.earnings?.allowances?.toLocaleString() || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                      <span>Total Earnings</span>
                      <span>Rs. {salarySlip.earnings?.total?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '500', color: '#6b7280', marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>Deductions</h4>
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Total Deductions</span>
                      <span style={{ color: '#ef4444' }}>-Rs. {salarySlip.deductions?.total?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Salary */}
              <div style={{ padding: '16px', background: '#f3e8ff', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#7c3aed' }}>Net Salary</span>
                  <span style={{ fontSize: '24px', fontWeight: '700', color: '#7c3aed' }}>Rs. {salarySlip.netSalary?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* All Employees Payroll (Admin View) */
        <div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={statCardStyle}>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Employees</p>
              <p style={{ fontSize: '24px', fontWeight: '600', color: '#374151' }}>{allPayroll.length}</p>
            </div>
            <div style={{ ...statCardStyle, background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)', border: 'none', gridColumn: 'span 2' }}>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>Total Monthly Payroll</p>
              <p style={{ fontSize: '24px', fontWeight: '600', color: 'white' }}>
                Rs. {allPayroll.reduce((sum, p) => sum + (p.salary?.netSalary || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Table */}
          <div style={cardStyle}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Employee</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Department</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Basic</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Allowances</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Deductions</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Net Salary</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allPayroll.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No payroll data</td>
                  </tr>
                ) : (
                  allPayroll.map((emp) => (
                    <tr key={emp.employee?.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>{emp.employee?.name}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>{emp.employee?.employeeId}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{emp.employee?.department || 'N/A'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', textAlign: 'right' }}>
                        Rs. {emp.salary?.basic?.toLocaleString() || 0}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#22c55e', textAlign: 'right' }}>
                        +Rs. {emp.salary?.allowances?.toLocaleString() || 0}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#ef4444', textAlign: 'right' }}>
                        -Rs. {emp.salary?.deductions?.toLocaleString() || 0}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#374151', textAlign: 'right' }}>
                        Rs. {emp.salary?.netSalary?.toLocaleString() || 0}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => setEditModal({ show: true, employee: emp })}
                          style={{
                            padding: '6px 10px',
                            background: '#f3e8ff',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#7c3aed',
                            cursor: 'pointer'
                          }}
                        >
                          <FiEdit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Salary Modal */}
      {editModal.show && (
        <EditSalaryModal
          employee={editModal.employee}
          onClose={() => setEditModal({ show: false, employee: null })}
          onSave={() => { setEditModal({ show: false, employee: null }); loadPayroll(); }}
        />
      )}
    </div>
  );
};

// Edit Salary Modal
const EditSalaryModal = ({ employee, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    basic: employee.salary?.basic || 0,
    allowances: employee.salary?.allowances || 0,
    deductions: employee.salary?.deductions || 0
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await payrollAPI.update(employee.employee?.id, formData);
      toast.success('Salary updated successfully!');
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update salary');
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

  const netSalary = formData.basic + formData.allowances - formData.deductions;

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
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
          Update Salary - {employee.employee?.name}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Basic Salary</label>
            <input
              type="number"
              value={formData.basic}
              onChange={(e) => setFormData({ ...formData, basic: Number(e.target.value) })}
              style={inputStyle}
              min="0"
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Allowances</label>
            <input
              type="number"
              value={formData.allowances}
              onChange={(e) => setFormData({ ...formData, allowances: Number(e.target.value) })}
              style={inputStyle}
              min="0"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Deductions</label>
            <input
              type="number"
              value={formData.deductions}
              onChange={(e) => setFormData({ ...formData, deductions: Number(e.target.value) })}
              style={inputStyle}
              min="0"
            />
          </div>

          <div style={{
            padding: '12px',
            background: '#f3e8ff',
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Net Salary</p>
            <p style={{ fontSize: '20px', fontWeight: '600', color: '#7c3aed' }}>
              Rs. {netSalary.toLocaleString()}
            </p>
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Payroll;
