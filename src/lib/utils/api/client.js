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
  /**
   * Creates an instance of ConversionError.
   * @param {string} message - Error message.
   * @param {string} [code='CONVERSION_ERROR'] - Error code.
   * @param {any} [details=null] - Additional error details.
   */
  constructor(message, code = 'CONVERSION_ERROR', details = null) {
    super(message);
    this.name = 'ConversionError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Validates and normalizes URLs
 */
class UrlValidator {
  /**
   * Validates and normalizes a given URL.
   * @param {string} url - The URL to validate.
   * @returns {string} - The validated and normalized URL.
   * @throws {ConversionError} - If validation fails.
   */
  static validate(url) {
    try {
      if (!url) throw new Error('URL is required');
      
      // Remove whitespace and normalize
      url = url.trim();
      
      // Add https:// if missing
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      
      // Validate URL format
      const urlObj = new URL(url);
      
      // Validate domain format
      if (!/^[^.]+\.[^.]+/.test(urlObj.hostname)) {
        throw new Error('Invalid domain format');
      }
      
      return urlObj.href;
    } catch (error) {
      throw new ConversionError(
        `URL validation failed: ${error.message}`,
        'INVALID_URL'
      );
    }
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
      // Log request attempt
      console.log('Making API request:', {
        endpoint,
        method: options.method,
        retries
      });

      // Ensure we have valid options
      if (!options || typeof options !== 'object') {
        throw new Error('Invalid request options');
      }

      // Make the request
      const response = await fetch(endpoint, {
        ...options
      });

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
      
      if (contentType && (
          contentType.includes('application/zip') || 
          contentType.includes('application/octet-stream')
      )) {
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
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
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
   * Normalizes error format with safe handling of undefined values.
   * @param {Error} error - The error to normalize.
   * @returns {ConversionError} - Normalized error.
   */
  static normalizeError(error) {
    // Already a ConversionError
    if (error instanceof ConversionError) {
        return error;
    }

    // Handle different error types safely
    let message = 'An unknown error occurred';
    let code = 'UNKNOWN_ERROR';
    
    try {
        if (error instanceof Error) {
            message = error.message;
            code = 'JS_ERROR';
        } else if (typeof error === 'string') {
            message = error;
            code = 'STRING_ERROR';
        } else if (error && typeof error === 'object') {
            message = error.message || JSON.stringify(error);
            code = 'OBJECT_ERROR';
        }
    } catch (e) {
        console.error('Error while normalizing error:', e);
    }

    return new ConversionError(message, code, error);
  }

  /**
   * Batch converts multiple items and downloads the consolidated ZIP.
   * @param {Array<Object>} batchItems - Array of items to convert.
   * @param {string} apiKey - API key for authentication.
   * @returns {Promise<Object>} - The API response data.
   * @throws {ConversionError} - If the conversion fails.
   */
  static async convertFiles(batchItems, apiKey) {
    const endpoint = ENDPOINTS.CONVERT;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ items: batchItems })
    };
    
    return this.makeRequest(endpoint, options);
  }

  /**
   * Stops the ongoing conversion process.
   * @returns {Promise<Object>} - The API response data.
   * @throws {ConversionError} - If stopping the conversion fails.
   */
  static async stopConversion() {
    const endpoint = ENDPOINTS.STOP_CONVERSION;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    return this.makeRequest(endpoint, options);
  }

  /**
   * Downloads partial conversion results as a ZIP file.
   * @returns {Promise<Blob>} - The ZIP file blob.
   * @throws {ConversionError} - If downloading partial results fails.
   */
  static async downloadPartialResults() {
    const endpoint = ENDPOINTS.DOWNLOAD_PARTIAL;
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/zip'
      }
    };
    
    return this.makeRequest(endpoint, options);
  }
}

export default ConversionClient;
export { ConversionError };
