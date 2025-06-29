import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  isAuthenticated, 
  getCurrentUser, 
  isTokenValid, 
  logoutUser as authLogoutUser,
  refreshUserData 
} from '../utils/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = () => {
      try {
        if (isAuthenticated() && isTokenValid()) {
          const currentUser = getCurrentUser();
          setUser(currentUser);
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
          // Clear invalid tokens
          authLogoutUser();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setIsLoggedIn(false);
        authLogoutUser();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  // Logout function
  const logout = () => {
    authLogoutUser();
    setUser(null);
    setIsLoggedIn(false);
  };

  // Refresh user data from server
  const refreshUser = async () => {
    try {
      const updatedUser = await refreshUserData();
      if (updatedUser) {
        setUser(updatedUser);
        return updatedUser;
      } else {
        // If refresh fails, logout user
        logout();
        return null;
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
      return null;
    }
  };

  // Update user data locally (for immediate UI updates)
  const updateUser = (updatedUserData) => {
    const newUser = { ...user, ...updatedUserData };
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  // Check if user has required role/permission
  const hasRole = (requiredRole) => {
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

  const value = {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    refreshUser,
    updateUser,
    hasRole,
    // Convenience getters
    userRole: user?.role,
    userName: user?.name,
    userEmail: user?.email
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
