const express = require('express');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get my payroll
router.get('/my', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('salary firstName lastName employeeId');

    // Calculate net salary
    const basic = user.salary?.basic || 0;
    const allowances = user.salary?.allowances || 0;
    const deductions = user.salary?.deductions || 0;
    const netSalary = basic + allowances - deductions;

    res.json({
      employee: {
        name: `${user.firstName} ${user.lastName}`,
        employeeId: user.employeeId
      },
      salary: {
        basic,
        allowances,
        deductions,
        netSalary
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all payroll (Admin only)
router.get('/all', auth, adminOnly, async (req, res) => {
  try {
    const employees = await User.find().select('firstName lastName employeeId department designation salary');

    const payrollData = employees.map(emp => {
      const basic = emp.salary?.basic || 0;
      const allowances = emp.salary?.allowances || 0;
      const deductions = emp.salary?.deductions || 0;

      return {
        employee: {
          id: emp._id,
          name: `${emp.firstName} ${emp.lastName}`,
          employeeId: emp.employeeId,
          department: emp.department,
          designation: emp.designation
        },
        salary: {
          basic,
          allowances,
          deductions,
          netSalary: basic + allowances - deductions
        }
      };
    });

    res.json(payrollData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update employee salary (Admin only)
router.put('/:employeeId', auth, adminOnly, async (req, res) => {
  try {
    const { basic, allowances, deductions } = req.body;

    const employee = await User.findByIdAndUpdate(
      req.params.employeeId,
      {
        salary: { basic, allowances, deductions }
      },
      { new: true }
    ).select('firstName lastName employeeId salary');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      message: 'Salary updated successfully',
      employee: {
        name: `${employee.firstName} ${employee.lastName}`,
        employeeId: employee.employeeId
      },
      salary: employee.salary
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate salary slip
router.get('/slip/:employeeId', auth, async (req, res) => {
  try {
    // Employees can only view their own slip
    if (req.user.role === 'employee' && req.user._id.toString() !== req.params.employeeId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const employee = await User.findById(req.params.employeeId)
      .select('firstName lastName employeeId department designation salary joiningDate');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Get attendance for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const attendance = await Attendance.find({
      employee: req.params.employeeId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const presentDays = attendance.filter(a => a.status === 'present').length;
    const leaveDays = attendance.filter(a => a.status === 'leave').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;

    const basic = employee.salary?.basic || 0;
    const allowances = employee.salary?.allowances || 0;
    const deductions = employee.salary?.deductions || 0;

    res.json({
      employee: {
        name: `${employee.firstName} ${employee.lastName}`,
        employeeId: employee.employeeId,
        department: employee.department,
        designation: employee.designation,
        joiningDate: employee.joiningDate
      },
      month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
      attendance: {
        presentDays,
        leaveDays,
        absentDays,
        totalWorkingDays: presentDays + leaveDays + absentDays
      },
      earnings: {
        basic,
        allowances,
        total: basic + allowances
      },
      deductions: {
        total: deductions
      },
      netSalary: basic + allowances - deductions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
