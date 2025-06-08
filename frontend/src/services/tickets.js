import api from './api';

export const ticketsAPI = {
  getTicket: (id) => api.get(`/tickets/${id}`),
  updateTicket: (id, ticketData) => api.put(`/tickets/${id}`, ticketData),
  deleteTicket: (id) => api.delete(`/tickets/${id}`),
};