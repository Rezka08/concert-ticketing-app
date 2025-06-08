import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiMenu, HiX, HiUser, HiTicket, HiLogout, HiCog } from 'react-icons/hi';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Debug logging
  useEffect(() => {
    const debugInfo = {
      path: location.pathname,
      loading,
      isAuthenticated,
      isAdmin,
      user: user ? { id: user.user_id, name: user.name, role: user.role } : null
    };
    
    console.log('🧭 Navbar render:', debugInfo);
  }, [location.pathname, loading, isAuthenticated, isAdmin, user]);

  const handleLogout = () => {
    console.log('👋 Navbar: Logout clicked');
    logout();
    setIsMenuOpen(false);
    navigate('/', { replace: true });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Show loading navbar while checking auth
  if (loading) {
    return (
      <div className="navbar bg-white shadow-lg sticky top-0 z-50">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost normal-case text-xl font-bold text-primary">
            🎵 ConcertTix
          </Link>
        </div>
        
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><Link to="/concerts" className="hover:text-primary">Concerts</Link></li>
          </ul>
        </div>
        
        <div className="navbar-end">
          <div className="flex items-center gap-2">
            <div className="loading loading-spinner loading-sm"></div>
            <span className="text-sm text-base-content/70">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="navbar bg-white shadow-lg sticky top-0 z-50">
      <div className="navbar-start">
        <Link 
          to="/" 
          className="btn btn-ghost normal-case text-xl font-bold text-primary"
          onClick={closeMenu}
        >
          🎵 ConcertTix
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link 
              to="/" 
              className={`hover:text-primary ${location.pathname === '/' ? 'text-primary' : ''}`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              to="/concerts" 
              className={`hover:text-primary ${location.pathname === '/concerts' ? 'text-primary' : ''}`}
            >
              Concerts
            </Link>
          </li>
          {isAuthenticated && (
            <li>
              <Link 
                to="/orders" 
                className={`hover:text-primary ${location.pathname === '/orders' ? 'text-primary' : ''}`}
              >
                My Orders
              </Link>
            </li>
          )}
          {isAdmin && (
            <li>
              <Link 
                to="/admin" 
                className={`hover:text-primary ${location.pathname.startsWith('/admin') ? 'text-primary' : ''}`}
              >
                Admin Panel
              </Link>
            </li>
          )}
        </ul>
      </div>

      <div className="navbar-end">
        {isAuthenticated && user ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-primary text-white flex items-center justify-center">
                <HiUser className="w-6 h-6" />
              </div>
            </label>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li className="menu-title">
                <span className="font-semibold">{user.name}</span>
                <span className="text-xs opacity-60 capitalize">{user.role}</span>
              </li>
              <div className="divider my-1"></div>
              <li>
                <Link to="/profile" onClick={closeMenu}>
                  <HiUser className="w-4 h-4" />
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/orders" onClick={closeMenu}>
                  <HiTicket className="w-4 h-4" />
                  My Orders
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link to="/admin" onClick={closeMenu}>
                    <HiCog className="w-4 h-4" />
                    Admin Panel
                  </Link>
                </li>
              )}
              <div className="divider my-1"></div>
              <li>
                <button 
                  onClick={handleLogout}
                  className="text-error hover:bg-error/10"
                >
                  <HiLogout className="w-4 h-4" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="hidden lg:flex gap-2">
            <Link 
              to="/login" 
              className="btn btn-ghost"
              state={{ from: location }}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="btn btn-primary"
              state={{ from: location }}
            >
              Register
            </Link>
          </div>
        )}

        {/* Mobile menu button */}
        <div className="lg:hidden">
          <button onClick={toggleMenu} className="btn btn-ghost">
            {isMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t z-40">
          <ul className="menu">
            <li>
              <Link 
                to="/" 
                onClick={closeMenu}
                className={location.pathname === '/' ? 'active' : ''}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/concerts" 
                onClick={closeMenu}
                className={location.pathname === '/concerts' ? 'active' : ''}
              >
                Concerts
              </Link>
            </li>
            
            {isAuthenticated && user ? (
              <>
                <div className="divider my-2">
                  <span className="text-sm font-semibold">{user.name}</span>
                </div>
                <li>
                  <Link 
                    to="/orders" 
                    onClick={closeMenu}
                    className={location.pathname === '/orders' ? 'active' : ''}
                  >
                    <HiTicket className="w-4 h-4" />
                    My Orders
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/profile" 
                    onClick={closeMenu}
                    className={location.pathname === '/profile' ? 'active' : ''}
                  >
                    <HiUser className="w-4 h-4" />
                    Profile
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link 
                      to="/admin" 
                      onClick={closeMenu}
                      className={location.pathname.startsWith('/admin') ? 'active' : ''}
                    >
                      <HiCog className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  </li>
                )}
                <li>
                  <button 
                    onClick={handleLogout} 
                    className="text-error hover:bg-error/10"
                  >
                    <HiLogout className="w-4 h-4" />
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <div className="divider my-2"></div>
                <li>
                  <Link 
                    to="/login" 
                    onClick={closeMenu}
                    state={{ from: location }}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/register" 
                    onClick={closeMenu}
                    state={{ from: location }}
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;