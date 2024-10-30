<script>
  import { files } from '$lib/stores/files.js';
  import { getFileIcon } from '$lib/utils/iconUtils.js';
  import { onDestroy } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  // Props
  export let title = 'Files';

  // Local state
  let filteredFiles = [];
  let selectedFiles = new Set();
  let selectAll = false;
  let isDragging = false;
  let draggedId = null;

  // Subscribe to files store
  const unsubscribe = files.subscribe(value => {
    filteredFiles = value;
    // Update selected files to remove any that no longer exist
    selectedFiles = new Set(
      Array.from(selectedFiles).filter(id => 
        filteredFiles.some(file => file.id === id)
      )
    );
    selectAll = filteredFiles.length > 0 && 
      selectedFiles.size === filteredFiles.length;
  });

  // Cleanup subscription on component destroy
  onDestroy(() => {
    unsubscribe();
  });

  /**
   * Handles toggling selection of a single file
   * @param {string} fileId - The ID of the file to toggle
   */
  function toggleFileSelection(fileId) {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    selectedFiles = newSelected;
    selectAll = filteredFiles.length === selectedFiles.size;
  }

  /**
   * Handles toggling selection of all files
   */
  function handleSelectAll() {
    if (selectAll) {
      selectedFiles = new Set();
    } else {
      selectedFiles = new Set(filteredFiles.map(file => file.id));
    }
    selectAll = !selectAll;
  }

  /**
   * Removes a single file from the store
   * @param {string} id - The ID of the file to remove
   */
  function removeFile(id) {
    console.log('Removing file:', id);
    files.removeFile(id);
    selectedFiles.delete(id);
    selectedFiles = selectedFiles; // Trigger reactivity
  }

  /**
   * Removes all selected files from the store
   */
  function removeSelectedFiles() {
    console.log('Removing selected files:', selectedFiles);
    selectedFiles.forEach(id => {
      files.removeFile(id);
    });
    selectedFiles = new Set();
    selectAll = false;
  }

  /**
   * Returns the appropriate color for a file type
   * @param {string} type - The file type
   * @returns {string} The color code
   */
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

  /**
   * Formats file size for display
   * @param {number} bytes - The file size in bytes
   * @returns {string} Formatted file size
   */
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  /**
   * Handles drag and drop reordering functionality
   * @param {DragEvent} e - The drag event
   * @param {string} id - The ID of the dragged file
   */
  function handleDragStart(e, id) {
    draggedId = id;
    isDragging = true;
  }

  function handleDragOver(e, id) {
    e.preventDefault();
    if (draggedId === id) return;
    
    const draggedIndex = filteredFiles.findIndex(f => f.id === draggedId);
    const targetIndex = filteredFiles.findIndex(f => f.id === id);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newFiles = [...filteredFiles];
      const [draggedFile] = newFiles.splice(draggedIndex, 1);
      newFiles.splice(targetIndex, 0, draggedFile);
      files.set(newFiles);
    }
  }

  function handleDragEnd() {
    draggedId = null;
    isDragging = false;
  }
</script>

