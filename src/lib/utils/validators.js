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

/**
 * Validates a file's size and type
 * @param {File} file - The file to validate
 * @throws Will throw an error if validation fails
 * @returns {boolean} - Returns true if validation passes
 */
export function validateFile(file) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('Unsupported file type');
  }

  return true;
}

/**
 * Validates an API key's presence and format
 * @param {string} apiKey - The API key to validate
 * @throws Will throw an error if validation fails
 * @returns {boolean} - Returns true if validation passes
 */
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

/**
 * Normalizes a URL by adding protocol and 'www.' if missing
 * @param {string} url - The URL to normalize
 * @returns {string} - The normalized URL
 */
export function normalizeUrl(url) {
  // Remove leading/trailing whitespace and convert to lowercase
  url = url.trim().toLowerCase();
  
  // Remove any common prefixes users might copy accidentally
  url = url.replace(/^(https?:\/\/)?(www\.)?/, '');
  
  // Add https:// if no protocol is specified
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  
  // Add www. if not present (optional, depending on your requirements)
  if (!/^https?:\/\/www\./i.test(url)) {
    url = url.replace(/^(https?:\/\/)/, '$1www.');
  }
  
  return url;
}

// In validators.js
/**
 * Normalizes and validates a URL
 * @param {string} url - The URL to validate
 * @returns {string} - The normalized URL if valid
 */
  export function validateUrl(url) {
    try {
      // Remove whitespace
      url = url.trim();
      
      // Debug log
      console.log('Input URL:', url);

      // If URL doesn't have a protocol, add https://
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url.replace(/^\/\//, '');
      }

      console.log('URL after protocol check:', url);

      // Try to construct URL object to validate
      const urlObj = new URL(url);
      
      // Ensure the hostname has at least one dot and some content on both sides
      if (!/^[^.]+\.[^.]+/.test(urlObj.hostname)) {
        throw new Error('Invalid domain format');
      }

      console.log('Final validated URL:', url);
      return url;

    } catch (error) {
      console.error('URL Validation Error:', error);
      throw new Error('Please enter a valid website address');
    }
  }

/**
 * Checks if input could be a valid URL with proper formatting
 * @param {string} input - The input to check
 * @returns {boolean} - True if input could be a valid URL
 */
export function couldBeValidUrl(input) {
  // Remove common prefixes and whitespace
  const cleaned = input.trim().replace(/^(https?:\/\/)?(www\.)?/, '');
  
  // Check if there's at least one dot and some content on both sides
  return /^[^.]+\.[^.]+/.test(cleaned);
}
/**
 * Validates the inputs for the conversion process
 * @param {Array} files - Array of files to convert
 * @param {string} apiKey - The API key for authentication
 * @throws Will throw an error if validation fails
 * @returns {boolean} - Returns true if all validations pass
 */
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
