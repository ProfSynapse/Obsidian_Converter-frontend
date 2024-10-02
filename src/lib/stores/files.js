// src/lib/stores/files.js
// Store for managing the list of files to be converted

import { writable } from 'svelte/store';

// Create a writable store for the files
export const files = writable([]);