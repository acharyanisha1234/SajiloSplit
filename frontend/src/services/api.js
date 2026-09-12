import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 30000
});

// DEVICE FINGERPRINT 
const getDeviceFingerprint = () => {
  let fingerprint = localStorage.getItem('deviceFingerprint');
  if (!fingerprint) {
    // Generate based on browser characteristics
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    
    const data = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Simple hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    fingerprint = Math.abs(hash).toString(36);
    localStorage.setItem('deviceFingerprint', fingerprint);
  }
  return fingerprint;
};

// REQUEST INTERCEPTOR 
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    config.headers['X-Device-Fingerprint'] = getDeviceFingerprint();
    config.headers['X-Client-Time'] = new Date().toISOString();
    
    return config;
  },
  (error) => Promise.reject(error)
);

//  RESPONSE INTERCEPTOR 
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    //  401: Unauthorized 
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (code === 'SESSION_HIJACKED') {
        alert('Security Alert: Session hijacking detected. Please login again.');
      }
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // 403: Forbidden 
    if (status === 403) {
      if (code === 'IP_BLOCKED') {
        alert('Your IP has been blocked due to suspicious activity.');
      } else if (code === 'ACCOUNT_SUSPENDED') {
        alert('Your account has been suspended.');
      } else if (code === 'KYC_REQUIRED') {
        window.location.href = '/kyc';
      }
    }

    // 423: Locked 
    if (status === 423) {
      alert(error.response.data.message || 'Account temporarily locked.');
    }

    // 429: Rate Limit 
    if (status === 429) {
      alert('Too many requests. Please wait and try again.');
    }

    return Promise.reject(error);
  }
);

export default api;