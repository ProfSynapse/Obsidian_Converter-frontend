// src/lib/utils/fileHandler.js

import { files } from '$lib/stores/files.js';

export function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getFileType(file) {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type === 'application/pdf') return 'pdf';
  if (file.type === 'text/plain') return 'text';
  if (file.type === 'text/html') return 'html';
  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  return 'document';
}

export function addFile(file) {
  const newFile = {
    id: generateUniqueId(),
    name: file.name,
    type: getFileType(file),
    size: file.size,
    lastModified: file.lastModified,
    status: 'pending',
    file: file
  };

  files.update(currentFiles => [...currentFiles, newFile]);
  return newFile;
}

export function removeFile(id) {
  files.update(currentFiles => currentFiles.filter(file => file.id !== id));
}

export function updateFileStatus(id, status) {
  files.update(currentFiles => 
    currentFiles.map(file => 
      file.id === id ? { ...file, status } : file
    )
  );
}

export function clearFiles() {
  files.set([]);
}

export async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => resolve(event.target.result);
    reader.onerror = error => reject(error);
    reader.readAsText(file);
  });
}

export async function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => resolve(event.target.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}