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

export function useFileUpload() {
  const { subscribe, update } = writable([]);

  function validateFile(file) {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('Unsupported file type');
    }
  }

  function validateUrl(url) {
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL');
    }
  }

  function addFiles(newFiles) {
    update(files => {
      const validFiles = [...files];
      for (let file of newFiles) {
        try {
          validateFile(file);
          validFiles.push({ file, type: getFileType(file.type), status: 'pending' });
        } catch (error) {
          console.error(`Error adding file ${file.name}:`, error.message);
        }
      }
      return validFiles;
    });
  }

  function addUrl(url) {
    update(files => {
      try {
        validateUrl(url);
        return [...files, { url, type: 'url', status: 'pending' }];
      } catch (error) {
        console.error('Error adding URL:', error.message);
        return files;
      }
    });
  }

  function removeFile(index) {
    update(files => files.filter((_, i) => i !== index));
  }

  function clearFiles() {
    update(() => []);
  }

  function getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }

  function useFileUploadAction(node) {
    const handleDragOver = (event) => {
      event.preventDefault();
      node.classList.add('drag-over');
    };

    const handleDragLeave = () => {
      node.classList.remove('drag-over');
    };

    const handleDrop = (event) => {
      event.preventDefault();
      node.classList.remove('drag-over');
      const droppedFiles = event.dataTransfer.files;
      addFiles(droppedFiles);
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