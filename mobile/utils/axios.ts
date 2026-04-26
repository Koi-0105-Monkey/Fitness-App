import axios from 'axios';
import { ENDPOINTS } from '../constants/endpoints';
import { getItem, setItem, removeItem } from './storage';
import { router } from 'expo-router';

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor: Inject access token ──────────────────────────────
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Auto refresh on 401 ─────────────────────────────
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getItem('refreshToken');
        const { data } = await axios.post(ENDPOINTS.AUTH.REFRESH, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = data.data.tokens;

        await setItem('accessToken', accessToken);
        await setItem('refreshToken', newRefreshToken);

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await removeItem('accessToken');
        await removeItem('refreshToken');
        await removeItem('setupComplete');
        
        router.replace('/login');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 500 JWT Expired (Server returns 500 for expired tokens sometimes)
    if (error.response?.status === 500 && error.response?.data?.message?.includes('jwt expired')) {
      await removeItem('accessToken');
      await removeItem('refreshToken');
      await removeItem('setupComplete');
      router.replace('/login');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
