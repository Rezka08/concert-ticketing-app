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

// Enhanced storage utility with better error handling and verification
const storage = {
  setItem: (key, value) => {
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
        console.log(`🗑️ Storage removed ${key}`);
      } else {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, stringValue);
        
        // Immediately verify the save
        const saved = localStorage.getItem(key);
        if (saved === stringValue) {
          console.log(`✅ Storage verified ${key}:`, saved ? 'saved successfully' : 'removed');
          return true;
        } else {
          console.error(`❌ Storage verification failed for ${key}:`, { expected: stringValue, actual: saved });
          return false;
        }
      }
    } catch (error) {
      console.error(`❌ Storage set ${key} failed:`, error);
      return false;
    }
  },
  
  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      // For token, return as string. For user, parse as JSON
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
      console.error(`❌ Storage get ${key} failed:`, error);
      return null;
    }
  },
  
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      console.log(`🗑️ Storage removed ${key}`);
    } catch (error) {
      console.error(`❌ Storage remove ${key} failed:`, error);
    }
  },
  
  clear: () => {
    try {
      storage.removeItem('token');
      storage.removeItem('user');
      console.log('🧹 Storage cleared');
    } catch (error) {
      console.error('❌ Storage clear failed:', error);
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Debug function
  const logAuthState = useCallback((action = '') => {
    const state = {
      action,
      loading,
      isAuthenticated: !!user,
      user: user ? { id: user.user_id, name: user.name, role: user.role } : null,
      token: token ? `${token.substring(0, 20)}...` : null,
      localStorage: {
        token: storage.getItem('token') ? `${storage.getItem('token').substring(0, 20)}...` : null,
        user: storage.getItem('user') ? storage.getItem('user').name : null
      }
    };
    console.log(`🔐 Auth [${action}]:`, state);
    return state;
  }, [loading, user, token]);

  // Clear all auth data
  const clearAuth = useCallback(() => {
    console.log('🧹 Clearing auth data...');
    setUser(null);
    setToken(null);
    storage.clear();
    logAuthState('cleared');
  }, [logAuthState]);

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      console.log('🚀 Initializing auth...');
      
      const savedToken = storage.getItem('token');
      const savedUser = storage.getItem('user');
      
      console.log('💾 Saved data:', {
        token: savedToken ? `${savedToken.substring(0, 20)}...` : 'none',
        user: savedUser ? savedUser.name : 'none'
      });
      
      if (savedToken && savedUser) {
        try {
          console.log('🔄 Verifying saved token...');
          
          // Set token in state first for API calls
          setToken(savedToken);
          
          // Wait a bit to ensure state is updated
          await new Promise(resolve => setTimeout(resolve, 100));
          
          console.log('📞 Making profile API call with token...');
          
          // Verify token is still valid by calling profile endpoint
          const response = await authAPI.getProfile();
          const currentUser = response.data.data;
          
          console.log('✅ Token verified successfully, user:', currentUser.name);
          
          // Update state with fresh user data
          setUser(currentUser);
          
          // Update localStorage with fresh user data
          storage.setItem('user', currentUser);
          
          logAuthState('initialized');
          
        } catch (error) {
          console.log('❌ Token verification failed:', error.response?.status, error.message);
          console.log('🧹 Clearing invalid auth data...');
          clearAuth();
        }
      } else {
        console.log('ℹ️ No saved auth data found');
        logAuthState('no-saved-data');
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      clearAuth();
    } finally {
      setLoading(false);
      console.log('✅ Auth initialization complete');
    }
  }, [clearAuth, logAuthState]);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Login function with better token handling
  const login = useCallback(async (email, password) => {
    try {
      console.log('🔑 Attempting login for:', email);
      
      const response = await authAPI.login(email, password);
      const { user: userData, access_token } = response.data.data;
      
      console.log('📨 Login response received:', {
        user: userData ? userData.name : 'missing',
        token: access_token ? `${access_token.substring(0, 20)}...` : 'missing',
        tokenLength: access_token ? access_token.length : 0
      });
      
      if (!userData || !access_token) {
        throw new Error('Invalid response: missing user or token');
      }
      
      console.log('💾 Saving auth data to localStorage...');
      
      // Save to localStorage first
      const tokenSaved = storage.setItem('token', access_token);
      const userSaved = storage.setItem('user', userData);
      
      if (!tokenSaved || !userSaved) {
        throw new Error('Failed to save auth data to localStorage');
      }
      
      // Verify localStorage save
      const verifyToken = storage.getItem('token');
      const verifyUser = storage.getItem('user');
      
      console.log('🔍 Verification check:', {
        tokenMatch: verifyToken === access_token,
        userMatch: verifyUser?.user_id === userData.user_id,
        tokenLength: verifyToken ? verifyToken.length : 0
      });
      
      if (verifyToken !== access_token) {
        throw new Error('Token verification failed - localStorage save issue');
      }
      
      // Update state after successful localStorage save
      console.log('📝 Updating React state...');
      setToken(access_token);
      setUser(userData);
      
      // Wait a bit to ensure state is updated before making API calls
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('✅ Login completed successfully');
      logAuthState('login-success');
      toast.success(`Welcome back, ${userData.name}!`);
      
      return userData;
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Clean up on error
      clearAuth();
      
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  }, [logAuthState, clearAuth]);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      
      const response = await authAPI.register(userData);
      const { user: newUser, access_token } = response.data.data;
      
      console.log('📨 Registration response:', {
        user: newUser ? newUser.name : 'missing',
        token: access_token ? `${access_token.substring(0, 20)}...` : 'missing'
      });
      
      if (!newUser || !access_token) {
        throw new Error('Invalid response: missing user or token');
      }
      
      // Save to localStorage first
      const tokenSaved = storage.setItem('token', access_token);
      const userSaved = storage.setItem('user', newUser);
      
      if (!tokenSaved || !userSaved) {
        throw new Error('Failed to save auth data to localStorage');
      }
      
      // Update state
      setToken(access_token);
      setUser(newUser);
      
      logAuthState('register-success');
      toast.success(`Welcome to ConcertTix, ${newUser.name}!`);
      
      return newUser;
    } catch (error) {
      console.error('❌ Registration error:', error);
      clearAuth();
      
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  }, [logAuthState, clearAuth]);

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
      
      logAuthState('profile-updated');
      toast.success('Profile updated successfully!');
      
      return updatedUser;
    } catch (error) {
      console.error('❌ Profile update error:', error);
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      throw error;
    }
  }, [logAuthState]);

  // Refresh auth function
  const refreshAuth = useCallback(async () => {
    try {
      console.log('🔄 Refreshing auth...');
      const response = await authAPI.getProfile();
      const currentUser = response.data.data;
      
      setUser(currentUser);
      storage.setItem('user', currentUser);
      
      logAuthState('refreshed');
      return currentUser;
    } catch (error) {
      console.error('❌ Auth refresh failed:', error);
      clearAuth();
      throw error;
    }
  }, [clearAuth, logAuthState]);

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