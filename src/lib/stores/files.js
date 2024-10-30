// src/lib/stores/files.js

import { writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates and returns an enhanced files store
 * @returns {Object} The files store instance
 */
function createFilesStore() {
  const { subscribe, update, set } = writable([]);

  /**
   * Helper to check for duplicates
   */
  function checkDuplicate(files, newFile) {
    return files.some(f => 
      (f.url && f.url === newFile.url) || 
      (f.name && f.name === newFile.name)
    );
  }

  return {
    subscribe,
    
    /**
     * Adds a file to the store
     * @returns {Object} Result object with success status and message
     */
    addFile: (file) => {
      let result = { success: false, message: '' };
      
      try {
        const newFile = {
          ...file,
          id: uuidv4()
        };
        
        update(files => {
          // Check for duplicates before adding
          if (checkDuplicate(files, newFile)) {
            result = { 
              success: false, 
              message: `File ${newFile.name || newFile.url} already exists` 
            };
            console.log('📁 Duplicate detected:', newFile.name || newFile.url);
            return files;
          }
          
          result = { 
            success: true, 
            message: `Added ${newFile.name || newFile.url} successfully` 
          };
          console.log('📁 Adding file:', newFile);
          return [...files, newFile];
        });

        return result;
      } catch (error) {
        console.error('📁 Error adding file:', error);
        return { 
          success: false, 
          message: error.message 
        };
      }
    },

    /**
     * Removes a file from the store
     * @returns {Object} Result object with success status and message
     */
    removeFile: (id) => {
      let result = { success: false, message: '' };
      
      update(files => {
        const initialLength = files.length;
        const updatedFiles = files.filter(f => f.id !== id);
        
        if (updatedFiles.length === initialLength) {
          result = { 
            success: false, 
            message: 'File not found' 
          };
          console.log('📁 File not found for removal:', id);
        } else {
          result = { 
            success: true, 
            message: 'File removed successfully' 
          };
          console.log('📁 Removed file:', id);
        }
        
        return updatedFiles;
      });

      return result;
    },

    /**
     * Updates a file in the store
     * @returns {Object} Result object with success status and message
     */
    updateFile: (id, data) => {
      let result = { success: false, message: '' };
      
      update(files => {
        const fileExists = files.some(f => f.id === id);
        if (!fileExists) {
          result = { 
            success: false, 
            message: 'File not found' 
          };
          return files;
        }

        result = { 
          success: true, 
          message: 'File updated successfully' 
        };
        
        return files.map(file => 
          file.id === id ? { ...file, ...data } : file
        );
      });

      return result;
    },

    clearFiles: () => {
      console.log('📁 Clearing all files');
      set([]);
      return { 
        success: true, 
        message: 'All files cleared' 
      };
    },

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