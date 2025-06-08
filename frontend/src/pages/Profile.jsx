import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/auth';
import { validateEmail, validatePhone } from '../utils/helpers';
import { HiUser, HiMail, HiPhone, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (profileData.phone && !validatePhone(profileData.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    try {
      setProfileLoading(true);
      await updateProfile(profileData);
    } catch (error) {
      // Error handled by context
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      toast.error('All password fields are required');
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      await authAPI.changePassword(passwordData);
      toast.success('Password changed successfully');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-base-content/70 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center">
                      <HiUser className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">{user?.name}</h3>
                    <p className="text-sm text-base-content/70">{user?.role}</p>
                  </div>
                </div>

                <ul className="menu p-0">
                  <li>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={activeTab === 'profile' ? 'active' : ''}
                    >
                      <HiUser className="w-5 h-5" />
                      Profile Information
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('password')}
                      className={activeTab === 'password' ? 'active' : ''}
                    >
                      <HiLockClosed className="w-5 h-5" />
                      Change Password
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                    
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      {/* Email (Read-only) */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Email</span>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={user?.email}
                            className="input input-bordered w-full pl-10 bg-base-200"
                            disabled
                          />
                          <HiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                        </div>
                        <label className="label">
                          <span className="label-text-alt text-base-content/70">
                            Email cannot be changed
                          </span>
                        </label>
                      </div>

                      {/* Name */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Full Name</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="name"
                            value={profileData.name}
                            onChange={handleProfileChange}
                            className="input input-bordered w-full pl-10"
                            placeholder="Enter your full name"
                            required
                          />
                          <HiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Phone Number</span>
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            className="input input-bordered w-full pl-10"
                            placeholder="Enter your phone number"
                          />
                          <HiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                        </div>
                      </div>

                      <div className="form-control">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={profileLoading}
                        >
                          {profileLoading ? (
                            <>
                              <span className="loading loading-spinner loading-sm"></span>
                              Updating...
                            </>
                          ) : (
                            'Update Profile'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === 'password' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Change Password</h2>
                    
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                      {/* Current Password */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Current Password</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            name="current_password"
                            value={passwordData.current_password}
                            onChange={handlePasswordChange}
                            className="input input-bordered w-full pl-10 pr-10"
                            placeholder="Enter your current password"
                            required
                          />
                          <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showPasswords.current ? (
                              <HiEyeOff className="w-5 h-5 text-base-content/50" />
                            ) : (
                              <HiEye className="w-5 h-5 text-base-content/50" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">New Password</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            name="new_password"
                            value={passwordData.new_password}
                            onChange={handlePasswordChange}
                            className="input input-bordered w-full pl-10 pr-10"
                            placeholder="Enter your new password"
                            required
                          />
                          <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showPasswords.new ? (
                              <HiEyeOff className="w-5 h-5 text-base-content/50" />
                            ) : (
                              <HiEye className="w-5 h-5 text-base-content/50" />
                            )}
                          </button>
                        </div>
                        <label className="label">
                          <span className="label-text-alt">Password must be at least 6 characters</span>
                        </label>
                      </div>

                      {/* Confirm Password */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Confirm New Password</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            name="confirm_password"
                            value={passwordData.confirm_password}
                            onChange={handlePasswordChange}
                            className="input input-bordered w-full pl-10 pr-10"
                            placeholder="Confirm your new password"
                            required
                          />
                          <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showPasswords.confirm ? (
                              <HiEyeOff className="w-5 h-5 text-base-content/50" />
                            ) : (
                              <HiEye className="w-5 h-5 text-base-content/50" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="form-control">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={passwordLoading}
                        >
                          {passwordLoading ? (
                            <>
                              <span className="loading loading-spinner loading-sm"></span>
                              Changing Password...
                            </>
                          ) : (
                            'Change Password'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;