import axios, { AxiosError, AxiosRequestConfig } from 'axios';

/**
 * Centralized axios client. Frontend uses this for all backend calls.
 * In the future, the mobile app can replicate this same client.
 */
const api = axios.create({
  baseURL:
    typeof window === 'undefined'
      ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api'
      : '/api',
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor: normalize error messages
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string> }>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject({
      message,
      errors: error.response?.data?.errors,
      status: error.response?.status,
    });
  }
);

/**
 * Generic GET request.
 */
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await api.get(url, config);
  return data.data ?? data;
}

/**
 * Generic POST request.
 */
export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const { data } = await api.post(url, body, config);
  return data.data ?? data;
}

/**
 * Generic PUT request.
 */
export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.put(url, body);
  return data.data ?? data;
}

/**
 * Generic PATCH request.
 */
export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.patch(url, body);
  return data.data ?? data;
}

/**
 * Generic DELETE request.
 */
export async function apiDelete<T>(url: string): Promise<T> {
  const { data } = await api.delete(url);
  return data.data ?? data;
}

export default api;
