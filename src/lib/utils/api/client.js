// src/lib/utils/api/client.js

import { ENDPOINTS } from './endpoints.js';
import { conversionStatus } from '$lib/stores/conversionStatus.js';
import FileSaver from 'file-saver';

/**
 * Configuration constants
 */
const CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // in milliseconds
  ZIP_COMPRESSION_LEVEL: 9,
  PROGRESS: {
    START: 0,
    CONVERTING: 25,
    UPLOADING: 50,
    DOWNLOADING: 75,
    COMPLETE: 100
  }
};

/**
 * Custom error class for handling conversion-specific errors
 */
class ConversionError extends Error {
  constructor(message, code = 'CONVERSION_ERROR', details = null) {
    super(message);
    this.name = 'ConversionError';
    this.code = code;
    this.details = details;
  }
}

/**
 * API client for handling conversions
 */
class ConversionClient {
  /**
   * Makes an authenticated API request with retry logic and enhanced error handling.
   * @param {string} endpoint - API endpoint.
   * @param {Object} options - Fetch options.
   * @param {number} [retries=CONFIG.MAX_RETRIES] - Number of retries left.
   * @returns {Promise<any>} - The API response data.
   * @throws {ConversionError} - If the request fails after retries.
   */
  static async makeRequest(endpoint, options, retries = CONFIG.MAX_RETRIES) {
    try {
      // Log request details
      console.log(`Sending request to ${endpoint} with options:`, options);

      // If body is FormData, log its entries
      if (options.body instanceof FormData) {
        for (const [key, value] of options.body.entries()) {
          console.log(`FormData key: ${key}, value:`, value);
        }
      } else {
        console.log(`Request body: ${options.body}`);
      }

      // Make the request
      const response = await fetch(endpoint, { ...options });

      // Log response status
      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Failed to read error response';
        }

        throw new ConversionError(
          `Request failed with status ${response.status}: ${errorText}`,
          'API_ERROR'
        );
      }

      // Handle different response types
      const contentType = response.headers.get('Content-Type');

      if (
        contentType &&
        (contentType.includes('application/zip') ||
          contentType.includes('application/octet-stream'))
      ) {
        return await response.blob();
      }

      // For JSON responses
      try {
        const data = await response.json();
        if (!data.success) {
          throw new ConversionError(
            data.error?.message || 'Conversion failed',
            'CONVERSION_ERROR',
            data.error
          );
        }
        return data;
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new ConversionError(
          'Failed to parse server response',
          'PARSE_ERROR',
          parseError
        );
      }
    } catch (error) {
      // Log the full error for debugging
      console.error('Request error:', {
        error,
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });

      // Handle retries
      if (retries > 0 && this.shouldRetry(error)) {
        console.log(`Retrying request (${retries} attempts left)...`);
        await new Promise((resolve) => setTimeout(resolve, CONFIG.RETRY_DELAY));
        return this.makeRequest(endpoint, options, retries - 1);
      }

      // If it's already a ConversionError, throw it directly
      if (error instanceof ConversionError) {
        throw error;
      }

      // Create a new ConversionError with a safe error message
      const errorMessage = error?.message || 'An unknown error occurred';
      throw new ConversionError(errorMessage, 'REQUEST_ERROR', error);
    }
  }

  /**
   * Determines if a request should be retried based on the error.
   * @param {Error} error - The error to check.
   * @returns {boolean} - Whether to retry the request.
   */
  static shouldRetry(error) {
    // Define retryable error codes
    const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED'];

    // Network errors or specific error codes should be retried
    return (
      error.name === 'NetworkError' ||
      retryableCodes.includes(error.code) ||
      (error instanceof ConversionError && error.code === 'API_ERROR')
    );
  }

  /**
   * Converts a single URL
   * @param {string} url - The URL to convert
   * @param {string} apiKey - The API key for authentication
   * @returns {Promise<Blob>} - The ZIP file blob.
   */
  static async convertUrl(url, apiKey) {
    const endpoint = ENDPOINTS.CONVERT_URL;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'x-api-key': apiKey }) // Use 'x-api-key' as per backend expectation
      },
      body: JSON.stringify({ url })
    };
    return this.makeRequest(endpoint, options);
  }

  /**
   * Converts a single YouTube URL
   * @param {string} youtubeUrl - The YouTube URL to convert
   * @param {string} apiKey - The API key for authentication
   * @returns {Promise<Blob>} - The ZIP file blob.
   */
  static async convertYoutube(youtubeUrl, apiKey) {
    const endpoint = ENDPOINTS.CONVERT_YOUTUBE;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'x-api-key': apiKey }) // Use 'x-api-key' as per backend expectation
      },
      body: JSON.stringify({ url: youtubeUrl })
    };
    return this.makeRequest(endpoint, options);
  }

  /**
   * Converts multiple items as a batch
   * @param {Array<Object>} batchItems - Array of items to convert.
   * @param {string} apiKey - API key for authentication.
   * @returns {Promise<Blob>} - The ZIP file blob.
   */
  static async convertBatch(batchItems, apiKey) {
    const endpoint = ENDPOINTS.CONVERT_BATCH;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'x-api-key': apiKey }) // Use 'x-api-key' as per backend expectation
      },
      body: JSON.stringify({ items: batchItems })
    };
    return this.makeRequest(endpoint, options);
  }

  /**
   * Converts a single file
   * @param {File} file - The file to convert.
   * @param {string} apiKey - API key for authentication.
   * @returns {Promise<Blob>} - The ZIP file blob.
   */
  static async convertFile(file, apiKey) {
    const endpoint = ENDPOINTS.CONVERT_FILE;
    const formData = new FormData();
    formData.append('file', file);

    const options = {
      method: 'POST',
      headers: {
        ...(apiKey && { 'x-api-key': apiKey }) // Use 'x-api-key' as per backend expectation
      },
      body: formData
    };
    return this.makeRequest(endpoint, options);
  }
}

export default ConversionClient;
export { ConversionError };
