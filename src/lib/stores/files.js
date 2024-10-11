// src/lib/stores/files.js
import { writable } from 'svelte/store';

/**
 * @typedef {'pending' | 'converting' | 'completed' | 'error'} FileStatus
 */

/**
 * @typedef {'image' | 'video' | 'audio' | 'document' | 'url' | 'unknown'} FileType
 */

/**
 * @typedef {Object} File
 * @property {string} id - Unique identifier for the file
 * @property {string} name - Name of the file
 * @property {FileType} type - Type of the file
 * @property {FileStatus} status - Current status of the file
 * @property {Blob} [file] - The actual file object (optional for URLs)
 * @property {string} [url] - The URL of the file (for URL type files)
 */

/**
 * @typedef {Object} FilesStore
 * @property {(run: (value: File[]) => void) => () => void} subscribe - Svelte store subscribe function
 * @property {(file: File) => void} addFile - Adds a new file to the store
 * @property {(id: string) => void} removeFile - Removes a file from the store by id
 * @property {(id: string, data: Partial<File>) => void} updateFile - Updates a file in the store
 * @property {() => void} clearFiles - Clears all files from the store
 * @property {() => File[]} getFiles - Gets all files from the store
 */

/**
 * Creates and returns a files store
 * @returns {FilesStore}
 */
function createFilesStore() {
  const { subscribe, update, set } = writable(/** @type {File[]} */ ([]));

  return {
    subscribe,
    /**
     * @param {File} file
     */
    addFile: (file) => update(files => [...files, file]),
    /**
     * @param {string} id
     */
    removeFile: (id) => update(files => files.filter(f => f.id !== id)),
    /**
     * @param {string} id
     * @param {Partial<File>} data
     */
    updateFile: (id, data) => update(files =>
      files.map(file => file.id === id ? { ...file, ...data } : file)
    ),
    clearFiles: () => set([]),
    getFiles: () => {
      /** @type {File[]} */
      let files = [];
      subscribe(value => { files = value; })();
      return files;
    }
  };
}

/** @type {FilesStore} */
export const files = createFilesStore();