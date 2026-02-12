import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const PUBLIC_PATHS = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/refresh'];

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const isPublic = PUBLIC_PATHS.some((p) => config.url?.includes(p));
  if (!isPublic) {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor — refresh token on 401
let isRefreshing = false;
let pendingRequests: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processPendingRequests(token: string | null, error: unknown = null) {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  pendingRequests = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Don't retry refresh endpoint itself
    if (originalRequest.url?.includes('/auth/refresh')) {
      clearTokens();
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const newAccessToken = data.data.access_token;
      const newRefreshToken = data.data.refresh_token;
      saveTokens(newAccessToken, newRefreshToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      processPendingRequests(newAccessToken);
      return api(originalRequest);
    } catch (refreshError) {
      clearTokens();
      processPendingRequests(null, refreshError);
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
