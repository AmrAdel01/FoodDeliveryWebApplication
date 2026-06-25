import axios from 'axios';

const DEFAULT_API_URL = 'http://localhost:5000/api/v1';
const normalizeApiUrl = (value) => {
  const trimmed = (value || DEFAULT_API_URL).trim().replace(/\/+$/, '');
  if (!trimmed) return DEFAULT_API_URL;
  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
};

const client = axios.create({
  baseURL: normalizeApiUrl(import.meta.env.VITE_API_URL),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('food_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('food_token')) {
      localStorage.removeItem('food_token');
      localStorage.removeItem('food_user');
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  },
);

export const errorMessage = (error) => {
  const data = error?.response?.data;
  // Field-level validation errors take priority, then the server's message.
  const serverMessage = data?.errors?.[0]?.message || data?.message;
  if (serverMessage) return serverMessage;

  // No response means the request never completed; distinguish timeout from a
  // failed connection so the user knows whether to simply retry.
  if (!error?.response) {
    if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
      return 'The request timed out. Please try again.';
    }
    if (error?.request) {
      return 'Unable to reach the server. Check your connection and try again.';
    }
  }

  return 'Something went wrong. Please try again.';
};

export default client;
