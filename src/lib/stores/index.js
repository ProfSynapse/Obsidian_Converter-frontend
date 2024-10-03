import { writable } from 'svelte/store';

export const apiKey = writable('');
export const files = writable([]);
export const conversionStatus = writable('idle');