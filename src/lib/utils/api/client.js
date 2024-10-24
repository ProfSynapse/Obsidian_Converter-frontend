// src/lib/utils/api/client.js
import { ENDPOINTS } from './endpoints.js';
import { conversionStatus } from '$lib/stores/conversionStatus.js';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

/**
 * Custom error class for handling conversion-specific errors
 */
export class ConversionError extends Error {
  constructor(message, code = 'CONVERSION_ERROR', details = null) {
    super(message);
    this.name = 'ConversionError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Converts single file and returns content with images
 * @param {Object} fileObj - File object to convert
 * @param {string} apiKey - API key for authentication
 * @returns {Promise<Object>} Converted file data with content and images
 */
async function convertSingleFile(fileObj, apiKey) {
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
    throw new ConversionError(
      `Failed to convert ${fileObj.file.name}`,
      'CONVERSION_ERROR',
      await response.text()
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
 * @param {Array} convertedFiles - Array of converted file objects
 * @returns {Promise<JSZip>} JSZip instance with all files
 */
/**
 * Creates ZIP file from converted content
 * @param {Array} convertedFiles - Array of converted file objects
 * @returns {Promise<JSZip>} JSZip instance with all files
 */
async function createZipFile(convertedFiles) {
  const zip = new JSZip();
  
  for (const file of convertedFiles) {
    // Add markdown file
    zip.file(file.name, file.content);

    // Add images if present
    if (file.images && file.images.length > 0) {
      const baseName = file.name.replace('.md', '');
      const imagesFolder = zip.folder(`attachments/${baseName}`);
      
      for (const image of file.images) {
        try {
          // Directly add base64 data to the ZIP without manual decoding
          imagesFolder.file(image.name, image.data, { base64: true });
        } catch (error) {
          console.error(`Error processing image ${image.name}:`, error);
          // Continue with other images if one fails
        }
      }
    }
  }

  return zip;
}

/**
 * Main conversion function
 * @param {Array} filesToConvert - Array of files to convert
 * @param {string} apiKey - API key for authentication
 * @param {Function} onProgress - Progress callback function
 */
export async function convertFiles(filesToConvert, apiKey, onProgress) {
  if (!filesToConvert.length) {
    throw new ConversionError('No files to convert', 'NO_FILES');
  }

  try {
    console.log(`Starting conversion of ${filesToConvert.length} files`);
    conversionStatus.setStatus('converting');
    conversionStatus.setProgress(0);

    const convertedFiles = [];
    const totalFiles = filesToConvert.length;

    // Convert each file one at a time
    for (let i = 0; i < filesToConvert.length; i++) {
      const fileObj = filesToConvert[i];
      
      conversionStatus.setCurrentFile(fileObj.file.name);
      const progress = Math.round((i / totalFiles) * 50); // First 50% for conversion
      conversionStatus.setProgress(progress);
      onProgress?.(progress);

      const convertedFile = await convertSingleFile(fileObj, apiKey);
      convertedFiles.push(convertedFile);
    }

    // Update status for ZIP creation
    conversionStatus.setStatus('creating_zip');
    conversionStatus.setProgress(75);
    onProgress?.(75);

    console.log('Creating ZIP file...');
    const zip = await createZipFile(convertedFiles);

    // Generate ZIP blob
    conversionStatus.setStatus('generating_download');
    conversionStatus.setProgress(90);
    onProgress?.(90);

    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });

    // Download
    console.log('Starting download...');
    FileSaver.saveAs(blob, 'obsidian-vault.zip');

    conversionStatus.setStatus('completed');
    conversionStatus.setProgress(100);
    onProgress?.(100);

    console.log('Conversion and download completed');

  } catch (error) {
    console.error('Error during conversion:', error);
    conversionStatus.setStatus('error');
    conversionStatus.setError(error.message);
    throw error;
  }
}

// Export all required functions and classes
export {
  convertSingleFile,
  createZipFile
};