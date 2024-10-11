// src/lib/utils/fileHandler.js

import { files } from '$lib/stores/files.js';

/**
 * Generates a unique ID for files
 * @returns {string} - A unique identifier
 */
export function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Determines the file type based on MIME type
 * @param {Object} file - The file object
 * @returns {string} - The type of the file
 */
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

/**
 * Adds a file to the store
 * @param {File} file - The file object to add
 * @returns {Object} - The added file object
 */
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

  files.addFile(newFile);
  return newFile;
}

/**
 * Removes a file from the store by ID
 * @param {string} id - The unique identifier of the file
 */
export function removeFile(id) {
  files.removeFile(id);
}

/**
 * Updates the status of a file in the store
 * @param {string} id - The unique identifier of the file
 * @param {string} status - The new status of the file
 */
export function updateFileStatus(id, status) {
  files.updateFile(id, { status });
}

/**
 * Clears all files from the store
 */
export function clearFiles() {
  files.clearFiles();
}

/**
 * Reads a file as text
 * @param {File} file - The file to read
 * @returns {Promise<string>} - The file content as text
 */
export async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => resolve(event.target.result);
    reader.onerror = error => reject(error);
    reader.readAsText(file);
  });
}

/**
 * Reads a file as Data URL
 * @param {File} file - The file to read
 * @returns {Promise<string>} - The file content as Data URL
 */
export async function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => resolve(event.target.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

import { Document, VideoCamera, MusicalNote, Photo, Link } from 'svelte-hero-icons';

/**
 * Maps file types to their respective icon components
 */
const iconMap = {
  document: Document,
  video: VideoCamera,
  audio: MusicalNote,
  image: Photo,
  url: Link,
};

/**
 * Retrieves the appropriate icon component based on file type
 * @param {string} type - The type of the file
 * @returns {SvelteComponent} - The icon component
 */
export function getFileIconComponent(type) {
  return iconMap[type] || Document;
}
