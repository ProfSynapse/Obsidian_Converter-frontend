// src/lib/components/FileUploader/useFileUpload.js

import { writable } from 'svelte/store';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'text/plain', 'text/markdown', 'text/html',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg', 'image/png', 'image/gif',
  'audio/mpeg', 'audio/wav',
  'video/mp4', 'video/quicktime'
];

/**
 * @typedef {Object} FileObject
 * @property {File} file - The File object
 * @property {string} type - The type of the file
 * @property {string} status - The status of the file
 */

/**
 * @typedef {Object} UrlObject
 * @property {string} url - The URL string
 * @property {string} type - The type (always 'url')
 * @property {string} status - The status of the URL
 */

/**
 * @typedef {FileObject | UrlObject} UploadItem
 */

/**
 * Hook for file upload functionality
 * @returns {Object} File upload methods and store
 */
export function useFileUpload() {
  /** @type {import('svelte/store').Writable<UploadItem[]>} */
  const { subscribe, update } = writable([]);

  /**
   * @param {File} file
   * @throws {Error}
   */
  function validateFile(file) {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('Unsupported file type');
    }
  }

  /**
   * @param {string} url
   * @throws {Error}
   */
  function validateUrl(url) {
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL');
    }
  }

  /**
   * @param {File[]} newFiles
   */
  function addFiles(newFiles) {
    update(/** @param {UploadItem[]} files */ files => {
      const validFiles = [...files];
      for (let file of newFiles) {
        try {
          validateFile(file);
          validFiles.push({ file, type: getFileType(file.type), status: 'pending' });
        } catch (/** @type {any} */ error) {
          console.error(`Error adding file ${file.name}:`, error.message);
        }
      }
      return validFiles;
    });
  }

  /**
   * @param {string} url
   */
  function addUrl(url) {
    update(/** @param {UploadItem[]} files */ files => {
      try {
        validateUrl(url);
        return [...files, { url, type: 'url', status: 'pending' }];
      } catch (/** @type {any} */ error) {
        console.error('Error adding URL:', error.message);
        return files;
      }
    });
  }

  /**
   * @param {number} index
   */
  function removeFile(index) {
    update(files => files.filter((_, i) => i !== index));
  }

  function clearFiles() {
    update(() => []);
  }

  /**
   * @param {string} mimeType
   * @returns {string}
   */
  function getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }

  /**
   * @param {HTMLElement} node
   */
  function useFileUploadAction(node) {
    /**
     * @param {DragEvent} event
     */
    const handleDragOver = (event) => {
      event.preventDefault();
      node.classList.add('drag-over');
    };

    const handleDragLeave = () => {
      node.classList.remove('drag-over');
    };

    /**
     * @param {DragEvent} event
     */
    const handleDrop = (event) => {
      event.preventDefault();
      node.classList.remove('drag-over');
      if (event.dataTransfer && event.dataTransfer.files) {
        const droppedFiles = event.dataTransfer.files;
        addFiles(Array.from(droppedFiles));
      }
    };

    node.addEventListener('dragover', handleDragOver);
    node.addEventListener('dragleave', handleDragLeave);
    node.addEventListener('drop', handleDrop);

    return {
      destroy() {
        node.removeEventListener('dragover', handleDragOver);
        node.removeEventListener('dragleave', handleDragLeave);
        node.removeEventListener('drop', handleDrop);
      }
    };
  }

  return {
    subscribe,
    addFiles,
    addUrl,
    removeFile,
    clearFiles,
    useFileUploadAction
  };
}