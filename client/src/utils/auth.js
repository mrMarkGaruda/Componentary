const USERS_STORAGE_KEY = 'mock_api_users';

// Initialize users in localStorage if they don't exist
const initializeUsers = () => {
  if (!localStorage.getItem(USERS_STORAGE_KEY)) {
    const initialUsers = [
      {
        name: 'Demo User',
        email: 'demo@example.com',
        password: 'password123'
      }
    ];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
  }
};

// Login user
export const loginUser = async (email, password) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  try {
    initializeUsers();
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Generate a mock token (in a real app, this would come from the server)
    const token = btoa(JSON.stringify({ userId: email, timestamp: Date.now() }));
    
    // Store token in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify({
      name: user.name,
      email: user.email
    }));
    
    return { token, user: { name: user.name, email: user.email } };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register user
export const registerUser = async (userData) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    initializeUsers();
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    
    // Check if email already exists
    if (users.some(u => u.email === userData.email)) {
      throw new Error('Email already registered');
    }
    
    // Add new user
    users.push({
      name: userData.name,
      email: userData.email,
      password: userData.password
    });
    
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    
    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Check if user is logged in
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
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