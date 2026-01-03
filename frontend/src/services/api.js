import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Employee APIs
export const employeeAPI = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

// Attendance APIs
export const attendanceAPI = {
  checkIn: () => api.post('/attendance/check-in'),
  checkOut: () => api.post('/attendance/check-out'),
  getToday: () => api.get('/attendance/today'),
  getMy: (params) => api.get('/attendance/my', { params }),
  getAll: (params) => api.get('/attendance/all', { params }),
  update: (id, data) => api.put(`/attendance/${id}`, data),
};

// Leave APIs
export const leaveAPI = {
  apply: (data) => api.post('/leave/apply', data),
  getMy: () => api.get('/leave/my'),
  getAll: (params) => api.get('/leave/all', { params }),
  update: (id, data) => api.put(`/leave/${id}`, data),
  delete: (id) => api.delete(`/leave/${id}`),
};

// Payroll APIs
export const payrollAPI = {
  getMy: () => api.get('/payroll/my'),
  getAll: () => api.get('/payroll/all'),
  update: (employeeId, data) => api.put(`/payroll/${employeeId}`, data),
  getSlip: (employeeId) => api.get(`/payroll/slip/${employeeId}`),
};

export default api;
