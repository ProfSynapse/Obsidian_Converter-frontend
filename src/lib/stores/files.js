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
      console.log('📁 addFile called with:', file);
      if (!file.id) {
        file.id = crypto.randomUUID();
      }
      update(files => {
        console.log('📁 Current files in store:', files);
        console.log('📁 Adding new file:', file);
        return [...files, file];
      });
    },
    addFiles: (newFiles) => {
      console.log('📁 addFiles called with:', newFiles);
      update(files => {
        console.log('📁 Current files in store:', files);
        const updatedFiles = [...files, ...newFiles];
        console.log('📁 Updated files store:', updatedFiles);
        return updatedFiles;
      });
    },
    removeFile: (id) => {
      console.log('📁 Removing file:', id);
      update(files => files.filter(f => f.id !== id));
    },
    updateFile: (id, data) => {
      console.log('📁 Updating file:', id, 'with:', data);
      update(files => files.map(file => 
        file.id === id ? { ...file, ...data } : file
      ));
    },
    clearFiles: () => {
      console.log('📁 Clearing files store');
      set([]);
    },
    getFiles: () => {
      let files = [];
      subscribe(value => {
        files = value;
      })();
      console.log('📁 Getting files:', files);
      return files;
    }
  };
}

export const files = createFilesStore();