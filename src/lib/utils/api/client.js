// src/lib/utils/api/client.js

import { ENDPOINTS } from './endpoints.js';
import { conversionStatus } from '$lib/stores/conversionStatus.js';
import FileSaver from 'file-saver';

/**
 * Configuration constants
 */
const CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  ZIP_COMPRESSION_LEVEL: 9,
  ITEM_TYPES: {
    FILE: 'file',
    URL: 'url',
    PARENT_URL: 'parent',
    YOUTUBE: 'youtube',
    BATCH: 'batch'
  },
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
      console.log(`Making request to ${endpoint}:`, {
        method: options.method,
        headers: options.headers,
        bodyType: options.body instanceof FormData ? 'FormData' : 'JSON'
      });

      // Log FormData details if present
      if (options.body instanceof FormData) {
        for (const [key, value] of options.body.entries()) {
          console.log(`FormData: ${key}:`, value);
        }
      } else if (typeof options.body === 'string') {
        console.log('Request body:', JSON.parse(options.body));
      }

      // Make the request
      const response = await fetch(endpoint, options);
      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new ConversionError(
          `Request failed with status ${response.status}: ${errorText}`,
          'API_ERROR'
        );
      }

      // Handle response based on content type
      const contentType = response.headers.get('Content-Type') || '';

      // Return blob for zip/binary responses
      if (contentType.includes('application/zip') || 
          contentType.includes('application/octet-stream')) {
        return await response.blob();
      }

      // Parse JSON responses
      const data = await response.json();
      if (!data.success) {
        throw new ConversionError(
          data.error?.message || 'Conversion failed',
          'CONVERSION_ERROR',
          data.error
        );
      }
      return data;

    } catch (error) {
      console.error('Request failed:', {
        endpoint,
        error: error.message,
        code: error.code
      });

      // Handle retries
      if (retries > 0 && this.shouldRetry(error)) {
        console.log(`Retrying request (${retries} attempts left)...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
        return this.makeRequest(endpoint, options, retries - 1);
      }

      throw error instanceof ConversionError ? error : 
        new ConversionError(error.message, 'REQUEST_ERROR', error);
    }
  }

  /**
   * Determines if a request should be retried based on the error.
   * @param {Error} error - The error to check.
   * @returns {boolean} - Whether to retry the request.
   */
  static shouldRetry(error) {
    const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED'];
    
    return error.name === 'NetworkError' ||
           retryableCodes.includes(error.code) ||
           (error instanceof ConversionError && error.code === 'API_ERROR');
  }

  /**
   * Converts a single URL
   * @param {string} url - The URL to convert
   * @param {string} apiKey - The API key for authentication
   * @returns {Promise<Blob>} - The ZIP file blob.
   */
  static async convertUrl(url, apiKey) {
    return this.makeRequest(ENDPOINTS.CONVERT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'x-api-key': apiKey })
      },
      body: JSON.stringify({ url })
    });
  }

  /**
   * Converts a parent URL and all its child pages
   * @param {string} parentUrl - The parent URL to convert
   * @param {string} apiKey - The API key for authentication
   * @returns {Promise<Blob>} - The ZIP file blob containing all converted pages.
   */
  static async convertParentUrl(parentUrl, apiKey) {
    return this.makeRequest(ENDPOINTS.CONVERT_PARENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'x-api-key': apiKey })
      },
      body: JSON.stringify({ parenturl: parentUrl })
    });
  }

  /**
   * Converts a YouTube URL to markdown
   * @param {string} youtubeUrl - The YouTube URL to convert
   * @param {string} apiKey - The API key for authentication
   * @returns {Promise<Blob>} - The ZIP file blob.
   */
  static async convertYoutube(youtubeUrl, apiKey) {
    return this.makeRequest(ENDPOINTS.CONVERT_YOUTUBE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'x-api-key': apiKey })
      },
      body: JSON.stringify({ url: youtubeUrl })
    });
  }

  /**
   * Converts a single file
   * @param {File} file - The file to convert.
   * @param {string} apiKey - API key for authentication.
   * @returns {Promise<Blob>} - The ZIP file blob.
   */
  static async convertFile(file, apiKey) {
    const formData = new FormData();
    formData.append('file', file);

    return this.makeRequest(ENDPOINTS.CONVERT_FILE, {
      method: 'POST',
      headers: {
        ...(apiKey && { 'x-api-key': apiKey })
      },
      body: formData
    });
  }

  /**
   * Converts multiple items as a batch
   * @param {Array<Object>} batchItems - Array of items to convert.
   * @param {string} apiKey - API key for authentication.
   * @returns {Promise<Blob>} - The ZIP file blob.
   */
  static async convertBatch(batchItems, apiKey) {
    return this.makeRequest(ENDPOINTS.CONVERT_BATCH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'x-api-key': apiKey })
      },
      body: JSON.stringify({ items: batchItems })
    });
  }

  /**
   * Converts a single item based on its type
   * @param {Object} item - The item to convert
   * @param {string} apiKey - The API key for authentication
   * @returns {Promise<Blob>} - The ZIP file blob
   */
  static async convertItem(item, apiKey) {
    console.log('Converting item:', item);

    switch(item.type) {
      case CONFIG.ITEM_TYPES.FILE:
        return this.convertFile(item.file, apiKey);
      
      case CONFIG.ITEM_TYPES.PARENT_URL:
        return this.convertParentUrl(item.url, apiKey);
      
      case CONFIG.ITEM_TYPES.YOUTUBE:
        return this.convertYoutube(item.url, apiKey);
      
      case CONFIG.ITEM_TYPES.URL:
        return this.convertUrl(item.url, apiKey);
      
      default:
        throw new ConversionError(`Unknown item type: ${item.type}`);
    }
  }

  /**
   * Process a list of items, either as batch or individually
   * @param {Array<Object>} items - The items to process
   * @param {string} apiKey - The API key for authentication
   * @param {boolean} useBatch - Whether to use batch processing
   * @returns {Promise<Array<{success: boolean, result: Blob|Error}>>} - Results array
   */
  static async processItems(items, apiKey, useBatch = false) {
    if (useBatch) {
      const blob = await this.convertBatch(items, apiKey);
      return [{ success: true, result: blob }];
    }

    const results = [];
    for (const item of items) {
      try {
        const blob = await this.convertItem(item, apiKey);
        results.push({ success: true, result: blob });
      } catch (error) {
        results.push({ success: false, result: error });
      }
    }
    return results;
  }
}

export default ConversionClient;
export { ConversionError, CONFIG };