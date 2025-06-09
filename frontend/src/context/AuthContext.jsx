import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Simplified storage utility
const storage = {
  setItem: (key, value) => {
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed ${key} from storage`);
      } else {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, stringValue);
        console.log(`💾 Saved ${key} to storage`);
      }
      return true;
    } catch (error) {
      console.error(`❌ Storage error for ${key}:`, error);
      return false;
    }
  },
  
  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      if (key === 'token') {
        return item;
      } else {
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      }
    } catch (error) {
      console.error(`❌ Storage get error for ${key}:`, error);
      return null;
    }
  },
  
  clear: () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('🧹 Storage cleared');
    } catch (error) {
      console.error('❌ Storage clear error:', error);
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Clear all auth data
  const clearAuth = useCallback(() => {
    console.log('🧹 Clearing auth data...');
    setUser(null);
    setToken(null);
    storage.clear();
  }, []);

  // Initialize auth state - SIMPLIFIED
  const initializeAuth = useCallback(async () => {
    try {
      console.log('🚀 Initializing auth...');
      
      const savedToken = storage.getItem('token');
      const savedUser = storage.getItem('user');
      
      if (savedToken && savedUser) {
        console.log('💾 Found saved auth data, verifying...');
        
        // Check token format first
        try {
          const payload = JSON.parse(atob(savedToken.split('.')[1]));
          if (typeof payload.sub !== 'string') {
            console.log('❌ Token has invalid subject type (not string), clearing...');
            clearAuth();
            return;
          }
        } catch (tokenParseError) {
          console.log('❌ Token format is corrupted, clearing...');
          clearAuth();
          return;
        }
        
        // Set token first for API calls
        setToken(savedToken);
        
        try {
          // Verify token by calling profile endpoint
          const response = await authAPI.getProfile();
          const currentUser = response.data.data;
          
          console.log('✅ Token verified, user:', currentUser.name);
          
          // Update state with fresh user data
          setUser(currentUser);
          storage.setItem('user', currentUser);
          
        } catch (error) {
          console.log('❌ Token verification failed:', error.response?.status);
          
          // Check if it's the "Subject must be a string" error
          if (error.response?.data?.error?.includes('Subject must be a string') || 
              error.response?.data?.error?.includes('Token format incompatible')) {
            console.log('🚨 Detected old token format - clearing and requiring re-login');
          }
          
          clearAuth();
        }
      } else {
        console.log('ℹ️ No saved auth data found');
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [clearAuth]);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Login function - SIMPLIFIED
  const login = useCallback(async (email, password) => {
    try {
      console.log('🔑 Attempting login for:', email);
      
      // Clear any existing auth first
      clearAuth();
      
      const response = await authAPI.login(email, password);
      
      console.log('📨 Login response status:', response.status);
      console.log('📨 Login response data structure:', {
        hasData: !!response.data,
        hasDataData: !!response.data?.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        dataDataKeys: response.data?.data ? Object.keys(response.data.data) : []
      });
      
      const { user: userData, access_token } = response.data.data;
      
      if (!userData || !access_token) {
        throw new Error('Invalid response: missing user or token');
      }
      
      console.log('📝 Saving auth data...', {
        userName: userData.name,
        tokenLength: access_token.length
      });
      
      // Save to localStorage
      const tokenSaved = storage.setItem('token', access_token);
      const userSaved = storage.setItem('user', userData);
      
      if (!tokenSaved || !userSaved) {
        throw new Error('Failed to save auth data');
      }
      
      // Update state
      setToken(access_token);
      setUser(userData);
      
      console.log('✅ Login completed successfully');
      toast.success(`Welcome back, ${userData.name}!`);
      
      return userData;
    } catch (error) {
      console.error('❌ Login error:', error);
      clearAuth();
      
      // Enhanced error message
      let message = 'Login failed';
      if (error.response?.status === 401) {
        message = 'Invalid email or password';
      } else if (error.response?.status === 500) {
        message = 'Server error. Please try again.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message);
      throw error;
    }
  }, [clearAuth]);

  // Register function - SIMPLIFIED
  const register = useCallback(async (userData) => {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      
      const response = await authAPI.register(userData);
      const { user: newUser, access_token } = response.data.data;
      
      if (!newUser || !access_token) {
        throw new Error('Invalid response: missing user or token');
      }
      
      // Save to localStorage
      storage.setItem('token', access_token);
      storage.setItem('user', newUser);
      
      // Update state
      setToken(access_token);
      setUser(newUser);
      
      toast.success(`Welcome to ConcertTix, ${newUser.name}!`);
      return newUser;
    } catch (error) {
      console.error('❌ Registration error:', error);
      clearAuth();
      
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  }, [clearAuth]);

  // Logout function
  const logout = useCallback(() => {
    console.log('👋 Logging out...');
    clearAuth();
    toast.success('Logged out successfully');
  }, [clearAuth]);

  // Update profile function
  const updateProfile = useCallback(async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.data;
      
      setUser(updatedUser);
      storage.setItem('user', updatedUser);
      
      toast.success('Profile updated successfully!');
      return updatedUser;
    } catch (error) {
      console.error('❌ Profile update error:', error);
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      throw error;
    }
  }, []);

  // Refresh auth function
  const refreshAuth = useCallback(async () => {
    try {
      console.log('🔄 Refreshing auth...');
      const response = await authAPI.getProfile();
      const currentUser = response.data.data;
      
      setUser(currentUser);
      storage.setItem('user', currentUser);
      
      return currentUser;
    } catch (error) {
      console.error('❌ Auth refresh failed:', error);
      clearAuth();
      throw error;
    }
  }, [clearAuth]);

  // Get current token function
  const getCurrentToken = useCallback(() => {
    return token || storage.getItem('token');
  }, [token]);

  // Context value
  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshAuth,
    clearAuth,
    getCurrentToken,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};