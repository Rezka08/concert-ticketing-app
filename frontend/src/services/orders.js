import api from './api';

export const ordersAPI = {
  getUserOrders: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/orders?${searchParams}`);
  },
  
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (orderData) => api.post('/orders', orderData),
  payOrder: (id, paymentData) => api.put(`/orders/${id}/pay`, paymentData),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
};