<div class="file-list-container card animate-fade-in">
  <!-- Header Section -->
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
        
        {#if selectedFiles.size > 0}
          <button 
            class="btn btn-danger btn-sm"
            on:click={removeSelectedFiles}
            transition:fade
          >
            <span class="icon">🗑️</span>
            Remove ({selectedFiles.size})
          </button>
        {/if}
      </div>
    {/if}
  </div>

  <!-- File List Content -->
  {#if filteredFiles.length > 0}
    <ul class="file-list" role="list">
      {#each filteredFiles as file (file.id)}
        <li 
          class="file-card"
          class:is-completed={file.status === 'completed'}
          class:is-error={file.status === 'error'}
          class:is-dragging={draggedId === file.id}
          draggable={true}
          on:dragstart={(e) => handleDragStart(e, file.id)}
          on:dragover={(e) => handleDragOver(e, file.id)}
          on:dragend={handleDragEnd}
          animate:flip={{ duration: 300 }}
          transition:slide|local
        >
          <div class="file-card-content">
            <!-- Selection Checkbox -->
            <label class="checkbox-wrapper file-select">
              <input
                type="checkbox"
                checked={selectedFiles.has(file.id)}
                on:change={() => toggleFileSelection(file.id)}
                class="checkbox-input"
              />
              <span class="checkbox-custom"></span>
            </label>

            <!-- File Icon -->
            <div 
              class="file-icon-wrapper" 
              style="--file-color: {getFileTypeColor(file.type)}"
            >
              <span class="file-icon" aria-hidden="true">
                {getFileIcon(file.type)}
              </span>
            </div>

            <!-- File Details -->
            <div class="file-details">
              <div class="file-name-row">
                <span class="file-name">{file.name}</span>
                {#if file.size}
                  <span class="file-size">
                    {formatFileSize(file.size)}
                  </span>
                {/if}
              </div>

              <div class="file-status-row">
                <span 
                  class="status-badge"
                  class:is-completed={file.status === 'completed'}
                  class:is-error={file.status === 'error'}
                  class:is-pending={file.status === 'pending'}
                >
                  {#if file.status === 'completed'}
                    <span class="icon">✨</span>
                  {:else if file.status === 'error'}
                    <span class="icon">⚠️</span>
                  {:else}
                    <span class="icon">⏳</span>
                  {/if}
                  {file.status}
                </span>
                
                {#if file.progress !== undefined}
                  <div class="progress-bar">
                    <div 
                      class="progress-fill"
                      style="width: {file.progress}%"
                    ></div>
                  </div>
                {/if}
              </div>
            </div>

            <!-- Action Buttons -->
            <button
              class="remove-button"
              on:click={() => removeFile(file.id)}
              aria-label="Remove file"
            >
              <span class="icon">✖️</span>
            </button>
          </div>

          <!-- Error Message -->
          {#if file.status === 'error' && file.error}
            <div 
              class="error-message"
              transition:slide|local
            >
              {file.error}
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {:else}
    <div class="empty-state" in:fade>
      <div class="empty-content">
        <span class="empty-icon">📄</span>
        <p class="empty-text">No files have been added yet.</p>
        <p class="empty-subtext">
          Drop files or use the uploader above to get started!
        </p>
      </div>
    </div>
  {/if}
</div>

<style>
  /* FileList Container */
.file-list-container {
  width: 100%;
  background: var(--color-surface);
  border-radius: var(--rounded-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

/* Header Section */
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
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.file-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: var(--color-background-secondary);
  padding: 2px var(--spacing-xs);
  border-radius: var(--rounded-full);
  margin-left: var(--spacing-xs);
}

/* Actions Group */
.actions-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

/* File List */
.file-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* File Card */
.file-card {
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--rounded-lg);
  overflow: hidden;
  transition: all var(--transition-duration-normal) var(--transition-timing-ease);
}

.file-card:hover {
  border-color: var(--color-prime);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.file-card-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  position: relative;
}

/* Checkbox Styling */
.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border);
  border-radius: var(--rounded-sm);
  background: var(--color-background-primary);
  transition: all var(--transition-duration-normal) var(--transition-timing-ease);
  position: relative;
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

/* File Icon */
.file-icon-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--rounded-md);
  background: var(--color-background-secondary);
  color: var(--color-prime);
  flex-shrink: 0;
}

/* File Details */
.file-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs);
}

.file-name-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.file-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2xs);
  padding: 4px var(--spacing-xs);
  border-radius: var(--rounded-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
}

.status-badge .icon {
  font-size: 14px;
}

.status-badge.is-pending {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.status-badge.is-completed {
  background: var(--color-success-light);
  color: var(--color-success);
}

.status-badge.is-error {
  background: var(--color-error-light);
  color: var(--color-error);
}

/* Remove Button */
.remove-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  border-radius: var(--rounded-full);
  color: var(--color-text-secondary);
  cursor: pointer;
  opacity: 0;
  transition: all var(--transition-duration-normal) var(--transition-timing-ease);
}

.file-card:hover .remove-button {
  opacity: 1;
}

.remove-button:hover {
  background: var(--color-error-light);
  color: var(--color-error);
}

/* Empty State */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: var(--spacing-xl);
  text-align: center;
  background: var(--color-background-secondary);
  border-radius: var(--rounded-lg);
}

.empty-icon {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-md);
  color: var(--color-text-secondary);
}

.empty-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs);
}

.empty-subtext {
  color: var(--color-text-secondary);
  margin: 0;
}

/* Error Message */
.error-message {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-error-light);
  color: var(--color-error);
  font-size: var(--font-size-sm);
  border-top: 1px solid var(--color-error);
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .actions-group {
    width: 100%;
    justify-content: space-between;
  }

  .file-card-content {
    gap: var(--spacing-sm);
  }
}

@media (max-width: 640px) {
  .file-list-container {
    padding: var(--spacing-md);
  }

  .file-card-content {
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }

  .file-details {
    width: 100%;
    order: 2;
  }

  .remove-button {
    position: absolute;
    top: var(--spacing-sm);
    right: var(--spacing-sm);
    opacity: 1;
  }
}
</style>