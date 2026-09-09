import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User APIs
export const getUsers = (search) => api.get('/users', { params: { search } });
export const getUserProfile = (id) => api.get(`/users/${id}`);
export const updateProfile = (data) => api.put('/users/profile', data);

// Wallet APIs
export const getWallet = () => api.get('/wallet');
export const addMoney = (data) => api.post('/wallet/add-money', data);
export const sendMoney = (data) => api.post('/wallet/send', data);
export const getTransactions = (params) => api.get('/wallet/transactions', { params });

// Group APIs
export const getGroups = () => api.get('/groups');
export const createGroup = (data) => api.post('/groups', data);
export const getGroupDetails = (id) => api.get(`/groups/${id}`);
export const addMember = (id, data) => api.post(`/groups/${id}/members`, data);

// Expense APIs
export const getExpenses = (groupId) => api.get(`/groups/${groupId}/expenses`);
export const createExpense = (data) => api.post('/expenses', data);

// Budget APIs
export const getBudgets = () => api.get('/budgets');
export const createBudget = (data) => api.post('/budgets', data);

// Bill APIs
export const getBills = () => api.get('/bills');
export const createBill = (data) => api.post('/bills', data);

// Notification APIs
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);

export default api;