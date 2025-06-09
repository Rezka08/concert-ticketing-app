import { useState, useEffect } from 'react'; // FIX: Import React hooks
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateEmail } from '../utils/helpers';
import { HiEye, HiEyeOff, HiMail, HiLockClosed, HiUser, HiPhone } from 'react-icons/hi';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim()
      });
      navigate('/', { replace: true });
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-base-200 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">Create Account</h1>
              <p className="text-base-content/70 mt-2">Join ConcertTix today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input input-bordered w-full pl-10 ${errors.name ? 'input-error' : ''}`}
                    placeholder="Enter your full name"
                    required
                  />
                  <HiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                </div>
                {errors.name && <span className="text-error text-sm mt-1">{errors.name}</span>}
              </div>

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
                    className={`input input-bordered w-full pl-10 ${errors.email ? 'input-error' : ''}`}
                    placeholder="Enter your email"
                    required
                  />
                  <HiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                </div>
                {errors.email && <span className="text-error text-sm mt-1">{errors.email}</span>}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Phone (Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input input-bordered w-full pl-10"
                    placeholder="Enter your phone number"
                  />
                  <HiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
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
                    className={`input input-bordered w-full pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="Enter your password"
                    required
                  />
                  <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <HiEyeOff className="w-5 h-5 text-base-content/50" />
                    ) : (
                      <HiEye className="w-5 h-5 text-base-content/50" />
                    )}
                  </button>
                </div>
                {errors.password && <span className="text-error text-sm mt-1">{errors.password}</span>}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input input-bordered w-full pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Confirm your password"
                    required
                  />
                  <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <HiEyeOff className="w-5 h-5 text-base-content/50" />
                    ) : (
                      <HiEye className="w-5 h-5 text-base-content/50" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <span className="text-error text-sm mt-1">{errors.confirmPassword}</span>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="divider">OR</div>

            <div className="text-center">
              <p className="text-sm">
                Already have an account?{' '}
                <Link to="/login" className="link link-primary">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;