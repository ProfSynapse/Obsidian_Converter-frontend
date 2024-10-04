// src/lib/utils/api/endpoints.js

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const ENDPOINTS = {
  CONVERT: `${BASE_URL}/convert`,
  CREATE_ZIP: `${BASE_URL}/create-zip`,
  DOWNLOAD_FILE: (fileId) => `${BASE_URL}/download/${fileId}`
};