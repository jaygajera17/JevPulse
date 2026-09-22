/**
 * Backend API Configuration
 *
 * Reads backend base URL from Vite environment variables (VITE_BACKEND_BASE_URL).
 * Automatically strips trailing slashes and formats API endpoint paths.
 */

export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL

/**
 * Format full URL for an API endpoint
 * @param {string} endpoint - e.g. '/api/analyze/stream'
 * @returns {string} - Full URL or relative path
 */
export function getApiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return BACKEND_BASE_URL ? `${BACKEND_BASE_URL}${cleanEndpoint}` : cleanEndpoint;
}

export default {
  BACKEND_BASE_URL,
  getApiUrl,
};
