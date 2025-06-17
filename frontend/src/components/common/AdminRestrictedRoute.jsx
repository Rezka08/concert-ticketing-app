import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const AdminRestrictedRoute = ({ children, message = "This page is not available for admin accounts." }) => {
  const { isAuthenticated, isAdmin, loading, user, token } = useAuth();
  const location = useLocation();

  // Debug logging
  useEffect(() => {
    const debugInfo = {
      path: location.pathname,
      loading,
      isAuthenticated,
      isAdmin,
      user: user ? { id: user.user_id, name: user.name, role: user.role } : null,
      hasToken: !!token,
    };
    
    console.log('🚫 AdminRestrictedRoute check:', debugInfo);
  }, [location.pathname, loading, isAuthenticated, isAdmin, user, token]);

  // Show loading spinner while checking auth
  if (loading) {
    console.log('⏳ AdminRestrictedRoute: Still loading auth state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-base-content/70">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check authentication first
  if (!isAuthenticated) {
    console.log('❌ AdminRestrictedRoute: Not authenticated, redirecting to login');
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If user is admin, show access denied
  if (isAdmin) {
    console.log('🚫 AdminRestrictedRoute: Admin access blocked for user orders');
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-6">🚫</div>
          <h1 className="text-2xl font-bold mb-4 text-warning">Access Restricted</h1>
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
            <p className="text-base-content/80 text-sm">
              {message}
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-base-content/70 font-medium">
              Available admin actions:
            </p>
            <div className="grid grid-cols-1 gap-3">
              <a href="/admin" className="btn btn-primary btn-sm">
                📊 Admin Dashboard
              </a>
              <a href="/admin/orders" className="btn btn-secondary btn-sm">
                🔍 Payment Verification
              </a>
              <a href="/admin/users" className="btn btn-accent btn-sm">
                👥 Manage Users
              </a>
              <a href="/admin/concerts" className="btn btn-info btn-sm">
                🎵 Manage Concerts
              </a>
            </div>
            <div className="divider text-xs opacity-50">or</div>
            <a href="/" className="btn btn-ghost btn-sm">
              🏠 Back to Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  // All checks passed - regular user can access
  console.log('✅ AdminRestrictedRoute: Access granted for regular user', user?.name);
  
  return children;
};

export default AdminRestrictedRoute;