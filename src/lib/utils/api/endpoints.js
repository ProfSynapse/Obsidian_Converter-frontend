// src/lib/utils/api/endpoints.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

console.log('API Base URL:', BASE_URL); // Add this

export const ENDPOINTS = {
  CONVERT: `${BASE_URL}/convert/file`,
  CONVERT_URL: `${BASE_URL}/convert/url`,
  HEALTH: `${BASE_URL}/convert/health`
};

// Log all endpoints
console.log('API Endpoints:', ENDPOINTS);