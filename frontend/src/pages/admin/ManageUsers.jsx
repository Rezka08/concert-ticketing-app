import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/admin';
import { formatDateTime, formatCurrency } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { HiSearch, HiEye, HiPencil, HiUsers, HiCurrencyDollar, HiShoppingCart } from 'react-icons/hi';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    page: 1
  });

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers(filters);
      setUsers(response.data.data.items);
      setPagination(response.data.data.pagination);
    } catch (error) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      search: e.target.value,
      page: 1
    });
  };

  const handleRoleChange = (e) => {
    setFilters({
      ...filters,
      role: e.target.value,
      page: 1
    });
  };

  const handlePageChange = (page) => {
    setFilters({
      ...filters,
      page
    });
  };

  const handleViewUser = async (userId) => {
    try {
      setModalLoading(true);
      const response = await adminAPI.getUser(userId);
      setSelectedUser(response.data.data);
      setShowUserModal(true);
    } catch (error) {
      toast.error('Failed to fetch user details');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      await adminAPI.updateUser(userId, userData);
      toast.success('User updated successfully');
      fetchUsers();
      setShowUserModal(false);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user';
      toast.error(message);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      role: '',
      page: 1
    });
  };

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Manage Users</h1>
          <p className="text-base-content/70">View and manage user accounts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-base-content/70">Total Users</h3>
                  <p className="text-2xl font-bold">{pagination.total || 0}</p>
                </div>
                <HiUsers className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-base-content/70">Regular Users</h3>
                  <p className="text-2xl font-bold">
                    {users.filter(u => u.role === 'user').length}
                  </p>
                </div>
                <HiUsers className="w-8 h-8 text-secondary" />
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-base-content/70">Admins</h3>
                  <p className="text-2xl font-bold">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
                <HiUsers className="w-8 h-8 text-accent" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="form-control flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    className="input input-bordered w-full pl-10"
                    value={filters.search}
                    onChange={handleSearchChange}
                  />
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                </div>
              </div>
              
              <div className="form-control">
                <select
                  className="select select-bordered"
                  value={filters.role}
                  onChange={handleRoleChange}
                >
                  <option value="">All Roles</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
              
              {(filters.search || filters.role) && (
                <button onClick={clearFilters} className="btn btn-ghost">
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <LoadingSpinner text="Loading users..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchUsers} />
        ) : (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Phone</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-12">
                          <div className="text-base-content/70">
                            {filters.search || filters.role 
                              ? 'No users match your criteria' 
                              : 'No users found'}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.user_id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="avatar">
                                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                                  <span className="text-sm font-medium">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold">{user.name}</h4>
                                <p className="text-sm text-base-content/70">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                              {user.role}
                            </div>
                          </td>
                          <td>
                            <span className="text-sm">
                              {user.phone || 'Not provided'}
                            </span>
                          </td>
                          <td>
                            <span className="text-sm">
                              {formatDateTime(user.created_at)}
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewUser(user.user_id)}
                                className="btn btn-ghost btn-sm"
                                title="View Details"
                                disabled={modalLoading}
                              >
                                <HiEye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          hasNext={pagination.has_next}
          hasPrev={pagination.has_prev}
          onPageChange={handlePageChange}
        />

        {/* User Details Modal */}
        <UserDetailsModal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          user={selectedUser}
          onUpdate={handleUpdateUser}
        />
      </div>
    </div>
  );
};

// User Details Modal Component
const UserDetailsModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        role: user.role || 'user'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onUpdate(user.user_id, formData);
      setEditMode(false);
    } catch (error) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="lg">
      <div className="space-y-6">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center">
              <span className="text-xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-base-content/70">{user.email}</p>
            <div className={`badge mt-2 ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
              {user.role}
            </div>
          </div>
        </div>

        {/* Statistics */}
        {user.statistics && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-base-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <HiShoppingCart className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm text-base-content/70">Total Orders</p>
                  <p className="text-xl font-bold">{user.statistics.total_orders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-base-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <HiCurrencyDollar className="w-6 h-6 text-success" />
                <div>
                  <p className="text-sm text-base-content/70">Total Spent</p>
                  <p className="text-xl font-bold">{formatCurrency(user.statistics.total_spent)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {editMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input input-bordered"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Phone</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input input-bordered"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Role</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="select select-bordered"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="btn btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Updating...
                  </>
                ) : (
                  'Update User'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-base-content/70">Email:</span>
                <p className="font-medium">{user.email}</p>
              </div>
              
              <div>
                <span className="text-sm text-base-content/70">Phone:</span>
                <p className="font-medium">{user.phone || 'Not provided'}</p>
              </div>
              
              <div>
                <span className="text-sm text-base-content/70">Role:</span>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
              
              <div>
                <span className="text-sm text-base-content/70">Joined:</span>
                <p className="font-medium">{formatDateTime(user.created_at)}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={onClose} className="btn btn-ghost flex-1">
                Close
              </button>
              <button
                onClick={() => setEditMode(true)}
                className="btn btn-primary flex-1"
              >
                <HiPencil className="w-4 h-4 mr-2" />
                Edit User
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ManageUsers;