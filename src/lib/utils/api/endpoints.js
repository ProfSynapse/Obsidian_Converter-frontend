// src/lib/utils/api/endpoints.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

console.log('API Base URL:', BASE_URL);

export const ENDPOINTS = {
  CONVERT: `${BASE_URL}/convert/file`,
  CONVERT_URL: `${BASE_URL}/convert/url`,
  CONVERT_PARENT_URL: `${BASE_URL}/convert/parent-url`,
  CONVERT_YOUTUBE: `${BASE_URL}/convert/youtube`,
  CONVERT_BATCH: `${BASE_URL}/convert/batch`,
  HEALTH: `${BASE_URL}/health`
};

console.log('API Endpoints:', ENDPOINTS);