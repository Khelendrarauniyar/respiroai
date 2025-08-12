import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import ApiService from '../services/ApiService';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');
        
        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // Verify token is still valid
          const isValid = await verifyToken(storedToken);
          
          if (isValid) {
            setToken(storedToken);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear storage
            clearAuth();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await ApiService.get('/auth/profile', {
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`,
        },
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  };

  const login = async (authToken, userData) => {
    try {
      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      // Store in localStorage
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if token exists
      if (token) {
        await ApiService.post('/auth/logout', {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      clearAuth();
      toast.success('Logged out successfully');
    }
  };

  const clearAuth = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    setUser(newUserData);
    localStorage.setItem('auth_user', JSON.stringify(newUserData));
  };

  const refreshUserProfile = async () => {
    if (!token) return false;
    
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        updateUser(userData);
        return true;
      } else {
        // Token might be invalid
        if (response.status === 401) {
          clearAuth();
        }
        return false;
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
      return false;
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isPatient = () => {
    return user?.role === 'patient';
  };

  const getAuthHeaders = () => {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const makeAuthenticatedRequest = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    };

    try {
      // Use ApiService to ensure correct base URL
      const config = {
        ...options,
        headers,
      };

      let response;
      const method = options.method?.toLowerCase() || 'get';
      
      switch (method) {
        case 'post':
          response = await ApiService.post(url, options.body ? JSON.parse(options.body) : {}, config);
          break;
        case 'put':
          response = await ApiService.put(url, options.body ? JSON.parse(options.body) : {}, config);
          break;
        case 'delete':
          response = await ApiService.delete(url, config);
          break;
        default:
          response = await ApiService.get(url, config);
      }

      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        json: async () => response.data,
        data: response.data
      };
    } catch (error) {
      console.error('Authenticated request error:', error);
      
      // Handle token expiration
      if (error.response?.status === 401) {
        clearAuth();
        toast.error('Session expired. Please log in again.');
        return null;
      }
      
      throw error;
    }
  };

  const contextValue = {
    // State
    user,
    token,
    loading,
    isAuthenticated,
    
    // Actions
    login,
    logout,
    updateUser,
    refreshUserProfile,
    
    // Utilities
    isAdmin,
    isPatient,
    getAuthHeaders,
    makeAuthenticatedRequest,
    
    // Internal
    clearAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
