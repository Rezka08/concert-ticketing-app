import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/auth';
import { testAPIConnection, testTokenValidity } from '../../services/api';

const TokenTest = () => {
  const { login, logout, user, token, getCurrentToken } = useAuth();
  const [testStep, setTestStep] = useState(0);
  const [results, setResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const addResult = (step, title, success, details) => {
    const result = {
      step,
      title,
      success,
      details,
      timestamp: new Date().toLocaleTimeString()
    };
    setResults(prev => [...prev, result]);
    console.log(`🧪 Test ${step}: ${title}`, result);
    return result;
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const runStepByStepTest = async () => {
    setTesting(true);
    setResults([]);
    setTestStep(0);

    try {
      // Step 1: Clear any existing auth
      setTestStep(1);
      logout();
      await sleep(500);
      
      const initialToken = localStorage.getItem('token');
      addResult(1, 'Clear Auth', !initialToken, {
        tokenCleared: !initialToken,
        userCleared: !localStorage.getItem('user')
      });

      // Step 2: Test API Connection
      setTestStep(2);
      const apiHealthy = await testAPIConnection();
      addResult(2, 'API Connection', apiHealthy, {
        baseUrl: 'http://localhost:5001/api',
        healthy: apiHealthy
      });

      if (!apiHealthy) {
        addResult(0, 'CRITICAL', false, { error: 'API is not accessible. Check if backend is running on port 5001.' });
        setTesting(false);
        return;
      }

      // Step 3: Attempt Login
      setTestStep(3);
      let loginSuccess = false;
      let loginResponse = null;
      
      try {
        const response = await authAPI.login('admin@example.com', 'password');
        loginResponse = response.data;
        loginSuccess = !!(loginResponse?.data?.access_token && loginResponse?.data?.user);
        
        addResult(3, 'Login API Call', loginSuccess, {
          status: response.status,
          hasToken: !!loginResponse?.data?.access_token,
          hasUser: !!loginResponse?.data?.user,
          tokenLength: loginResponse?.data?.access_token?.length || 0
        });
      } catch (error) {
        addResult(3, 'Login API Call', false, {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        setTesting(false);
        return;
      }

      // Step 4: Check Auth Context Login
      setTestStep(4);
      let contextLoginSuccess = false;
      try {
        await login('admin@example.com', 'password');
        await sleep(1000); // Wait for state updates
        
        const contextToken = getCurrentToken();
        const contextUser = user;
        
        contextLoginSuccess = !!(contextToken && contextUser);
        
        addResult(4, 'Auth Context Login', contextLoginSuccess, {
          contextHasToken: !!contextToken,
          contextHasUser: !!contextUser,
          tokenLength: contextToken?.length || 0,
          userName: contextUser?.name
        });
      } catch (error) {
        addResult(4, 'Auth Context Login', false, {
          error: error.message
        });
      }

      // Step 5: Check LocalStorage
      setTestStep(5);
      await sleep(500);
      
      const lsToken = localStorage.getItem('token');
      const lsUser = localStorage.getItem('user');
      let lsUserParsed = null;
      
      try {
        lsUserParsed = lsUser ? JSON.parse(lsUser) : null;
      } catch (error) {
        // User data is corrupted
      }
      
      const lsSuccess = !!(lsToken && lsUserParsed);
      
      addResult(5, 'LocalStorage Check', lsSuccess, {
        hasToken: !!lsToken,
        tokenLength: lsToken?.length || 0,
        hasUser: !!lsUser,
        userParseable: !!lsUserParsed,
        userName: lsUserParsed?.name
      });

      // Step 6: Test Token Format
      setTestStep(6);
      let tokenFormatOk = false;
      
      if (lsToken) {
        const parts = lsToken.split('.');
        tokenFormatOk = parts.length === 3 && lsToken.length > 50;
        
        addResult(6, 'Token Format Check', tokenFormatOk, {
          tokenParts: parts.length,
          expectedParts: 3,
          tokenLength: lsToken.length,
          preview: lsToken.substring(0, 50) + '...'
        });
      } else {
        addResult(6, 'Token Format Check', false, {
          error: 'No token to check'
        });
      }

      // Step 7: Test API Call with Token
      setTestStep(7);
      let apiCallSuccess = false;
      
      if (lsToken) {
        try {
          const response = await authAPI.getProfile();
          apiCallSuccess = response.status === 200 && response.data?.data;
          
          addResult(7, 'API Call with Token', apiCallSuccess, {
            status: response.status,
            hasUserData: !!response.data?.data,
            userName: response.data?.data?.name
          });
        } catch (error) {
          addResult(7, 'API Call with Token', false, {
            status: error.response?.status,
            error: error.response?.data?.message || error.message,
            sentToken: !!error.config?.headers?.Authorization
          });
        }
      } else {
        addResult(7, 'API Call with Token', false, {
          error: 'No token available for API call'
        });
      }

      // Step 8: Test Manual Token Validity
      setTestStep(8);
      let manualTokenValid = false;
      
      if (lsToken) {
        try {
          manualTokenValid = await testTokenValidity();
          addResult(8, 'Manual Token Test', manualTokenValid, {
            valid: manualTokenValid
          });
        } catch (error) {
          addResult(8, 'Manual Token Test', false, {
            error: error.message
          });
        }
      } else {
        addResult(8, 'Manual Token Test', false, {
          error: 'No token to test'
        });
      }

      // Final Summary
      const successfulSteps = results.filter(r => r.success).length;
      const totalSteps = results.length;
      
      addResult(9, 'Test Summary', successfulSteps === totalSteps, {
        successfulSteps,
        totalSteps,
        overallSuccess: successfulSteps === totalSteps
      });

    } catch (error) {
      addResult(testStep, 'Unexpected Error', false, {
        error: error.message,
        stack: error.stack
      });
    } finally {
      setTesting(false);
      setTestStep(0);
    }
  };

  const getStepIcon = (result) => {
    if (result.success) return '✅';
    return '❌';
  };

  const getStepColor = (result) => {
    if (result.success) return 'text-success';
    return 'text-error';
  };

  return (
    <div className="card bg-base-100 shadow-xl max-w-4xl mx-auto">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">🧪 Token Authentication Test Suite</h2>
        
        <div className="mb-6">
          <p className="text-base-content/70 mb-4">
            This test will help diagnose token authentication issues step by step.
          </p>
          
          <button 
            onClick={runStepByStepTest}
            className="btn btn-primary btn-lg"
            disabled={testing}
          >
            {testing ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Running Tests... (Step {testStep}/8)
              </>
            ) : (
              '🚀 Run Full Token Test'
            )}
          </button>
        </div>

        {/* Progress Bar */}
        {testing && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{testStep}/8</span>
            </div>
            <progress 
              className="progress progress-primary w-full" 
              value={testStep} 
              max="8"
            ></progress>
          </div>
        )}

        {/* Test Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Test Results:</h3>
            
            {results.map((result, index) => (
              <div key={index} className={`alert ${result.success ? 'alert-success' : 'alert-error'}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getStepIcon(result)}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold">
                        Step {result.step}: {result.title}
                      </h4>
                      <div className="text-sm mt-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(result.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className="font-mono">
                                {typeof value === 'boolean' 
                                  ? (value ? '✅ Yes' : '❌ No')
                                  : String(value)
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-base-content/50">
                      {result.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-base-200 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">What This Test Checks:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>Clear Auth:</strong> Ensures we start with clean state</li>
            <li><strong>API Connection:</strong> Verifies backend is reachable</li>
            <li><strong>Login API:</strong> Tests raw login API call</li>
            <li><strong>Auth Context:</strong> Tests React context login flow</li>
            <li><strong>LocalStorage:</strong> Checks if data is saved properly</li>
            <li><strong>Token Format:</strong> Validates JWT token structure</li>
            <li><strong>API with Token:</strong> Tests authenticated API call</li>
            <li><strong>Token Validity:</strong> Manual token validation test</li>
          </ol>
          
          <div className="mt-4 p-4 bg-warning/10 rounded">
            <h4 className="font-semibold text-warning">Common Issues:</h4>
            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
              <li>Backend not running (Step 2 fails)</li>
              <li>Incorrect credentials (Step 3 fails)</li>
              <li>LocalStorage issues (Step 5 fails)</li>
              <li>Token format problems (Step 6 fails)</li>
              <li>API token transmission issues (Step 7 fails)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenTest;