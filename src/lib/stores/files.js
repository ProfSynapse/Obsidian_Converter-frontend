// src/lib/stores/files.js
import { writable } from 'svelte/store';

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
