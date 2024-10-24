// src/lib/stores/files.js

import { writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates and returns a files store
 */
function createFilesStore() {
  const { subscribe, update, set } = writable([]);

  return {
    subscribe,
    addFile: (file) => {
      console.log('files.addFile called with:', file);
      update(files => [...files, file]);
    },
    addFiles: (newFiles) => {
      update(files => [
        ...files,
        ...newFiles.map(file => ({
          id: uuidv4(), // Generate a unique ID for frontend tracking
          fileId: file.fileId, // Store the backend-provided fileId
          name: file.metadata.originalName || 'unknown',
          type: file.metadata.type || 'unknown',
          status: 'completed', // Assuming conversion was successful
          convertedContent: file.content || null
        }))
      ]);
    },
    removeFile: (id) => update(files => files.filter(f => f.id !== id)),
    updateFile: (id, data) => update(files =>
      files.map(file => (file.id === id ? { ...file, ...data } : file))
    ),
    clearFiles: () => set([]),
    getFiles: () => {
      let files = [];
      subscribe(value => {
        files = value;
      })();
      return files;
    }
  };
}

export const files = createFilesStore();
