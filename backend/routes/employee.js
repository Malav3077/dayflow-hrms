const express = require('express');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Create new employee (Admin/HR)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { employeeId, firstName, lastName, email, password, role, department, phone } = req.body;

    // HR cannot create Admin users
    if (req.user.role === 'hr' && role === 'admin') {
      return res.status(403).json({ message: 'HR cannot create Admin users' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const employee = new User({
      employeeId,
      firstName,
      lastName,
      email,
      password,
      role: role || 'employee',
      department,
      phone
    });

    await employee.save();
    res.status(201).json({ message: 'Employee created successfully', employee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all employees (Admin only)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const employees = await User.find().select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single employee
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select('-password');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Employees can only view their own profile
    if (req.user.role === 'employee' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update employee profile
router.put('/:id', auth, async (req, res) => {
  try {
    const { phone, address, profilePicture, department, designation, salary, firstName, lastName, role } = req.body;

    // Employees can only update limited fields
    let updateData = {};
    if (req.user.role === 'employee') {
      if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      updateData = { phone, address, profilePicture };
    } else {
      // Check target user
      const targetUser = await User.findById(req.params.id);

      // HR cannot modify Admin users
      if (req.user.role === 'hr' && targetUser?.role === 'admin') {
        return res.status(403).json({ message: 'HR cannot modify Admin users' });
      }

      // HR cannot promote to Admin
      if (req.user.role === 'hr' && role === 'admin') {
        return res.status(403).json({ message: 'HR cannot promote users to Admin' });
      }

      // Admin/HR can update all fields
      updateData = { phone, address, profilePicture, department, designation, salary, firstName, lastName };
      if (role) updateData.role = role;
    }

    const employee = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete employee (Admin/HR)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // HR cannot delete Admin users
    if (req.user.role === 'hr' && targetUser.role === 'admin') {
      return res.status(403).json({ message: 'HR cannot delete Admin users' });
    }

    // Prevent deleting yourself
    if (req.user._id.toString() === req.params.id) {
      return res.status(403).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
