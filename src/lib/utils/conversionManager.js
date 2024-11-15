// src/lib/utils/conversionManager.js

import { get } from 'svelte/store';
import { files } from '$lib/stores/files.js';
import { apiKey } from '$lib/stores/apiKey.js';
import { conversionStatus } from '$lib/stores/conversionStatus.js';
import client, { ConversionError } from '$lib/api/client.js';
import FileSaver from 'file-saver';

/**
 * Utility function to read a file as base64
 */
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
}

/**
 * Prepares a single item for conversion
 */
async function prepareItem(file) {
  try {
    const baseItem = {
      id: file.id,
      type: file.type,
      name: file.name
    };

    if (file.file) {
      const base64Content = await readFileAsBase64(file.file);
      return {
        ...baseItem,
        file: file.file,
        content: base64Content,
        options: {
          includeImages: true,
          includeMeta: true
        }
      };
    } else if (file.url) {
      // Normalize URL format before sending
      const normalizedUrl = file.url.trim()
        .replace(/\s+/g, '')
        .replace(/^\/\//, '');
        
      const url = !/^https?:\/\//i.test(normalizedUrl) 
        ? `https://${normalizedUrl}` 
        : normalizedUrl;

      return {
        ...baseItem,
        url,  // Send properly formatted URL
        options: {
          includeImages: true,
          includeMeta: true
        }
      };
    }

    throw new Error(`File ${file.name} is missing required properties`);
  } catch (error) {
    console.error(`Error preparing item ${file.name}:`, error);
    throw error;
  }
}


/**
 * Prepares items for batch conversion
 */
async function prepareBatchItems(filesArray) {
  const items = await Promise.all(filesArray.map(prepareItem));
  
  console.log('Prepared items for conversion:', items);
  return items;
}

/**
 * Starts the conversion process
 */
export async function startConversion() {
  const currentFiles = get(files);
  const currentApiKey = get(apiKey);

  if (currentFiles.length === 0) {
    const error = new Error('No files available for conversion.');
    conversionStatus.setError(error.message);
    conversionStatus.setStatus('error');
    console.error(error);
    return;
  }

  conversionStatus.reset();
  conversionStatus.setStatus('converting');

  try {
    // Prepare items for conversion
    const items = await prepareBatchItems(currentFiles);
    const itemCount = items.length;

    console.log('Starting conversion:', {
      itemCount,
      items
    });

    // Process items with progress tracking
    const results = await client.processItems(items, currentApiKey, {
      useBatch: itemCount > 1,
      onProgress: (progress) => {
        console.log(`Conversion progress: ${progress}%`);
        conversionStatus.setProgress(progress);
      },
      onItemComplete: (itemId, success, error) => {
        console.log(`Item ${itemId} completed:`, { success, error });
        const status = success ? 'completed' : 'error';
        files.updateFile(itemId, {
          status,
          error: error?.message || null
        });
      }
    });

    // Handle conversion results
    if (results.length === 0) {
      throw new Error('No conversion results received');
    }

    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);

    if (failedResults.length > 0) {
      const failedCount = failedResults.length;
      const failedItems = failedResults.map(r => r.error?.message || 'Unknown error').join('; ');
      throw new Error(
        `${failedCount} items failed to convert: ${failedItems}`
      );
    }

    // Save successful conversions
    const filename = itemCount === 1 ? 'converted_file.zip' : 'converted_files.zip';
    const blob = itemCount === 1 ? successfulResults[0].result : results[0].result;
    FileSaver.saveAs(blob, filename);

    // Update final status
    conversionStatus.setStatus('completed');
    showFeedback(`Successfully converted ${successfulResults.length} files`, 'success');

  } catch (error) {
    console.error('Conversion error:', error);

    const errorMessage = error instanceof ConversionError ? 
      error.message : 
      error.message || 'An unexpected error occurred during conversion';

    conversionStatus.setError(errorMessage);
    conversionStatus.setStatus('error');
    showFeedback(errorMessage, 'error');
  }
}

/**
 * Shows feedback message
 */
function showFeedback(message, type = 'info') {
  console.log(`${type.toUpperCase()}: ${message}`);
}