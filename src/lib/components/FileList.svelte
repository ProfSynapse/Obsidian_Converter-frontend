<script>
  import { files } from '$lib/stores/files.js';
  import { getFileIcon } from '$lib/utils/iconUtils.js';
  import { onDestroy } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  export let title = 'Files';

  let filteredFiles = [];
  let selectedFiles = [];
  let selectAll = false;
  let isDragging = false;
  let draggedId = null;

  // Subscribe to files store
  const unsubscribe = files.subscribe(value => {
    filteredFiles = value;
    selectedFiles = selectedFiles.filter(id => 
      filteredFiles.some(file => file.id === id)
    );
    selectAll = filteredFiles.length > 0 && 
      selectedFiles.length === filteredFiles.length;
  });

  onDestroy(() => {
    unsubscribe();
  });

  function toggleFileSelection(fileId) {
    selectedFiles = selectedFiles.includes(fileId)
      ? selectedFiles.filter(id => id !== fileId)
      : [...selectedFiles, fileId];
  }

  function handleSelectAll() {
    selectedFiles = selectAll ? [] : filteredFiles.map(file => file.id);
    selectAll = !selectAll;
  }

  function removeSelectedFiles() {
    selectedFiles.forEach(id => {
      files.removeFile(id);
    });
    selectedFiles = [];
    selectAll = false;
  }

  function getFileTypeColor(type) {
    const types = {
      document: '#4A90E2',
      image: '#7ED321',
      video: '#F5A623',
      audio: '#BD10E0',
      url: '#50E3C2',
      parentUrl: '#9013FE',
      default: '#B8B8B8'
    };
    return types[type] || types.default;
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
</script>

<div class="file-list-container card animate-fade-in">
  <div class="section-header">
    <h3 class="section-title">
      <span class="icon">📑</span>
      {title}
      {#if filteredFiles.length > 0}
        <span class="file-count badge">
          {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
        </span>
      {/if}
    </h3>

    {#if filteredFiles.length > 0}
      <div class="actions-group" transition:fade>
        <label class="checkbox-wrapper">
          <input
            type="checkbox"
            checked={selectAll}
            on:change={handleSelectAll}
            id="select-all-checkbox"
            class="checkbox-input"
          />
          <span class="checkbox-custom"></span>
          <span class="checkbox-label">Select All</span>
        </label>
        
        {#if selectedFiles.length > 0}
          <button 
            class="btn btn-danger btn-sm"
            on:click={removeSelectedFiles}
            transition:fade
          >
            <span class="icon">🗑️</span>
            Remove ({selectedFiles.length})
          </button>
        {/if}
      </div>
    {/if}
  </div>

  {#if filteredFiles.length > 0}
    <ul class="file-list" role="list">
      {#each filteredFiles as file (file.id)}
        <li 
          class="file-card"
          animate:flip={{ duration: 300 }}
          transition:slide|local={{ duration: 300 }}
        >
          <div class="file-card-content">
            <label class="checkbox-wrapper file-select">
              <input
                type="checkbox"
                checked={selectedFiles.includes(file.id)}
                on:change={() => toggleFileSelection(file.id)}
                class="checkbox-input"
              />
              <span class="checkbox-custom"></span>
            </label>

            <div class="file-icon-wrapper" style="--file-color: {getFileTypeColor(file.type)}">
              <span class="file-icon" aria-hidden="true">
                {getFileIcon(file.type)}
              </span>
            </div>

            <div class="file-details">
              <span class="file-name">{file.name}</span>
              <div class="file-meta">
                {#if file.size}
                  <span class="file-size">{formatFileSize(file.size)}</span>
                {/if}
                <span class="file-type">{file.type}</span>
                {#if file.status}
                  <span class="file-status" class:is-pending={file.status === 'pending'}>
                    {file.status}
                  </span>
                {/if}
              </div>
            </div>

            <button
              class="remove-button"
              on:click={() => files.removeFile(file.id)}
              aria-label="Remove file"
            >
              <span class="icon">✖️</span>
            </button>
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <div class="empty-state" transition:fade>
      <div class="empty-state-content">
        <span class="empty-icon">📂</span>
        <h4 class="empty-title">No files yet</h4>
        <p class="empty-description">
          Drop files or use the uploader above to add files for conversion
        </p>
      </div>
    </div>
  {/if}
</div>

<style>
  .file-list-container {
    --file-card-height: 72px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--color-background-secondary);
    margin-bottom: var(--spacing-lg);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin: 0;
  }

  .file-count {
    margin-left: var(--spacing-xs);
  }

  .actions-group {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  /* File List Styling */
  .file-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .file-card {
    background: var(--color-surface);
    border-radius: var(--rounded-lg);
    height: var(--file-card-height);
    transition: all var(--transition-duration-normal) var(--transition-timing-ease);
    border: 1px solid var(--color-background-secondary);
  }

  .file-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-prime);
  }

  .file-card-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    height: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
  }

  /* File Icon Styling */
  .file-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--rounded-lg);
    background: color-mix(in srgb, var(--file-color) 10%, transparent);
    color: var(--file-color);
  }

  .file-icon {
    font-size: var(--font-size-xl);
  }

  /* File Details Styling */
  .file-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    min-width: 0;
  }

  .file-name {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .file-size,
  .file-type {
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
  }

  .file-status {
    padding: var(--spacing-2xs) var(--spacing-xs);
    border-radius: var(--rounded-full);
    font-size: var(--font-size-xs);
    background: var(--color-background-secondary);
  }

  .file-status.is-pending {
    background: var(--color-warning-light);
    color: var(--color-warning);
  }

  /* Checkbox Styling */
  .checkbox-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    cursor: pointer;
  }

  .checkbox-input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }

  .checkbox-custom {
    width: 20px;
    height: 20px;
    border: 2px solid var(--color-prime);
    border-radius: var(--rounded-sm);
    background: var(--color-background-primary);
    transition: all var(--transition-duration-normal) var(--transition-timing-ease);
  }

  .checkbox-input:checked + .checkbox-custom {
    background: var(--color-prime);
    border-color: var(--color-prime);
  }

  .checkbox-input:checked + .checkbox-custom::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 12px;
  }

  /* Remove Button Styling */
  .remove-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    border-radius: var(--rounded-full);
    cursor: pointer;
    opacity: 0;
    transition: all var(--transition-duration-normal) var(--transition-timing-ease);
    color: var(--color-text-secondary);
  }

  .file-card:hover .remove-button {
    opacity: 1;
  }

  .remove-button:hover {
    background: var(--color-error-light);
    color: var(--color-error);
  }

  /* Empty State Styling */
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    background: var(--color-background-secondary);
    border-radius: var(--rounded-lg);
    padding: var(--spacing-xl);
  }

  .empty-state-content {
    text-align: center;
  }

  .empty-icon {
    font-size: var(--font-size-4xl);
    margin-bottom: var(--spacing-md);
    display: inline-block;
  }

  .empty-title {
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-xs);
    font-size: var(--font-size-lg);
  }

  .empty-description {
    color: var(--color-text-secondary);
    margin: 0;
  }

  /* Responsive Design */
  @media (max-width: 640px) {
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);
    }

    .actions-group {
      width: 100%;
      justify-content: space-between;
    }

    .file-card-content {
      padding: var(--spacing-xs);
    }

    .file-meta {
      flex-wrap: wrap;
    }
  }
</style>