// src/lib/stores/files.js

import { writable } from 'svelte/store';

/**
 * Possible statuses for a file
 * @type {'pending' | 'converting' | 'completed' | 'error'}
 */
const FileStatus = {
  PENDING: 'pending',
  CONVERTING: 'converting',
  COMPLETED: 'completed',
  ERROR: 'error',
};

/**
 * Possible types for a file
 * @type {'image' | 'video' | 'audio' | 'document' | 'url' | 'unknown'}
 */
const FileType = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  URL: 'url',
  UNKNOWN: 'unknown',
};

/**
 * Creates and returns a files store
 * @returns {Object} - The files store with methods
 */
function createFilesStore() {
  const { subscribe, update, set } = writable([]);

  return {
    subscribe,
    /**
     * Adds a new file to the store
     * @param {Object} file - The file object
     */
    addFile: (file) => update(files => [...files, file]),
    /**
     * Removes a file from the store by id
     * @param {string} id - The file's unique identifier
     */
    removeFile: (id) => update(files => files.filter(f => f.id !== id)),
    /**
     * Updates a file in the store
     * @param {string} id - The file's unique identifier
     * @param {Object} data - Partial data to update the file
     */
    updateFile: (id, data) => update(files =>
      files.map(file => (file.id === id ? { ...file, ...data } : file))
    ),
    /**
     * Clears all files from the store
     */
    clearFiles: () => set([]),
    /**
     * Retrieves all files from the store
     * @returns {Array} - Array of file objects
     */
    getFiles: () => {
      let files = [];
      subscribe(value => { files = value; })();
      return files;
    }
  };
}

export const files = createFilesStore();

// Exporting FileType and FileStatus as plain objects for use in components if needed
export { FileType, FileStatus };
