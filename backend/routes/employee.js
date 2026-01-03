const express = require('express');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

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
    const { phone, address, profilePicture, department, designation, salary, firstName, lastName } = req.body;

    // Employees can only update limited fields
    let updateData = {};
    if (req.user.role === 'employee') {
      if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      updateData = { phone, address, profilePicture };
    } else {
      // Admin can update all fields
      updateData = { phone, address, profilePicture, department, designation, salary, firstName, lastName };
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

// Delete employee (Admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const employee = await User.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
