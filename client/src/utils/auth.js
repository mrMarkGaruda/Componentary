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