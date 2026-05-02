import httpClient from '../api/httpClient';

export const supportService = {
  listTickets: (params?: any) => httpClient.get('/support/tickets', { params }).then((r: any) => r.data),
  stats: () => httpClient.get('/support/tickets/stats').then((r: any) => r.data?.data),
  detail: (id: string | number) => httpClient.get(`/support/tickets/${id}`).then((r: any) => r.data?.data),
  createTicket: (payload: any) => httpClient.post('/support/tickets', payload).then((r: any) => r.data),
  sendMessage: (ticketId: string | number, payload: any) => httpClient.post(`/support/tickets/${ticketId}/messages`, payload).then((r: any) => r.data),
  reply: (ticketId: string | number, payload: any) => httpClient.post(`/support/tickets/${ticketId}/reply`, payload).then((r: any) => r.data),
  updateStatus: (ticketId: string | number, payload: any) => httpClient.put(`/support/tickets/${ticketId}/status`, payload).then((r: any) => r.data),
  assignAgent: (ticketId: string | number, payload: any) => httpClient.put(`/support/tickets/${ticketId}/assign`, payload).then((r: any) => r.data),
  internalNote: (ticketId: string | number, payload: any) => httpClient.post(`/support/tickets/${ticketId}/internal-note`, payload).then((r: any) => r.data),
};
