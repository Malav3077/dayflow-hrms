const express = require('express');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Apply for leave
router.post('/apply', auth, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate total days
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leave = new Leave({
      employee: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      totalDays
    });

    await leave.save();
    res.status(201).json({ message: 'Leave application submitted', leave });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get my leaves
router.get('/my', auth, async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id })
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all leave requests (Admin only)
router.get('/all', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName employeeId department')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve/Reject leave (Admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { status, adminComment } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminComment,
        approvedBy: req.user._id
      },
      { new: true }
    ).populate('employee', 'firstName lastName employeeId');

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // If approved, mark attendance as leave for those days
    if (status === 'approved') {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);

        await Attendance.findOneAndUpdate(
          { employee: leave.employee._id, date },
          { employee: leave.employee._id, date, status: 'leave' },
          { upsert: true }
        );
      }
    }

    res.json({ message: `Leave ${status}`, leave });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete leave request (only if pending)
router.delete('/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findOne({
      _id: req.params.id,
      employee: req.user._id,
      status: 'pending'
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found or cannot be deleted' });
    }

    await leave.deleteOne();
    res.json({ message: 'Leave request deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
