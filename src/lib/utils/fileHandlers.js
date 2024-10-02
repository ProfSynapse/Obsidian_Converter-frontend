// src/lib/utils/fileHandlers.js
// Utility functions for handling files

export function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  }
  
  export function isValidFileType(file, allowedTypes) {
    const fileType = getFileExtension(file.name).toLowerCase();
    return allowedTypes.includes(fileType);
  }
  
  export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }