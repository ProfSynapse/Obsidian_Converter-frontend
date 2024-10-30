// src/lib/utils/api/client.js

import { ENDPOINTS } from './endpoints.js';
import { conversionStatus } from '$lib/stores/conversionStatus.js';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

/**
 * Configuration constants
 */
const CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  ZIP_COMPRESSION_LEVEL: 9,
  PROGRESS: {
    START: 0,
    CONVERTING: 50,
    ZIPPING: 75,
    DOWNLOADING: 90,
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
 * Validates and normalizes URLs
 */
class UrlValidator {
  static validate(url) {
    try {
      if (!url) throw new Error('URL is required');
      
      // Remove whitespace and normalize
      url = url.trim();
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url.replace(/^\/\//, '');
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
   * Makes an authenticated API request with retry logic
   */
  static async makeRequest(endpoint, options, apiKey, retries = CONFIG.MAX_RETRIES) {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          ...options.headers,
          'X-API-Key': apiKey
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ConversionError(
          data.error?.message || `Request failed with status ${response.status}`,
          'API_ERROR',
          data.error
        );
      }

      if (!data.success) {
        throw new ConversionError(
          data.error?.message || 'Conversion failed',
          'CONVERSION_ERROR',
          data.error
        );
      }

      return data;
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error)) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
        return this.makeRequest(endpoint, options, apiKey, retries - 1);
      }
      throw this.normalizeError(error);
    }
  }

  /**
   * Determines if request should be retried
   */
  static shouldRetry(error) {
    const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED'];
    return retryableCodes.includes(error.code) || error.name === 'NetworkError';
  }

  /**
   * Normalizes error format
   */
  static normalizeError(error) {
    if (error instanceof ConversionError) return error;
    return new ConversionError(error.message, 'REQUEST_ERROR', error);
  }

  /**
   * Converts a URL to markdown
   */
  static async convertUrl(urlObj, apiKey) {
    if (!urlObj?.url) {
      throw new ConversionError('Invalid URL object', 'INVALID_INPUT');
    }

    const validatedUrl = UrlValidator.validate(urlObj.url);
    console.log(`Converting URL: ${validatedUrl}`);

    const result = await this.makeRequest(
      ENDPOINTS.CONVERT_URL,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: validatedUrl })
      },
      apiKey
    );

    return {
      name: `${urlObj.name || new URL(validatedUrl).hostname}.md`,
      content: result.content,
      images: result.images || []
    };
  }

  /**
   * Converts a parent URL and its children
   */
  /**
 * Modified section of client.js for parent URL handling
 */
  static async convertParentUrl(parentUrlObj, apiKey) {
    try {
      const url = parentUrlObj.url || parentUrlObj.parentUrl;
      const validatedUrl = UrlValidator.validate(url);
      
      console.log(`Converting Parent URL: ${validatedUrl}`);

      // Modified request body structure
      const body = {
        url: validatedUrl,
        parentUrl: validatedUrl, // Include both for backwards compatibility
        options: {
          includeImages: true,
          maxDepth: Number.MAX_SAFE_INTEGER // No depth limit
        }
      };

      console.log('Sending request with body:', body);

      const result = await this.makeRequest(
        ENDPOINTS.CONVERT_PARENT_URL,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-API-Key': apiKey
          },
          body: JSON.stringify(body)
        },
        apiKey
      );

      // Add error check for empty result
      if (!result || !result.content) {
        throw new ConversionError('Empty response from server');
      }

      return {
        name: `${parentUrlObj.name || new URL(validatedUrl).hostname}.md`,
        content: result.content,
        images: result.images || [],
        childUrls: result.childUrls || []
      };

    } catch (error) {
      console.error('Parent URL conversion error:', error);
      throw new ConversionError(
        `Parent URL conversion failed: ${error.message}`,
        'PARENT_URL_ERROR',
        error
      );
    }
  }

  /**
   * Converts a file to markdown
   */
  static async convertFile(fileObj, apiKey) {
    if (!fileObj?.file) {
      throw new ConversionError('Invalid file object', 'INVALID_INPUT');
    }

    const formData = new FormData();
    formData.append('file', fileObj.file);
    formData.append('fileType', fileObj.file.name.split('.').pop().toLowerCase());

    console.log(`Converting file: ${fileObj.file.name}`);

    const result = await this.makeRequest(
      ENDPOINTS.CONVERT,
      {
        method: 'POST',
        body: formData
      },
      apiKey
    );

    return {
      name: fileObj.file.name.replace(/\.[^/.]+$/, '.md'),
      content: result.content,
      images: result.images || []
    };
  }

  /**
   * Creates a ZIP file from converted content
   */
  static async createZipFile(items) {
    const zip = new JSZip();

    for (const item of items) {
      // Add markdown file
      zip.file(item.name, item.content);

      // Add images if present
      if (item.images?.length > 0) {
        const baseName = item.name.replace('.md', '');
        const imagesFolder = zip.folder(`attachments/${baseName}`);

        for (const image of item.images) {
          try {
            imagesFolder.file(image.name, image.data, { base64: true });
          } catch (error) {
            console.error(`Error processing image ${image.name}:`, error);
          }
        }
      }
    }

    return zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: CONFIG.ZIP_COMPRESSION_LEVEL }
    });
  }

  /**
   * Updates conversion status and progress
   */
  static updateStatus(status, progress, file = null) {
    conversionStatus.setStatus(status);
    conversionStatus.setProgress(progress);
    if (file) conversionStatus.setCurrentFile(file);
  }

  /**
   * Converts multiple items to markdown
   */
  static async convertFiles(items, apiKey, onProgress) {
    if (!items?.length) {
      throw new ConversionError('No items to convert', 'NO_ITEMS');
    }

    try {
      console.log(`Starting conversion of ${items.length} items`);
      this.updateStatus('converting', CONFIG.PROGRESS.START);
      
      const convertedItems = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const progress = Math.round((i / items.length) * CONFIG.PROGRESS.CONVERTING);
        
        const itemName = this.getItemName(item);
        this.updateStatus('converting', progress, itemName);
        onProgress?.(progress);

        const convertedItem = await this.convertItem(item, apiKey);
        convertedItems.push(convertedItem);
      }

      await this.finalizeConversion(convertedItems, onProgress);
      
      console.log('Conversion completed successfully');

    } catch (error) {
      console.error('Conversion error:', error);
      this.updateStatus('error', CONFIG.PROGRESS.START);
      conversionStatus.setError(error.message);
      throw error;
    }
  }

  /**
   * Gets display name for an item
   */
  static getItemName(item) {
    return item.name || 
           item.url || 
           item.parentUrl || 
           item.file?.name || 
           'Unknown';
  }

  /**
   * Converts a single item based on its type
   */
  static async convertItem(item, apiKey) {
    switch (item.type) {
      case 'url':
        return await this.convertUrl(item, apiKey);
      case 'parentUrl':
        return await this.convertParentUrl(item, apiKey);
      case 'file':
        return await this.convertFile(item, apiKey);
      default:
        throw new ConversionError(
          `Unsupported item type: ${item.type}`,
          'INVALID_TYPE'
        );
    }
  }

  /**
   * Finalizes the conversion process
   */
  static async finalizeConversion(convertedItems, onProgress) {
    this.updateStatus('creating_zip', CONFIG.PROGRESS.ZIPPING);
    onProgress?.(CONFIG.PROGRESS.ZIPPING);
    
    const zipBlob = await this.createZipFile(convertedItems);
    
    this.updateStatus('generating_download', CONFIG.PROGRESS.DOWNLOADING);
    onProgress?.(CONFIG.PROGRESS.DOWNLOADING);
    
    FileSaver.saveAs(zipBlob, 'obsidian-vault.zip');
    
    this.updateStatus('completed', CONFIG.PROGRESS.COMPLETE);
    onProgress?.(CONFIG.PROGRESS.COMPLETE);
  }
}

export { ConversionClient as default, ConversionError };