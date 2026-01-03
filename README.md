# Dayflow HRMS

A modern Human Resource Management System built for **Odoo Hackathon 2025**.

## Demo Video
[Watch Solution Video](https://www.awesomescreenshot.com/video/48002604?key=52506985221be7e3662f5f4d6031f51f)

## Features

- **Authentication** - Email/Password & Google OAuth with email verification
- **Attendance Tracking** - One-click check-in/check-out with work hours calculation
- **Leave Management** - Apply, approve/reject leaves with multiple leave types
- **Payroll Management** - Salary structure with basic, allowances & deductions
- **Employee Management** - Admin panel for managing all employees
- **Role-based Access** - Employee, HR, and Admin roles

## Tech Stack

| Backend | Frontend |
|---------|----------|
| Node.js + Express.js | React 19 + Vite |
| MongoDB + Mongoose | TailwindCSS |
| JWT + Google OAuth | React Router |
| Nodemailer | Axios |

## Quick Start

### Backend
```bash
cd backend
npm install
# Create .env file (see .env.example)
node seed.js    # Seed database
npm run dev     # Start server on :5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev     # Start on :5173
```

## Default Login

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dayflow.com | admin123 |
| HR | hr@dayflow.com | hr123 |

## API Endpoints

- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google OAuth
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out
- `GET /api/leave` - Get leaves
- `POST /api/leave` - Apply leave
- `GET /api/employees` - Get employees

## Team

| Role | Name |
|------|------|
| **Team Leader** | Malav Jigneshbhai Parekh |
| Team Member | Parikshitsinh Arjunbhai Vaghela |
| Team Member | Shailesh Parmar |

---
Built with passion for Odoo Hackathon 2025
