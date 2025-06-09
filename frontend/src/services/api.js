import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

console.log('🌐 API Base URL:', API_BASE_URL);

// Utility function to get token safely with multiple fallbacks
const getToken = () => {
  try {
    let token = localStorage.getItem('token');
    
    // Remove any quotes that might be added
    if (token && (token.startsWith('"') && token.endsWith('"'))) {
      token = token.slice(1, -1);
    }
    
    return token;
  } catch (error) {
    console.error('❌ Error getting token from localStorage:', error);
    return null;
  }
};

// Utility function to clear auth data safely
const clearAuthData = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('🧹 Auth data cleared from localStorage');
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
  }
};

// Utility function to validate token format
const isValidToken = (token) => {
  if (!token || typeof token !== 'string') return false;
  
  // JWT tokens have 3 parts separated by dots
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.log('❌ Invalid token format: not JWT structure');
    return false;
  }
  
  // Check if token is not too short or too long
  if (token.length < 50 || token.length > 2000) {
    console.log('❌ Invalid token format: suspicious length', token.length);
    return false;
  }
  
  // Check JWT subject format
  try {
    const payload = JSON.parse(atob(parts[1]));
    if (payload.sub && typeof payload.sub !== 'string') {
      console.log('❌ Invalid token: subject is not a string', typeof payload.sub);
      return false;
    }
  } catch (e) {
    console.log('❌ Invalid token: cannot decode payload');
    return false;
  }
  
  return true;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    if (token) {
      if (isValidToken(token)) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`🔑 Token attached: ${token.substring(0, 20)}... (length: ${token.length})`);
        console.log(`📋 Full Authorization header: Bearer ${token.substring(0, 20)}...`);
      } else {
        console.log('❌ Invalid token found, clearing and not attaching to request');
        clearAuthData();
      }
    } else {
      console.log(`ℹ️ No token available for ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    // Log all headers for debugging
    console.log('📋 Request headers:', {
      'Content-Type': config.headers['Content-Type'],
      'Authorization': config.headers.Authorization ? 'Bearer [token]' : 'none',
      'Accept': config.headers.Accept
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and responses
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`📥 API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : []
    });
    
    return response;
  },
  (error) => {
    // Enhanced error logging
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();
    const responseData = error.response?.data;
    
    console.error(`❌ API Error: ${method} ${url}`, {
      status,
      statusText: error.response?.statusText,
      message: responseData?.message || error.message,
      data: responseData,
      requestHeaders: error.config?.headers
    });
    
    // Special handling for 401 Unauthorized
    if (status === 401) {
      console.log('🚨 401 Unauthorized - Token might be invalid or expired');
      
      const sentToken = error.config?.headers?.Authorization;
      if (sentToken) {
        console.log('🔍 We sent a token but got 401:', sentToken.substring(0, 30) + '...');
        console.log('🧐 This suggests the token is invalid or expired');
        
        // Check for specific JWT errors
        if (responseData?.error) {
          const errorMsg = responseData.error.toLowerCase();
          
          if (errorMsg.includes('subject must be a string') || 
              errorMsg.includes('token format incompatible')) {
            console.log('🚨 DETECTED: Old token format issue - JWT subject is not string');
            console.log('🔧 This happens when backend expects string identity but token has integer');
            console.log('🔄 User needs to login again to get new token format');
          } else if (errorMsg.includes('invalid token') || errorMsg.includes('decode')) {
            console.log('🚨 DETECTED: Token decode/format error');
          } else if (errorMsg.includes('expired')) {
            console.log('🚨 DETECTED: Token has expired');
          } else if (errorMsg.includes('signature')) {
            console.log('🚨 DETECTED: Token signature verification failed');
          }
        }
        
        clearAuthData();
        
        // Only redirect if not already on auth pages
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
          console.log('🔄 Redirecting to login page');
          
          // Use a timeout to prevent immediate redirect conflicts
          setTimeout(() => {
            window.location.href = '/login';
          }, 500);
        }
      } else {
        console.log('ℹ️ No token was sent with this request (this might be expected)');
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network error or server is down:', error.message);
      
      // Check if it's a timeout
      if (error.code === 'ECONNABORTED') {
        console.error('⏰ Request timeout');
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to test API connectivity
export const testAPIConnection = async () => {
  try {
    console.log('🧪 Testing API connection...');
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    const isHealthy = response.ok;
    console.log('🏥 API Health:', isHealthy ? 'OK' : 'Not OK');
    return isHealthy;
  } catch (error) {
    console.error('❌ API health check failed:', error);
    return false;
  }
};

// Helper function to manually test token validity
export const testTokenValidity = async () => {
  try {
    const token = getToken();
    if (!token) {
      console.log('🔍 No token to test');
      return false;
    }
    
    console.log('🧪 Testing token validity...');
    console.log('🔑 Token preview:', token.substring(0, 50) + '...');
    
    // Check format first
    if (!isValidToken(token)) {
      console.log('❌ Token format is invalid');
      return false;
    }
    
    // Make a simple profile call to test
    const response = await api.get('/auth/profile');
    console.log('✅ Token is valid');
    return true;
  } catch (error) {
    console.log('❌ Token is invalid:', error.response?.status, error.message);
    return false;
  }
};

// Helper function to retry failed requests
export const retryRequest = (originalRequest, maxRetries = 3) => {
  return new Promise((resolve, reject) => {
    let retryCount = 0;
    
    const retry = () => {
      api(originalRequest)
        .then(resolve)
        .catch((error) => {
          retryCount++;
          if (retryCount < maxRetries && error.response?.status !== 401) {
            console.log(`🔄 Retrying request (${retryCount}/${maxRetries}):`, originalRequest.url);
            setTimeout(retry, 1000 * retryCount); // Exponential backoff
          } else {
            reject(error);
          }
        });
    };
    
    retry();
  });
};

export default api;