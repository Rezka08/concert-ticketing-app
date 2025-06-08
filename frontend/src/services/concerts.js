import api from './api';

export const concertsAPI = {
  // Public endpoints
  getConcerts: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/concerts?${searchParams}`);
  },
  
  getConcert: (id) => api.get(`/concerts/${id}`),
  getConcertTickets: (id) => api.get(`/concerts/${id}/tickets`),
  
  // Admin endpoints
  createConcert: (concertData) => api.post('/concerts', concertData),
  updateConcert: (id, concertData) => api.put(`/concerts/${id}`, concertData),
  deleteConcert: (id) => api.delete(`/concerts/${id}`),
  createTicketType: (concertId, ticketData) => api.post(`/concerts/${concertId}/tickets`, ticketData),
};