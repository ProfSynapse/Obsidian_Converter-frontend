// src/lib/stores/apiKey.js

import { writable } from 'svelte/store';

function createApiKeyStore() {
    const { subscribe, set } = writable('');

    return {
        subscribe,
        set: (apiKey) => {
            set(apiKey);
            // Optionally save to localStorage here
            if (typeof window !== 'undefined') {
                localStorage.setItem('apiKey', apiKey);
            }
        },
        clear: () => {
            set('');
            // Clear from localStorage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('apiKey');
            }
        },
        // Initialize from localStorage if available
        init: () => {
            if (typeof window !== 'undefined') {
                const storedApiKey = localStorage.getItem('apiKey');
                if (storedApiKey) {
                    set(storedApiKey);
                }
            }
        }
    };
}

export const apiKey = createApiKeyStore();