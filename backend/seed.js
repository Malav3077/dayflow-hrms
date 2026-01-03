/**
 * Seed Script - Run this once to create the first Admin user
 * Usage: node seed.js
 *
 * IMPORTANT: Change the credentials below before running!
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dayflow-hrms';

// First Admin Credentials - CHANGE THESE!
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@dayflow.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';  // Strong password
const ADMIN_FIRST_NAME = 'Admin';
const ADMIN_LAST_NAME = 'User';

// User Schema (simplified for seeding)
const userSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employee', 'admin', 'hr'], default: 'employee' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('\n Admin already exists!');
      console.log(`Email: ${existingAdmin.email}`);
      console.log('No new admin created.');
      process.exit(0);
    }

    // Check if email already in use
    const existingEmail = await User.findOne({ email: ADMIN_EMAIL });
    if (existingEmail) {
      console.log(`\n Email ${ADMIN_EMAIL} already in use.`);
      console.log('Please change ADMIN_EMAIL and try again.');
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Create admin
    const admin = new User({
      employeeId: 'EMP-ADMIN-001',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      authProvider: 'local'
    });

    await admin.save();

    console.log('\n===================================');
    console.log(' ADMIN CREATED SUCCESSFULLY!');
    console.log('===================================');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('\n IMPORTANT: Change this password after first login!');
    console.log('===================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();
