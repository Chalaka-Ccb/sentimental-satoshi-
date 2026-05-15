import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  withCredentials: true, // Required for cookies/sessions
});

const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  withCredentials: true,
});

function readPersistedAuthState() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const authData = localStorage.getItem('satoshi-auth');
    if (!authData) return null;

    return JSON.parse(authData)?.state ?? null;
  } catch {
    return null;
  }
}

// Automatically add the Authorization header if we have a token in auth state
api.interceptors.request.use((config) => {
  const liveToken = useAuthStore.getState().accessToken;
  const persistedToken = readPersistedAuthState()?.accessToken ?? null;

  const accessToken = liveToken ?? persistedToken;

  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const liveRefreshToken = useAuthStore.getState().refreshToken;
    const persistedRefreshToken = readPersistedAuthState()?.refreshToken ?? null;
    const refreshToken = liveRefreshToken ?? persistedRefreshToken;

    if (!refreshToken) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshResponse = await refreshClient.post('/auth/refresh', { refreshToken });
      const { user, accessToken, refreshToken: nextRefreshToken } = refreshResponse.data;

      useAuthStore.getState().setAuth(user, accessToken, nextRefreshToken);

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().logout();

      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }

      return Promise.reject(refreshError);
    }
  }
);

export default api;