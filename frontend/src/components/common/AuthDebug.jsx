import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { testAPIConnection, testTokenValidity } from '../../services/api';
import { authAPI } from '../../services/auth';

const AuthDebug = () => {
  const { user, token, loading, isAuthenticated, isAdmin, refreshAuth, clearAuth, getCurrentToken } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(false);

  const runTokenTests = async () => {
    setTesting(true);
    const results = {};
    
    try {
      // Test 1: Check localStorage
      const lsToken = localStorage.getItem('token');
      const lsUser = localStorage.getItem('user');
      
      results.localStorage = {
        token: lsToken ? {
          exists: true,
          length: lsToken.length,
          preview: lsToken.substring(0, 30) + '...',
          isString: typeof lsToken === 'string',
          hasQuotes: lsToken.startsWith('"') && lsToken.endsWith('"')
        } : { exists: false },
        user: lsUser ? {
          exists: true,
          canParse: (() => {
            try {
              JSON.parse(lsUser);
              return true;
            } catch {
              return false;
            }
          })()
        } : { exists: false }
      };
      
      // Test 2: Check React state
      results.reactState = {
        token: token ? {
          exists: true,
          length: token.length,
          preview: token.substring(0, 30) + '...',
          matchesLS: token === lsToken
        } : { exists: false },
        user: user ? {
          exists: true,
          id: user.user_id,
          name: user.name,
          role: user.role
        } : { exists: false }
      };
      
      // Test 3: Check getCurrentToken function
      const currentToken = getCurrentToken();
      results.getCurrentToken = currentToken ? {
        exists: true,
        length: currentToken.length,
        preview: currentToken.substring(0, 30) + '...',
        matchesLS: currentToken === lsToken,
        matchesState: currentToken === token
      } : { exists: false };
      
      // Test 4: API Connection
      try {
        const apiHealthy = await testAPIConnection();
        results.apiConnection = { healthy: apiHealthy };
      } catch (error) {
        results.apiConnection = { healthy: false, error: error.message };
      }
      
      // Test 5: Token Validity
      if (lsToken) {
        try {
          const tokenValid = await testTokenValidity();
          results.tokenValidity = { valid: tokenValid };
        } catch (error) {
          results.tokenValidity = { valid: false, error: error.message };
        }
      } else {
        results.tokenValidity = { valid: false, reason: 'No token to test' };
      }
      
      // Test 6: Manual Profile Call
      if (lsToken) {
        try {
          const response = await authAPI.getProfile();
          results.profileCall = {
            success: true,
            user: response.data.data.name,
            status: response.status
          };
        } catch (error) {
          results.profileCall = {
            success: false,
            status: error.response?.status,
            message: error.response?.data?.message || error.message
          };
        }
      }
      
    } catch (error) {
      results.error = error.message;
    }
    
    setTestResults(results);
    setTesting(false);
    
    console.log('🧪 Token Debug Results:', results);
  };

  const handleQuickLogin = async () => {
    try {
      setTesting(true);
      
      // Import login function directly
      const { login } = useAuth();
      await login('admin@example.com', 'password');
      
      // Wait a bit then run tests
      setTimeout(() => {
        runTokenTests();
      }, 1000);
      
    } catch (error) {
      console.error('Quick login failed:', error);
      setTesting(false);
    }
  };

  const authState = {
    current: {
      loading,
      isAuthenticated,
      isAdmin,
      user: user ? {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      } : null,
      token: token ? {
        exists: true,
        length: token.length,
        preview: token.substring(0, 30) + '...'
      } : { exists: false }
    },
    localStorage: (() => {
      const lsToken = localStorage.getItem('token');
      const lsUser = localStorage.getItem('user');
      return {
        token: lsToken ? {
          exists: true,
          length: lsToken.length,
          preview: lsToken.substring(0, 30) + '...'
        } : { exists: false },
        user: lsUser ? {
          exists: true,
          name: (() => {
            try {
              return JSON.parse(lsUser).name;
            } catch {
              return 'Parse error';
            }
          })()
        } : { exists: false }
      };
    })(),
    location: {
      pathname: location.pathname,
      search: location.search
    }
  };

  const handleClearAuth = () => {
    console.log('🧹 Manual auth clear triggered from debug');
    clearAuth();
    setTestResults({});
    window.location.reload();
  };

  const handleRefreshAuth = async () => {
    try {
      console.log('🔄 Manual auth refresh triggered from debug');
      await refreshAuth();
    } catch (error) {
      console.error('❌ Manual auth refresh failed:', error);
    }
  };

  const copyDebugInfo = () => {
    const debugInfo = {
      authState,
      testResults,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      location: window.location.href
    };
    
    navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2))
      .then(() => alert('Debug info copied to clipboard!'))
      .catch(() => alert('Failed to copy debug info'));
  };

  const getStatusIcon = (test) => {
    if (testing) return '⏳';
    if (!test) return '❓';
    if (test.success || test.valid || test.healthy || test.exists) return '✅';
    return '❌';
  };

  const getStatusColor = (test) => {
    if (testing) return 'text-warning';
    if (!test) return 'text-neutral';
    if (test.success || test.valid || test.healthy || test.exists) return 'text-success';
    return 'text-error';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`dropdown ${isOpen ? 'dropdown-open' : ''} dropdown-top dropdown-end`}>
        <label 
          tabIndex={0} 
          className="btn btn-circle btn-error btn-sm animate-pulse"
          onClick={() => setIsOpen(!isOpen)}
        >
          🐛
        </label>
        
        {isOpen && (
          <div className="dropdown-content z-[1] p-4 shadow-2xl bg-base-100 rounded-box w-[500px] max-h-[80vh] overflow-auto border-2 border-error">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-error">🔐 Token Debug Center</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost btn-xs"
              >
                ✕
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="mb-4 space-y-2">
              <button 
                onClick={runTokenTests} 
                className="btn btn-primary btn-sm w-full"
                disabled={testing}
              >
                {testing ? '🔄 Testing...' : '🧪 Run Token Tests'}
              </button>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleQuickLogin} 
                  className="btn btn-success btn-xs flex-1"
                  disabled={testing}
                >
                  🔑 Quick Login
                </button>
                
                <button 
                  onClick={handleRefreshAuth} 
                  className="btn btn-info btn-xs flex-1"
                  disabled={loading || testing}
                >
                  🔄 Refresh
                </button>
                
                <button 
                  onClick={handleClearAuth} 
                  className="btn btn-error btn-xs flex-1"
                >
                  🧹 Clear
                </button>
              </div>
            </div>

            {/* Current State */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-primary">Current State</h4>
              <div className="bg-base-200 p-3 rounded text-xs space-y-1">
                <div className="grid grid-cols-2 gap-2">
                  <span>Auth Status:</span>
                  <span className={isAuthenticated ? 'text-success' : 'text-error'}>
                    {isAuthenticated ? '✅ Authenticated' : '❌ Not Auth'}
                  </span>
                  
                  <span>User:</span>
                  <span>{user ? `${user.name} (${user.role})` : '❌ None'}</span>
                  
                  <span>Token State:</span>
                  <span className={token ? 'text-success' : 'text-error'}>
                    {token ? `✅ ${token.length} chars` : '❌ None'}
                  </span>
                  
                  <span>LS Token:</span>
                  <span className={authState.localStorage.token.exists ? 'text-success' : 'text-error'}>
                    {authState.localStorage.token.exists ? `✅ ${authState.localStorage.token.length} chars` : '❌ None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Test Results */}
            {Object.keys(testResults).length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-secondary">Test Results</h4>
                <div className="bg-base-200 p-3 rounded text-xs space-y-2">
                  
                  {/* LocalStorage Test */}
                  <div className="flex items-center justify-between p-2 bg-base-300 rounded">
                    <span>📦 LocalStorage</span>
                    <span className={getStatusColor(testResults.localStorage?.token)}>
                      {getStatusIcon(testResults.localStorage?.token)} 
                      {testResults.localStorage?.token?.exists ? 'OK' : 'Missing'}
                    </span>
                  </div>

                  {/* React State Test */}
                  <div className="flex items-center justify-between p-2 bg-base-300 rounded">
                    <span>⚛️ React State</span>
                    <span className={getStatusColor(testResults.reactState?.token)}>
                      {getStatusIcon(testResults.reactState?.token)} 
                      {testResults.reactState?.token?.exists ? 'OK' : 'Missing'}
                    </span>
                  </div>

                  {/* Token Validity Test */}
                  <div className="flex items-center justify-between p-2 bg-base-300 rounded">
                    <span>🔑 Token Valid</span>
                    <span className={getStatusColor(testResults.tokenValidity)}>
                      {getStatusIcon(testResults.tokenValidity)} 
                      {testResults.tokenValidity?.valid ? 'Valid' : 'Invalid'}
                    </span>
                  </div>

                  {/* Profile API Test */}
                  <div className="flex items-center justify-between p-2 bg-base-300 rounded">
                    <span>👤 Profile API</span>
                    <span className={getStatusColor(testResults.profileCall)}>
                      {getStatusIcon(testResults.profileCall)} 
                      {testResults.profileCall?.success ? 'Success' : `${testResults.profileCall?.status} Error`}
                    </span>
                  </div>

                  {/* API Connection Test */}
                  <div className="flex items-center justify-between p-2 bg-base-300 rounded">
                    <span>🌐 API Connection</span>
                    <span className={getStatusColor(testResults.apiConnection)}>
                      {getStatusIcon(testResults.apiConnection)} 
                      {testResults.apiConnection?.healthy ? 'Healthy' : 'Error'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Error Info */}
            {testResults.profileCall && !testResults.profileCall.success && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-error">❌ Error Details</h4>
                <div className="bg-error/10 p-3 rounded text-xs">
                  <div><strong>Status:</strong> {testResults.profileCall.status}</div>
                  <div><strong>Message:</strong> {testResults.profileCall.message}</div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <button 
                onClick={copyDebugInfo} 
                className="btn btn-ghost btn-xs w-full"
              >
                📋 Copy All Debug Info
              </button>
              
              <button 
                onClick={() => console.log('🔍 Auth State:', authState, 'Test Results:', testResults)} 
                className="btn btn-accent btn-xs w-full"
              >
                📝 Log to Console
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDebug;