// src/lib/actions/useFileUpload.js
// Svelte action for handling file uploads

import { files } from '../stores/files';

export function useFileUpload(node) {
  const handleChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    files.update(currentFiles => [...currentFiles, ...selectedFiles]);
  };

  node.addEventListener('change', handleChange);

  return {
    destroy() {
      node.removeEventListener('change', handleChange);
    }
  };
}