// src/lib/stores/apiKey.js
// Store for managing the API key

import { writable } from 'svelte/store';

// Create a writable store for the API key
// Initialize it with a value from localStorage if available
const storedApiKey = localStorage.getItem('apiKey') || '';
export const apiKey = writable(storedApiKey);

// Subscribe to changes and update localStorage
apiKey.subscribe(value => {
  localStorage.setItem('apiKey', value);
});