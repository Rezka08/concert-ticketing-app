import api from './api';

export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  
  // Users management
  getUsers: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/admin/users?${searchParams}`);
  },
  
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  
  // Orders management
  getAllOrders: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/admin/orders?${searchParams}`);
  },
  
  verifyPayment: (orderId, status) => api.put(`/admin/orders/${orderId}/verify`, { status }),
  
  // Sales reports
  getSalesReport: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/admin/sales-report?${searchParams}`);
  },
};