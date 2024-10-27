// src/lib/utils/api/client.js

import { ENDPOINTS } from './endpoints.js';
import { conversionStatus } from '$lib/stores/conversionStatus.js';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

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
 * Converts a URL to markdown content and images
 * @param {Object} urlObj - URL object containing url and name
 * @param {string} apiKey - API key for authentication
 * @returns {Promise<Object>} Converted content and images
 */
async function convertUrl(urlObj, apiKey) {
  if (!urlObj?.url) {
    throw new ConversionError('Invalid URL object');
  }

  console.log(`Converting URL: ${urlObj.url}`);
  
  const response = await fetch(ENDPOINTS.CONVERT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    },
    body: JSON.stringify({ url: urlObj.url })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new ConversionError(
      `Failed to convert URL: ${urlObj.url}. Error: ${errorData.error.message}`,
      'URL_CONVERSION_ERROR',
      errorData.error.details
    );
  }

  const result = await response.json();
  if (!result.success) {
    throw new ConversionError(
      result.error?.message || `Failed to convert URL: ${urlObj.url}`
    );
  }

  return {
    name: `${urlObj.name || new URL(urlObj.url).hostname}.md`,
    content: result.content,
    images: result.images || []
  };
}

/**
 * Converts a Parent URL and its child pages to markdown content
 * @param {Object} parentUrlObj - Parent URL object containing parentUrl and name
 * @param {string} apiKey - API key for authentication
 * @returns {Promise<Object>} Converted content and images
 */
async function convertParentUrl(parentUrlObj, apiKey) {
  if (!parentUrlObj?.parentUrl) {
    throw new ConversionError('Invalid Parent URL object');
  }

  console.log(`Converting Parent URL: ${parentUrlObj.parentUrl}`);
  
  const response = await fetch(ENDPOINTS.CONVERT_PARENT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    },
    body: JSON.stringify({ parentUrl: parentUrlObj.parentUrl })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new ConversionError(
      `Failed to convert Parent URL: ${parentUrlObj.parentUrl}. Error: ${errorData.error.message}`,
      'PARENT_URL_CONVERSION_ERROR',
      errorData.error.details
    );
  }

  const result = await response.json();
  if (!result.success) {
    throw new ConversionError(
      result.error?.message || `Failed to convert Parent URL: ${parentUrlObj.parentUrl}`
    );
  }

  return {
    name: `${parentUrlObj.name || new URL(parentUrlObj.parentUrl).hostname}.md`,
    content: result.content,
    images: result.images || []
  };
}

/**
 * Converts a file to markdown content and images
 * @param {Object} fileObj - File object containing file data
 * @param {string} apiKey - API key for authentication
 * @returns {Promise<Object>} Converted content and images
 */
async function convertFile(fileObj, apiKey) {
  if (!fileObj?.file) {
    throw new ConversionError('Invalid file object');
  }

  const formData = new FormData();
  formData.append('file', fileObj.file);
  formData.append('fileType', fileObj.file.name.split('.').pop().toLowerCase());

  console.log(`Converting file: ${fileObj.file.name}`);
  
  const response = await fetch(ENDPOINTS.CONVERT, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new ConversionError(
      `Failed to convert ${fileObj.file.name}`,
      'CONVERSION_ERROR',
      errorData.error.message
    );
  }

  const result = await response.json();
  if (!result.success) {
    throw new ConversionError(
      result.error?.message || `Failed to convert ${fileObj.file.name}`
    );
  }

  return {
    name: fileObj.file.name.replace(/\.[^/.]+$/, '.md'),
    content: result.content,
    images: result.images || []
  };
}

/**
 * Creates ZIP file from converted content
 * @param {Array} convertedItems - Array of converted items
 * @returns {Promise<JSZip>} JSZip instance with all content
 */
async function createZipFile(convertedItems) {
  const zip = new JSZip();
  
  for (const item of convertedItems) {
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

  return zip;
}

/**
 * Main conversion function
 * @param {Array} itemsToConvert - Array of items to convert (files, URLs, or Parent URLs)
 * @param {string} apiKey - API key for authentication
 * @param {Function} onProgress - Progress callback function
 */
async function convertFiles(itemsToConvert, apiKey, onProgress) {
  if (!itemsToConvert?.length) {
    throw new ConversionError('No items to convert', 'NO_ITEMS');
  }

  try {
    console.log(`Starting conversion of ${itemsToConvert.length} items`);
    conversionStatus.setStatus('converting');
    conversionStatus.setProgress(0);
    conversionStatus.setError(null);

    const convertedItems = [];
    const totalItems = itemsToConvert.length;

    for (let i = 0; i < itemsToConvert.length; i++) {
      const item = itemsToConvert[i];
      
      // Determine item name and type
      let itemName = '';
      if (item.type === 'url') {
        itemName = item.name || new URL(item.url).hostname;
      } else if (item.type === 'parentUrl') {
        itemName = item.name || new URL(item.parentUrl).hostname;
      } else if (item.type === 'file') {
        itemName = item.file.name;
      } else {
        throw new ConversionError(`Unsupported item type: ${item.type}`);
      }
      
      conversionStatus.setCurrentFile(itemName);
      const progress = Math.round((i / totalItems) * 50);
      conversionStatus.setProgress(progress);
      onProgress?.(progress);

      // Convert based on type
      let convertedItem;
      if (item.type === 'url') {
        convertedItem = await convertUrl(item, apiKey);
      } else if (item.type === 'parentUrl') {
        convertedItem = await convertParentUrl(item, apiKey);
      } else if (item.type === 'file') {
        convertedItem = await convertFile(item, apiKey);
      } else {
        throw new ConversionError(`Unsupported item type: ${item.type}`);
      }

      convertedItems.push(convertedItem);
    }

    // Create ZIP
    conversionStatus.setStatus('creating_zip');
    conversionStatus.setProgress(75);
    onProgress?.(75);

    const zip = await createZipFile(convertedItems);

    // Generate and download
    conversionStatus.setStatus('generating_download');
    conversionStatus.setProgress(90);
    onProgress?.(90);

    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });

    console.log('Starting download...');
    FileSaver.saveAs(blob, 'obsidian-vault.zip');

    conversionStatus.setStatus('completed');
    conversionStatus.setProgress(100);
    onProgress?.(100);

    console.log('Conversion completed successfully');

  } catch (error) {
    console.error('Conversion error:', error);
    conversionStatus.setStatus('error');
    conversionStatus.setError(error.message);
    throw error;
  }
}

// Single export statement for all functions and classes
export {
  convertFiles,
  convertUrl,
  convertParentUrl, // Export the new function
  convertFile,
  createZipFile,
  ConversionError
};
