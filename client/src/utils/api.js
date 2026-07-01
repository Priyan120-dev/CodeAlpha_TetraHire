import axios from 'axios';
import { handleMockRequest } from './mockBackend';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure Axios Adapter for Demo Mode and offline database fallback
api.defaults.adapter = async (config) => {
  const isDemoMode = localStorage.getItem('th_demo_mode') === 'true';

  if (isDemoMode) {
    try {
      let parsedData = config.data;
      if (typeof config.data === 'string') {
        try {
          parsedData = JSON.parse(config.data);
        } catch (_) {}
      }
      const mockRes = await handleMockRequest(config.method.toLowerCase(), config.url, parsedData, config.headers);
      return {
        data: mockRes.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    } catch (mockErr) {
      return Promise.reject(mockErr);
    }
  }

  // Fallback to real network adapter
  const xhrAdapter = axios.getAdapter('xhr');
  try {
    return await xhrAdapter(config);
  } catch (error) {
    // If server is offline or connection is refused, auto-switch to sandbox mode
    if (error.code === 'ERR_NETWORK' || !error.response) {
      console.warn('[Network Alert] Express backend is unreachable. Activating local Demo Sandbox Mode.');
      localStorage.setItem('th_demo_mode', 'true');
      window.dispatchEvent(new Event('storage')); // Broadcast state change to Navbar/UI
      
      try {
        let parsedData = config.data;
        if (typeof config.data === 'string') {
          try {
            parsedData = JSON.parse(config.data);
          } catch (_) {}
        }
        const mockRes = await handleMockRequest(config.method.toLowerCase(), config.url, parsedData, config.headers);
        return {
          data: mockRes.data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      } catch (mockErr) {
        return Promise.reject(mockErr);
      }
    }
    throw error;
  }
};

// Request interceptor to attach JWT Access Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle expired access tokens and auto-refresh them
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Skip token refresh if in demo mode
    if (localStorage.getItem('th_demo_mode') === 'true') {
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, { refreshToken });
        if (res.status === 200 && res.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Clear local storage and redirect to login if refresh fails
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

