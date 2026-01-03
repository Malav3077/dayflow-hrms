const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leave');
const payrollRoutes = require('./routes/payroll');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create default admin if not exists
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const admin = new User({
        employeeId: 'EMP-ADMIN-001',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@dayflow.com',
        password: 'admin123',
        role: 'admin'
      });
      await admin.save();
      console.log('Default Admin Created: admin@dayflow.com / admin123');
    }
  } catch (error) {
    console.log('Admin setup error:', error.message);
  }
};

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dayflow-hrms')
  .then(() => {
    console.log('MongoDB Connected');
    createDefaultAdmin();
  })
  .catch(err => console.log('MongoDB Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', payrollRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Dayflow HRMS API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
