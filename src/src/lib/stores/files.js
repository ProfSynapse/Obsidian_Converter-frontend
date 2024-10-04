// src/lib/stores/files.js

import { writable } from 'svelte/store';

function createFilesStore() {
    const { subscribe, set, update } = writable([]);

    return {
        subscribe,
        addFile: (file) => update(files => [...files, file]),
        updateFile: (id, newData) => update(files =>
            files.map(file => file.id === id ? { ...file, ...newData } : file)
        ),
        removeFile: (id) => update(files => files.filter(file => file.id !== id)),
        clearFiles: () => set([]),
        setFiles: set
    };
}

export const files = createFilesStore();