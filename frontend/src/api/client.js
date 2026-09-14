import axios from 'axios';

// Detect whether running in local dev or production deployment
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const defaultUrl = isLocal ? 'http://localhost:8080' : 'https://careerpulse-api-hyq5.onrender.com';

// Resolve API URL dynamically from environment or default to active cloud backend
const rawUrl = import.meta.env.VITE_API_URL || defaultUrl;
const baseURL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

export const API_BASE_URL = baseURL;

// Create Axios client with 75s timeout to handle free-tier container cold-starts (e.g. Render)
const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 75000, // 75 seconds for container spin-ups
});

// Helper: Sleep for given ms
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Request Interceptor: Attach JWT Token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careernav_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 handling & automatic cold-start / network retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Handle 401 Unauthorized for session invalidation
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
        localStorage.removeItem('careernav_token');
        localStorage.removeItem('careernav_user');
        localStorage.removeItem('careernav_role');
        window.location.href = '/';
        return Promise.reject(error);
      }
    }

    // Determine if error is eligible for retry (cold-start 502/503/504, timeout, or network failure)
    const isNetworkOrTimeout = !error.response || error.code === 'ECONNABORTED' || error.message?.includes('timeout');
    const isGatewayColdStart = [502, 503, 504].includes(error.response?.status);
    const isEligibleEndpoint = config && (config.method === 'get' || config.url?.includes('/api/auth/'));

    if (config && (isNetworkOrTimeout || isGatewayColdStart) && isEligibleEndpoint) {
      config._retryCount = config._retryCount || 0;
      const maxRetries = 2;

      if (config._retryCount < maxRetries) {
        config._retryCount += 1;
        // Exponential backoff: 1.5s, 3s
        const backoffDelay = config._retryCount * 1500;
        await sleep(backoffDelay);

        return apiClient(config);
      }
    }

    return Promise.reject(error);
  }
);

// Track pre-warm attempts to avoid spamming the health endpoint
let lastPrewarmTime = 0;

/**
 * Pre-warm the backend server non-blockingly.
 * Useful for waking up idle serverless/container instances (e.g. Render free-tier).
 */
export const prewarmServer = () => {
  const now = Date.now();
  // Throttle pre-warm requests to at most once every 15 seconds
  if (now - lastPrewarmTime < 15000) {
    return;
  }
  lastPrewarmTime = now;

  // Fire-and-forget health check
  axios
    .get(`${baseURL}/api/health`, { timeout: 60000 })
    .catch(() => {
      // Ignored: wake-up trigger only
    });
};

/**
 * Fast check to determine if the backend server is online or currently waking up
 */
export const checkServerStatus = async () => {
  try {
    const res = await axios.get(`${baseURL}/api/health`, { timeout: 6000 });
    return res.data?.status === 'UP' ? 'online' : 'unknown';
  } catch (err) {
    return 'waking';
  }
};

/**
 * Robust error extractor for API responses.
 * Gracefully parses JSON errors, Spring Boot error objects, HTTP status codes,
 * and cold-start/network conditions.
 */
export const extractErrorMessage = (error, defaultFallback = 'Unable to connect to Career Navigator. Please try again.') => {
  if (!error) return defaultFallback;

  // 1. Direct API error response
  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === 'string' && data.trim().length > 0 && !data.includes('<html')) {
      return data;
    }
    if (typeof data.error === 'string' && data.error.trim().length > 0) {
      return data.error;
    }
    if (typeof data.message === 'string' && data.message.trim().length > 0) {
      return data.message;
    }
  }

  // 2. HTTP status-specific messages
  const status = error.response?.status;
  if (status === 401) {
    return 'Invalid email or password. Please verify your credentials.';
  }
  if (status === 403) {
    return 'Access forbidden. You do not have permission to access this portal.';
  }
  if (status === 404) {
    return 'Authentication service endpoint not found. Please contact support.';
  }
  if (status === 429) {
    return 'Too many login attempts. Please wait a moment before trying again.';
  }
  if (status === 502 || status === 503 || status === 504) {
    return 'The Career Navigator server is waking up from standby. Please wait a few seconds and try again.';
  }

  // 3. Timeout or Network Disconnect
  if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
    return 'Connection timed out while waiting for server startup. Please retry now that the server is warm.';
  }
  if (!error.response || error.message?.toLowerCase().includes('network error')) {
    return 'Unable to reach Career Navigator server. The server is likely waking up from sleep. Please try again.';
  }

  return defaultFallback;
};

export default apiClient;
