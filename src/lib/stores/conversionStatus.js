// src/lib/stores/conversionStatus.js
// @ts-nocheck

import { writable, derived } from 'svelte/store';

const initialState = {
  status: 'idle',
  progress: 0,
  currentFile: '',
  error: null,
};

function createConversionStore() {
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    setStatus: (status) =>
      update((state) => ({ ...state, status })),
    setProgress: (progress) =>
      update((state) => ({ ...state, progress })),
    setCurrentFile: (currentFile) =>
      update((state) => ({ ...state, currentFile })),
    setError: (error) =>
      update((state) => ({ ...state, error, status: error ? 'error' : state.status })),
    reset: () => set(initialState),
    startConversion: () =>
      set({ ...initialState, status: 'converting' }),
    completeConversion: () =>
      set({ status: 'completed', progress: 100, currentFile: '', error: null }),
  };
}

export const conversionStatus = createConversionStore();

// Derived stores for easy access to specific properties
export const conversionProgress = derived(conversionStatus, ($status) => $status.progress);
export const currentFile = derived(conversionStatus, ($status) => $status.currentFile);
export const conversionError = derived(conversionStatus, ($status) => $status.error);
