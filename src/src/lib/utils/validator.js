// src/lib/utils/validators.js

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg', 'image/png', 'image/gif',
  'video/mp4', 'video/quicktime',
  'audio/mpeg', 'audio/wav',
  'application/pdf',
  'text/plain',
  'text/html',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export function validateFile(file) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('Unsupported file type');
  }

  return true;
}

export function validateApiKey(apiKey) {
  if (typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    throw new Error('API key is required');
  }

  // You might want to add more specific validation rules for your API key format
  if (apiKey.length < 32) {
    throw new Error('Invalid API key format');
  }

  return true;
}

export function normalizeUrl(url) {
  url = url.trim().toLowerCase();
  
  // If the URL doesn't start with a protocol, add https://
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  
  // If the URL doesn't have www., add it after the protocol
  if (!/^https?:\/\/www\./i.test(url)) {
    url = url.replace(/^(https?:\/\/)/, '$1www.');
  }
  
  return url;
}

export function validateUrl(url) {
  try {
    url = normalizeUrl(url);
    new URL(url);
    return url; // Return the normalized URL
  } catch (error) {
    throw new Error('Invalid URL format');
  }
}

export function validateConversionInput(files, apiKey) {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  if (files.length === 0) {
    throw new Error('At least one file is required for conversion');
  }

  files.forEach(validateFile);

  return true;
}