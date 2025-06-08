import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/auth';
import { testAPIConnection, testTokenValidity } from '../services/api';
import TokenTest from '../components/debug/TokenTest';

const AuthTest = () => {
  const { user, token, login, logout, isAuthenticated, isAdmin, getCurrentToken } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const addResult = (test, result, error = null) => {
    setTestResults(prev => ({
      ...prev,
      [test]: { result, error, timestamp: new Date().toLocaleTimeString() }
    }));
  };

  const testLogin = async () => {
    try {
      setTesting(true);
      console.log('🧪 Testing login...');
      
      await login('admin@example.com', 'password');
      addResult('login', 'success');
      
      // Wait a bit and check if state is updated
      setTimeout(() => {
        const tokenExists = !!localStorage.getItem('token');
        const userExists = !!localStorage.getItem('user');
        const stateToken = !!getCurrentToken();
        const stateUser = !!user;
        
        addResult('login-persistence', 
          tokenExists && userExists && stateToken && stateUser ? 'success' : 'failed', 
          `LS Token: ${tokenExists}, LS User: ${userExists}, State Token: ${stateToken}, State User: ${stateUser}`);
      }, 1000);
      
    } catch (error) {
      addResult('login', 'failed', error.message);
    } finally {
      setTesting(false);
    }
  };

  const testAPICall = async (endpoint, description) => {
    try {
      console.log(`🧪 Testing API: ${description}...`);
      
      let response;
      switch (endpoint) {
        case 'profile':
          response = await authAPI.getProfile();
          break;
        case 'token-check':
          const tokenValid = await testTokenValidity();
          addResult(`api-${endpoint}`, tokenValid ? 'success' : 'failed', `Valid: ${tokenValid}`);
          return;
        default:
          throw new Error('Unknown endpoint');
      }
      
      addResult(`api-${endpoint}`, 'success', `Status: ${response.status}`);
    } catch (error) {
      addResult(`api-${endpoint}`, 'failed', 
        `${error.response?.status || 'Network'}: ${error.response?.data?.message || error.message}`);
    }
  };

  const testLogout = () => {
    try {
      console.log('🧪 Testing logout...');
      logout();
      
      // Check if localStorage is cleared
      setTimeout(() => {
        const tokenExists = !!localStorage.getItem('token');
        const userExists = !!localStorage.getItem('user');
        const stateToken = !!getCurrentToken();
        const stateUser = !!user;
        
        addResult('logout', 
          !tokenExists && !userExists && !stateToken && !stateUser ? 'success' : 'failed',
          `LS Token: ${tokenExists}, LS User: ${userExists}, State Token: ${stateToken}, State User: ${stateUser}`);
      }, 500);
      
    } catch (error) {
      addResult('logout', 'failed', error.message);
    }
  };

  const clearResults = () => {
    setTestResults({});
  };

  const runQuickTests = async () => {
    clearResults();
    
    // Test API connection
    try {
      const apiHealthy = await testAPIConnection();
      addResult('api-connection', apiHealthy ? 'success' : 'failed', `Healthy: ${apiHealthy}`);
    } catch (error) {
      addResult('api-connection', 'failed', error.message);
    }
    
    // Test current token if exists
    const currentToken = getCurrentToken();
    if (currentToken) {
      await testAPICall('token-check', 'Token Validity');
      await testAPICall('profile', 'Profile API');
    }
  };

  const runFullFlow = async () => {
    clearResults();
    
    // Test logout first
    testLogout();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test login
    await testLogin();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test API calls if authenticated
    if (isAuthenticated) {
      await testAPICall('profile', 'Get Profile');
      await testAPICall('token-check', 'Token Validity');
    }
    
    // Test logout
    await new Promise(resolve => setTimeout(resolve, 1000));
    testLogout();
  };

  const getResultIcon = (result) => {
    switch (result?.result) {
      case 'success': return '✅';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  const getResultColor = (result) => {
    switch (result?.result) {
      case 'success': return 'text-success';
      case 'failed': return 'text-error';
      default: return 'text-warning';
    }
  };

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">🧪 Authentication Debug Center</h1>
          <p className="text-base-content/70">
            Comprehensive tools for debugging authentication issues
          </p>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6">
          <button 
            className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab ${activeTab === 'token-test' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('token-test')}
          >
            🔑 Token Test
          </button>
          <button 
            className={`tab ${activeTab === 'manual-test' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('manual-test')}
          >
            🔧 Manual Tests
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Current State */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">Current Authentication State</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="stat">
                    <div className="stat-title">Authenticated</div>
                    <div className={`stat-value text-2xl ${isAuthenticated ? 'text-success' : 'text-error'}`}>
                      {isAuthenticated ? '✅ Yes' : '❌ No'}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">User</div>
                    <div className="stat-value text-lg">{user ? user.name : 'None'}</div>
                    <div className="stat-desc">{user ? `Role: ${user.role}` : 'Not logged in'}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Token</div>
                    <div className={`stat-value text-lg ${token ? 'text-success' : 'text-error'}`}>
                      {token ? `${token.length} chars` : 'None'}
                    </div>
                  </div>
                </div>
                
                <div className="divider"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">LocalStorage</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Token:</span>
                        <span className={localStorage.getItem('token') ? 'text-success' : 'text-error'}>
                          {localStorage.getItem('token') ? `${localStorage.getItem('token').length} chars` : 'None'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>User:</span>
                        <span className={localStorage.getItem('user') ? 'text-success' : 'text-error'}>
                          {localStorage.getItem('user') ? 'Exists' : 'None'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Quick Actions</h3>
                    <div className="space-y-2">
                      <button onClick={runQuickTests} className="btn btn-primary btn-sm w-full">
                        🔍 Quick Health Check
                      </button>
                      <button onClick={runFullFlow} className="btn btn-secondary btn-sm w-full">
                        🚀 Full Flow Test
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Test Results */}
            {Object.keys(testResults).length > 0 && (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="card-title">Test Results</h2>
                    <button onClick={clearResults} className="btn btn-ghost btn-sm">
                      🧹 Clear
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(testResults).map(([test, result]) => (
                      <div key={test} className="flex items-center justify-between p-3 bg-base-200 rounded">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getResultIcon(result)}</span>
                          <div>
                            <h4 className="font-semibold capitalize">{test.replace('-', ' ')}</h4>
                            {result.error && (
                              <p className="text-sm text-base-content/70">{result.error}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${getResultColor(result)}`}>
                            {result.result.toUpperCase()}
                          </div>
                          <div className="text-xs text-base-content/50">
                            {result.timestamp}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'token-test' && (
          <TokenTest />
        )}

        {activeTab === 'manual-test' && (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">Manual Test Controls</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button 
                  onClick={testLogin} 
                  className="btn btn-primary"
                  disabled={testing}
                >
                  🔑 Test Login
                </button>
                
                <button 
                  onClick={() => testAPICall('profile', 'Get Profile')} 
                  className="btn btn-secondary"
                  disabled={!isAuthenticated}
                >
                  👤 Test Profile API
                </button>
                
                <button 
                  onClick={() => testAPICall('token-check', 'Token Validity')} 
                  className="btn btn-accent"
                  disabled={!getCurrentToken()}
                >
                  🔍 Test Token Validity
                </button>
                
                <button 
                  onClick={testLogout} 
                  className="btn btn-error"
                  disabled={!isAuthenticated}
                >
                  👋 Test Logout
                </button>
                
                <button 
                  onClick={async () => {
                    const healthy = await testAPIConnection();
                    addResult('api-connection', healthy ? 'success' : 'failed', `Healthy: ${healthy}`);
                  }} 
                  className="btn btn-info"
                >
                  🌐 Test API Connection
                </button>
                
                <button 
                  onClick={clearResults} 
                  className="btn btn-ghost"
                >
                  🧹 Clear Results
                </button>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                <div className="text-sm space-y-1">
                  <p>• <strong>Test Login:</strong> Attempts login with admin@example.com/password</p>
                  <p>• <strong>Test Profile API:</strong> Makes authenticated API call to get user profile</p>
                  <p>• <strong>Test Token Validity:</strong> Validates current token format and backend acceptance</p>
                  <p>• <strong>Test Logout:</strong> Clears all auth data and verifies cleanup</p>
                  <p>• <strong>Test API Connection:</strong> Checks if backend is reachable</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthTest;