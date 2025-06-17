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
  
  // FIXED: Payment verification with proper payload structure
  verifyPayment: (orderId, payloadData) => {
    console.log('🔧 Admin API: Verify payment called with:', { orderId, payloadData });
    
    // Ensure proper payload structure
    const payload = {
      status: payloadData.status || payloadData,  // Support both object and string
      admin_notes: payloadData.admin_notes || payloadData.adminNotes || ''
    };
    
    console.log('📤 Sending payload to backend:', payload);
    
    return api.put(`/admin/orders/${orderId}/verify`, payload);
  },
  
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