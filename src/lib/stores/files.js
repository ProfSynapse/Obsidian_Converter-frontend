// src/lib/stores/files.js
import { writable } from 'svelte/store';

/** @typedef {'pending' | 'converting' | 'completed' | 'error'} FileStatus */
/** @typedef {'image' | 'video' | 'audio' | 'document' | 'url' | 'unknown'} FileType */

/**
 * @typedef {Object} File
 * @property {string} id - Unique identifier for the file.
 * @property {string} name - Name of the file.
 * @property {FileType} type - Type of the file.
 * @property {FileStatus} status - Current status of the file.
 * @property {Blob} [file] - The actual file object (optional for URLs).
 * @property {string} [url] - The URL of the file (for URL type files).
 */

/**
 * @typedef {Object} FilesStore
 * @property {(callback: (value: File[]) => void) => () => void} subscribe - Svelte store subscribe function.
 * @property {(file: File) => void} addFile - Adds a new file to the store.
 * @property {(files: File[]) => void} addFiles - Adds multiple files to the store.
 * @property {(id: string, data: Partial<File>) => void} updateFile - Updates a file by id.
 * @property {(id: string) => void} removeFile - Removes a file by id.
 * @property {() => void} clearFiles - Clears all files from the store.
 * @property {() => File[]} getFiles - Gets all files from the store.
 */

/** @returns {FilesStore} */
const createFilesStore = () => {
  const { subscribe, update, set } = writable(/** @type {File[]} */ ([]));

  return {
    subscribe,
    addFile: (/** @type {File} */ file) => update(files => [...files, file]),
    addFiles: (/** @type {File[]} */ newFiles) => update(files => [...files, ...newFiles]),
    updateFile: (/** @type {string} */ id, /** @type {Partial<File>} */ data) => 
      update(files => files.map(file => file.id === id ? { ...file, ...data } : file)),
    removeFile: (/** @type {string} */ id) => 
      update(files => files.filter(file => file.id !== id)),
    clearFiles: () => set([]),
    getFiles: () => {
      /** @type {File[]} */
      let files = [];
      subscribe(value => { files = value; })();
      return files;
    }
  };
};

/** @type {FilesStore} */
export const files = createFilesStore();