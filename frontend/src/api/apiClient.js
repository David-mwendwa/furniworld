import axios from 'axios';
import { getToken, clearToken } from '../lib/storage.js';

export const AUTH_EXPIRED_EVENT = 'furniworld:auth-expired';

// A 401 from these endpoints means "those credentials were wrong", not "your
// session ended" — logging the user out on a failed login attempt would be wrong.
const CREDENTIAL_CHECK_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/update-password',
];

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1',
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? '';
    const isCredentialCheck = CREDENTIAL_CHECK_PATHS.some((path) =>
      url.startsWith(path)
    );

    if (error.response?.status === 401 && !isCredentialCheck) {
      clearToken();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }

    return Promise.reject(error);
  }
);

export const errorMessage = (error, fallback = 'Something went wrong') =>
  error?.response?.data?.message || error?.message || fallback;

export default apiClient;
