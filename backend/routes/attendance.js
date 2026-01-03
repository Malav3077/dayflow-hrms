const express = require('express');
const Attendance = require('../models/Attendance');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Check-in
router.post('/check-in', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
      employee: req.user._id,
      date: today
    });

    if (attendance && attendance.checkIn) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    if (!attendance) {
      attendance = new Attendance({
        employee: req.user._id,
        date: today,
        checkIn: new Date(),
        status: 'present'
      });
    } else {
      attendance.checkIn = new Date();
      attendance.status = 'present';
    }

    await attendance.save();
    res.json({ message: 'Checked in successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check-out
router.post('/check-out', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: today
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ message: 'Please check in first' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    attendance.checkOut = new Date();

    // Calculate work hours
    const hours = (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);
    attendance.workHours = Math.round(hours * 100) / 100;

    // Mark as half-day if less than 4 hours
    if (attendance.workHours < 4) {
      attendance.status = 'half-day';
    }

    await attendance.save();
    res.json({ message: 'Checked out successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get my attendance
router.get('/my', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = { employee: req.user._id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get today's status
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: today
    });

    res.json(attendance || { status: 'not-marked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all attendance (Admin only)
router.get('/all', auth, adminOnly, async (req, res) => {
  try {
    const { date, employeeId } = req.query;

    let query = {};

    if (date) {
      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      query.date = searchDate;
    }

    if (employeeId) {
      query.employee = employeeId;
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update attendance (Admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    ).populate('employee', 'firstName lastName employeeId');

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
