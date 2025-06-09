import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiEye, HiEyeOff, HiMail, HiLockClosed } from 'react-icons/hi';

const Login = () => {
  const { login, isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Get redirect path
  const from = location.state?.from?.pathname || '/';

  // Debug logging
  useEffect(() => {
    console.log('🔍 Login page state:', {
      loading,
      isAuthenticated,
      user: user ? user.name : null,
      from,
      submitting
    });
  }, [loading, isAuthenticated, user, from, submitting]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      console.log(`✅ Already authenticated as ${user.name}, redirecting to:`, from);
      navigate(from, { replace: true });
    }
  }, [loading, isAuthenticated, user, from, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) {
      console.log('⏳ Login already in progress, ignoring submit');
      return;
    }

    setSubmitting(true);

    try {
      console.log('🔑 Starting login process...');
      
      // Call login function
      const userData = await login(formData.email, formData.password);
      
      console.log('✅ Login successful:', userData.name);
      
      // Wait a bit to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to intended page
      console.log('🔄 Navigating to:', from);
      navigate(from, { replace: true });
      
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      // Error is already handled by auth context with toast
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-base-200">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="text-base-content/70">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-base-200">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="text-base-content/70">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-base-200 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">Welcome Back</h1>
              <p className="text-base-content/70 mt-2">Sign in to your account</p>
              {from !== '/' && (
                <p className="text-sm text-info mt-2">
                  You need to login to access that page
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input input-bordered w-full pl-10"
                    placeholder="Enter your email"
                    required
                    disabled={submitting}
                    autoComplete="email"
                  />
                  <HiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input input-bordered w-full pl-10 pr-10"
                    placeholder="Enter your password"
                    required
                    disabled={submitting}
                    autoComplete="current-password"
                  />
                  <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    disabled={submitting}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <HiEyeOff className="w-5 h-5 text-base-content/50" />
                    ) : (
                      <HiEye className="w-5 h-5 text-base-content/50" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || loading}
                className="btn btn-primary w-full"
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="divider">OR</div>

            <div className="text-center">
              <p className="text-sm">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="link link-primary"
                  state={{ from: location.state?.from }}
                >
                  Create one here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;