// src/lib/api/converters.js

import { CONFIG } from './config.js';
import { ConversionError, ErrorUtils } from './errors.js';
import { RequestHandler } from './requestHandler.js';
import { ENDPOINTS } from './endpoints.js';

/**
 * Default conversion options
 */
const DEFAULT_OPTIONS = {
  includeImages: true,
  includeMeta: true,
  convertLinks: true
};

/**
 * Handles different types of content conversion
 */
export class Converters {
  /**
   * Creates headers for API requests with standard options
   * @private
   */
  static _createHeaders(apiKey) {
    const headers = {
      'Accept': 'application/json, application/zip, application/octet-stream',
      'Content-Type': 'application/json'
    };
    
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }
    
    return headers;
  }

  /**
   * Validates and normalizes URL input
   * @private
   */
  static _normalizeUrl(url) {
    if (!url || typeof url !== 'string') {
      throw ConversionError.validation('URL is required');
    }

    const trimmed = url.trim().replace(/\s+/g, '');
    if (!trimmed) {
      throw ConversionError.validation('URL is required');
    }

    try {
      const normalizedUrl = !/^https?:\/\//i.test(trimmed) ? 
        `https://${trimmed}` : trimmed;
      new URL(normalizedUrl); // Validate URL format
      return normalizedUrl;
    } catch (error) {
      throw ConversionError.validation('Invalid URL format');
    }
  }

  /**
   * Prepares conversion request with standard options
   * @private
   */
  static _prepareRequest(input, type, apiKey) {
    if (!input?.url) {
      throw ConversionError.validation(`${type} URL is required`);
    }

    const normalizedUrl = this._normalizeUrl(input.url);
    const requestBody = {
      url: normalizedUrl,
      type: type.toLowerCase(),
      name: input.name?.trim() || 'Untitled',
      options: {
        ...DEFAULT_OPTIONS,
        ...input.options
      }
    };

    console.log(`🔄 Converting ${type}:`, { input, requestBody });

    return {
      method: 'POST',
      headers: this._createHeaders(apiKey),
      body: JSON.stringify(requestBody)
    };
  }

  /**
   * Makes conversion request with error handling
   * @private
   */
  static async _makeConversionRequest(endpoint, options, type) {
    try {
      return await RequestHandler.makeRequest(endpoint, options);
    } catch (error) {
      console.error(`❌ ${type} conversion error:`, error);
      throw ErrorUtils.wrap(error);
    }
  }

  /**
   * Converts a URL to markdown
   * @public
   */
  static async convertUrl(input, apiKey) {
    const options = this._prepareRequest(input, 'url', apiKey);
    return this._makeConversionRequest(ENDPOINTS.CONVERT_URL, options, 'URL');
  }

  /**
   * Converts URLs in batch
   * @public
   */
  static async convertBatch(items, apiKey) {
    if (!Array.isArray(items) || items.length === 0) {
      throw ConversionError.validation('Items must be an array');
    }

    const batchItems = items.map(item => ({
      type: item.type.toLowerCase(),
      url: item.url ? this._normalizeUrl(item.url) : null,
      name: item.name?.trim() || 'Untitled',
      options: {
        ...DEFAULT_OPTIONS,
        ...item.options
      }
    }));

    console.log('🔄 Converting batch:', { items: batchItems });

    const options = {
      method: 'POST',
      headers: this._createHeaders(apiKey),
      body: JSON.stringify({ items: batchItems })
    };

    return this._makeConversionRequest(ENDPOINTS.CONVERT_BATCH, options, 'Batch');
  }

  /**
   * Converts a YouTube video
   * @public
   */
  static async convertYoutube(input, apiKey) {
    const options = this._prepareRequest(input, 'youtube', apiKey);
    return this._makeConversionRequest(ENDPOINTS.CONVERT_YOUTUBE, options, 'YouTube');
  }

  /**
   * Converts a parent URL and its linked pages
   * @public
   */
  static async convertParentUrl(input, apiKey) {
    const options = this._prepareRequest(input, 'parent', apiKey);
    options.body = JSON.stringify({
      ...JSON.parse(options.body),
      parenturl: JSON.parse(options.body).url, // Rename url to parenturl
      url: undefined // Remove original url field
    });
    
    return this._makeConversionRequest(ENDPOINTS.CONVERT_PARENT_URL, options, 'Parent URL');
  }
}

// Export conversion methods
export const {
  convertUrl,
  convertBatch,
  convertYoutube,
  convertParentUrl
} = Converters;