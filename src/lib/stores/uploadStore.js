// src/lib/components/FileUploader/stores/uploadStore.js
import { writable } from 'svelte/store';

function createUploadStore() {
  const { subscribe, update, set } = writable({
    activeTab: 'single',
    dragOver: false,
    urlInput: '',
    youtubeUrlInput: '',
    errorMessage: '',
    feedbackTimeout: null
  });

  return {
    subscribe,
    setActiveTab: (tab) => update(state => ({ ...state, activeTab: tab })),
    setDragOver: (value) => update(state => ({ ...state, dragOver: value })),
    setUrlInput: (value) => update(state => ({ ...state, urlInput: value })),
    setYoutubeInput: (value) => update(state => ({ ...state, youtubeUrlInput: value })),
    setError: (message) => update(state => ({ ...state, errorMessage: message })),
    clearError: () => update(state => ({ ...state, errorMessage: '' })),
    reset: () => set({
      activeTab: 'single',
      dragOver: false,
      urlInput: '',
      youtubeUrlInput: '',
      errorMessage: '',
      feedbackTimeout: null
    })
  };
}

export const uploadStore = createUploadStore();