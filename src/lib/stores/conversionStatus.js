// src/lib/stores/conversionStatus.js
// Store for managing the conversion status

import { writable } from 'svelte/store';

// Create a writable store for the conversion status
// Possible values: 'idle', 'processing', 'completed', 'error'
export const conversionStatus = writable('idle');