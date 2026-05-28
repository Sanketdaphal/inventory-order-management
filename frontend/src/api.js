import axios from 'axios';

function resolveApiUrl() {
  // Vercel: use same-origin proxy (vercel.json) to avoid CORS
  if (import.meta.env.VERCEL === '1') return '/api';

  const configured = (import.meta.env.REACT_APP_API_URL || '').trim().replace(/\/$/, '');
  if (configured) return configured;

  if (import.meta.env.PROD) return '/api';
  return 'http://localhost:8000';
}

export const API_URL = resolveApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

export const getDashboardStats = () => api.get('/dashboard/stats');
export const getProducts = () => api.get('/products/');
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products/', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const getCustomers = () => api.get('/customers/');
export const getCustomer = (id) => api.get(`/customers/${id}`);
export const createCustomer = (data) => api.post('/customers/', data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

export const getOrders = () => api.get('/orders/');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (data) => api.post('/orders/', data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

export default api;
