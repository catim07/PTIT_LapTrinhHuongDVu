import httpClient from '../api/httpClient';

export const reviewService = {
  listAll: (params?: any) => httpClient.get('/reviews', { params }).then((r: any) => r.data),
  stats: () => httpClient.get('/reviews/stats').then((r: any) => r.data?.data),
  listByProduct: (productId: string | number) => httpClient.get(`/products/${productId}/reviews`).then((r: any) => r.data),
  create: (productId: string | number, payload: any) => httpClient.post(`/products/${productId}/reviews`, payload).then((r: any) => r.data),
  update: (id: string | number, payload: any) => httpClient.put(`/reviews/${id}`, payload).then((r: any) => r.data),
  updateStatus: (id: string | number, payload: any) => httpClient.put(`/reviews/${id}/status`, payload).then((r: any) => r.data),
  remove: (id: string | number) => httpClient.delete(`/reviews/${id}`).then((r: any) => r.data),
  reply: (reviewId: string | number, payload: any) => httpClient.post(`/reviews/${reviewId}/reply`, payload).then((r: any) => r.data),
};
