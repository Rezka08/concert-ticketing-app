import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading, user, token } = useAuth();
  const location = useLocation();

  // Debug logging
  useEffect(() => {
    const debugInfo = {
      path: location.pathname,
      loading,
      isAuthenticated,
      isAdmin,
      adminOnly,
      user: user ? { id: user.user_id, name: user.name, role: user.role } : null,
      hasToken: !!token,
      localStorage: {
        token: localStorage.getItem('token') ? 'exists' : 'none',
        user: localStorage.getItem('user') ? 'exists' : 'none'
      }
    };
    
    console.log('🛡️ ProtectedRoute check:', debugInfo);
  }, [location.pathname, loading, isAuthenticated, isAdmin, adminOnly, user, token]);

  // Show loading spinner while checking auth
  if (loading) {
    console.log('⏳ ProtectedRoute: Still loading auth state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-base-content/70">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    console.log('❌ ProtectedRoute: Not authenticated, redirecting to login');
    console.log('🔄 Saving intended destination:', location.pathname);
    
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check admin requirement
  if (adminOnly && !isAdmin) {
    console.log('❌ ProtectedRoute: Admin access required, user role:', user?.role);
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-base-content/70 mb-4">
            You need admin privileges to access this page.
          </p>
          <a href="/" className="btn btn-primary">
            Go Home
          </a>
        </div>
      </div>
    );
  }

  // All checks passed
  console.log('✅ ProtectedRoute: Access granted for', user?.name);
  
  return children;
};

export default ProtectedRoute;