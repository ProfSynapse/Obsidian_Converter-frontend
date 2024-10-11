// src/lib/stores/conversionStatus.js

import { writable } from 'svelte/store';

const initialState = {
  status: 'idle',
  progress: 0,
  currentFile: '',
  error: null
};

/**
 * Creates and returns a conversion status store
 * @returns {Object} - The conversion status store with methods
 */
function createConversionStore() {
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    /**
     * Sets the current status
     * @param {string} status - The current status
     */
    setStatus: (status) => update(state => ({ ...state, status })),
    /**
     * Sets the current progress
     * @param {number} progress - The conversion progress percentage
     */
    setProgress: (progress) => update(state => ({ ...state, progress })),
    /**
     * Sets the current file being processed
     * @param {string} currentFile - The name of the current file
     */
    setCurrentFile: (currentFile) => update(state => ({ ...state, currentFile })),
    /**
     * Sets an error message and updates the status to 'error'
     * @param {string} error - The error message
     */
    setError: (error) => update(state => ({ ...state, error, status: error ? 'error' : state.status })),
    /**
     * Resets the conversion status to the initial state
     */
    reset: () => set(initialState),
    /**
     * Starts the conversion by setting status to 'converting'
     */
    startConversion: () => set({ ...initialState, status: 'converting' }),
    /**
     * Completes the conversion by setting status to 'completed' and progress to 100%
     */
    completeConversion: () => set({ status: 'completed', progress: 100, currentFile: '', error: null }),
  };
}

export const conversionStatus = createConversionStore();

// Derived stores for easy access to specific properties
import { derived } from 'svelte/store';

export const conversionProgress = derived(conversionStatus, $status => $status.progress);
export const currentFile = derived(conversionStatus, $status => $status.currentFile);
export const conversionError = derived(conversionStatus, $status => $status.error);
