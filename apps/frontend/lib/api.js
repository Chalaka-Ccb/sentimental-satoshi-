import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  withCredentials: true, // Required for cookies/sessions
});

// Automatically add the Authorization header if we have a token in localStorage
api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('satoshi-auth');
  if (authData) {
    const { state } = JSON.parse(authData);
    if (state.accessToken) {
      config.headers.Authorization = `Bearer ${state.accessToken}`;
    }
  }
  return config;
});

export default api;