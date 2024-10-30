// in stores/files.js
import { writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';

function createFilesStore() {
  const { subscribe, update, set } = writable([]);

  return {
    subscribe,
    
    addFile: (file) => {
      console.log('📁 Adding file:', file);
      // Always generate a new ID when adding a file
      const newFile = {
        ...file,
        id: uuidv4() // Generate new ID even if one exists
      };
      
      update(files => {
        // Check for duplicates before adding
        const isDuplicate = files.some(f => 
          (f.url && f.url === newFile.url) || 
          (f.name && f.name === newFile.name)
        );
        
        if (isDuplicate) {
          console.log('📁 Duplicate file detected, skipping:', newFile);
          return files;
        }
        
        console.log('📁 Adding new file to store:', newFile);
        return [...files, newFile];
      });
    },

    removeFile: (id) => {
      console.log('📁 Removing file:', id);
      update(files => {
        const updatedFiles = files.filter(f => f.id !== id);
        console.log('📁 Updated files after removal:', updatedFiles);
        return updatedFiles;
      });
    },

    updateFile: (id, data) => {
      update(files => files.map(file => 
        file.id === id ? { ...file, ...data } : file
      ));
    },

    clearFiles: () => {
      console.log('📁 Clearing all files');
      set([]);
    },

    // New method to check if a file exists
    hasFile: (url) => {
      let exists = false;
      update(files => {
        exists = files.some(f => f.url === url);
        return files;
      });
      return exists;
    }
  };
}

export const files = createFilesStore();