import api from './api';

export const ticketsAPI = {
  getTicket: (id) => api.get(`/tickets/${id}`),
  updateTicket: (id, ticketData) => api.put(`/tickets/${id}`, ticketData),
  deleteTicket: (id) => api.delete(`/tickets/${id}`),
  
  downloadTicketPDF: async (orderId) => {
    try {
      console.log('📄 Downloading PDF ticket for order:', orderId);
      
      const response = await api.get(`/tickets/download/${orderId}`, {
        responseType: 'blob', // Important for PDF download
        headers: {
          'Accept': 'application/pdf',
        },
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or create default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `ticket-${orderId}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ PDF ticket downloaded successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to download PDF ticket:', error);
      throw error;
    }
  },
  
  // Preview ticket (for testing)
  previewTicketPDF: async (orderId) => {
    try {
      const response = await api.get(`/tickets/preview/${orderId}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
        },
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url, '_blank');
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to preview PDF ticket:', error);
      throw error;
    }
  }
};