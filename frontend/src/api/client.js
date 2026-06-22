import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
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

export const errorMessage = (error) => error.response?.data?.errors?.[0]?.message
  || error.response?.data?.message
  || 'Something went wrong. Please try again.';

export default client;
