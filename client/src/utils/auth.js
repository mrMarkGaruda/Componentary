import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Login user
export const loginUser = async (email, password) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    return { token, user };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

// Register user
export const registerUser = async (userData) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, userData);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

// Check if user is logged in
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('currentUser');
  return !!(token && user);
};

// Validate token (basic check)
export const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;
  
  try {
    // Basic JWT structure check
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Check if token is expired (if it has exp claim)
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      logoutUser(); // Auto logout if expired
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Invalid token format');
    logoutUser();
    return false;
  }
};

// Get token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Get current user
export const getCurrentUser = () => {
  const userJson = localStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
};

// Enhanced authentication utilities with better error handling and token management

// Refresh user data from server
export const refreshUserData = async () => {
  try {
    const token = getToken();
    if (!token) return null;

    const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const updatedUser = res.data;
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error('Failed to refresh user data:', error);
    // If unauthorized, logout user
    if (error.response?.status === 401) {
      logoutUser();
    }
    return null;
  }
};

// Update user token (for role changes)
export const updateUserToken = (newToken) => {
  if (newToken) {
    localStorage.setItem('token', newToken);
    return true;
  }
  return false;
};

// Check user permissions
export const hasPermission = (requiredRole) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  const roleHierarchy = {
    'customer': 1,
    'seller': 2,
    'admin': 3
  };
  
  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
};

// Auto-logout on token expiry
export const scheduleTokenCheck = () => {
  const checkInterval = 5 * 60 * 1000; // Check every 5 minutes
  
  setInterval(() => {
    if (isAuthenticated() && !isTokenValid()) {
      console.log('Token expired, logging out user');
      logoutUser();
      // Optionally redirect to login page
      window.location.href = '/login';
    }
  }, checkInterval);
};

// Enhanced error handling for API requests
export const handleAuthError = (error) => {
  if (error.response?.status === 401) {
    logoutUser();
    return 'Session expired. Please login again.';
  } else if (error.response?.status === 403) {
    return 'Access denied. Insufficient permissions.';
  } else if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  } else {
    return error.response?.data?.message || 'An error occurred.';
  }
};

// Secure token storage with encryption (basic implementation)
export const setSecureToken = (token) => {
  try {
    // In a real app, you'd use proper encryption
    const encoded = btoa(token);
    localStorage.setItem('token', encoded);
    return true;
  } catch (error) {
    console.error('Failed to store token securely:', error);
    return false;
  }
};

export const getSecureToken = () => {
  try {
    const encoded = localStorage.getItem('token');
    if (!encoded) return null;
    return atob(encoded);
  } catch (error) {
    console.error('Failed to retrieve token:', error);
    return null;
  }
};

// Initialize auth utilities
export const initializeAuth = () => {
  // Schedule periodic token checks
  scheduleTokenCheck();
  
  // Refresh user data on app start if authenticated
  if (isAuthenticated()) {
    refreshUserData();
  }
};