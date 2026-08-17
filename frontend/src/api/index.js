import apiClient from './apiClient.js';

export const authApi = {
  register: (payload) => apiClient.post('/auth/register', payload),
  login: (payload) => apiClient.post('/auth/login', payload),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) =>
    apiClient.patch(`/auth/reset-password/${token}`, { password }),
  updatePassword: (payload) => apiClient.patch('/auth/update-password', payload),
};

export const productsApi = {
  list: (params) => apiClient.get('/products', { params }),
  bySlug: (slug) => apiClient.get(`/products/${slug}`),
  featured: () => apiClient.get('/products/featured'),
  facets: () => apiClient.get('/products/facets'),
  reviews: (slug, params) =>
    apiClient.get(`/products/${slug}/reviews`, { params }),
  addReview: (productId, payload) =>
    apiClient.post(`/products/${productId}/reviews`, payload),
};

export const cartApi = {
  validate: (items) => apiClient.post('/cart/validate', { items }),
  get: () => apiClient.get('/cart'),
  replace: (items) => apiClient.put('/cart', { items }),
  merge: (items) => apiClient.post('/cart/merge', { items }),
  clear: () => apiClient.delete('/cart'),
};

export const ordersApi = {
  quote: (payload) => apiClient.post('/orders/quote', payload),
  create: (payload) => apiClient.post('/orders', payload),
  mine: (params) => apiClient.get('/orders/my', { params }),
  mineByNumber: (orderNumber) => apiClient.get(`/orders/my/${orderNumber}`),
  cancelMine: (orderNumber, reason) =>
    apiClient.patch(`/orders/my/${orderNumber}/cancel`, { reason }),
  submitPaymentReference: (orderNumber, payload) =>
    apiClient.post(`/orders/my/${orderNumber}/payment/reference`, payload),
};

export const paymentsApi = {
  config: () => apiClient.get('/payments/config'),
  card: (payload) => apiClient.post('/payments/card', payload),
  mpesa: (payload) => apiClient.post('/payments/mpesa', payload),
  status: (orderNumber) => apiClient.get(`/payments/status/${orderNumber}`),
  reviewQueue: (params) => apiClient.get('/payments/review', { params }),
  review: (id, payload) => apiClient.patch(`/payments/review/${id}`, payload),
};

export const usersApi = {
  updateMe: (payload) => apiClient.patch('/users/me', payload),
};

export const reviewsApi = {
  mine: () => apiClient.get('/reviews/my'),
  update: (id, payload) => apiClient.patch(`/reviews/${id}`, payload),
  remove: (id) => apiClient.delete(`/reviews/${id}`),
};

export const adminApi = {
  stats: () => apiClient.get('/stats/dashboard'),

  products: (params) => apiClient.get('/products/admin/all', { params }),
  product: (id) => apiClient.get(`/products/admin/${id}`),
  createProduct: (payload) => apiClient.post('/products', payload),
  updateProduct: (id, payload) => apiClient.patch(`/products/${id}`, payload),
  archiveProduct: (id) => apiClient.delete(`/products/${id}`),
  uploadImages: (formData) =>
    apiClient.post('/uploads/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  orders: (params) => apiClient.get('/orders', { params }),
  order: (id) => apiClient.get(`/orders/${id}`),
  setOrderStatus: (id, payload) =>
    apiClient.patch(`/orders/${id}/status`, payload),

  users: (params) => apiClient.get('/users', { params }),
  setUserRole: (id, role) => apiClient.patch(`/users/${id}/role`, { role }),
  deactivateUser: (id) => apiClient.delete(`/users/${id}`),

  reviews: (params) => apiClient.get('/reviews', { params }),
  setReviewStatus: (id, status) =>
    apiClient.patch(`/reviews/${id}/status`, { status }),
};

export const subscribersApi = {
  subscribe: (email) => apiClient.post('/subscribers', { email, source: 'newsletter' }),
};
