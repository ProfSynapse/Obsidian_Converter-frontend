<script>
  import { createEventDispatcher } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { files } from '$lib/stores/files.js';
  import FileListComponent from '$lib/components/FileList.svelte';

  const dispatch = createEventDispatcher();

  // UI state
  let dragOver = false;
  let urlInput = '';
  let activeTab = 'single'; // 'single' or 'parent'
  let fileInputElement;
  let errorMessage = '';
  let feedbackTimeout;

  // Supported file types grouped by category
  const SUPPORTED_FILES = {
    documents: ['txt', 'rtf', 'pdf', 'docx', 'odt', 'epub'],
    data: ['csv', 'json', 'yaml', 'yml', 'xlsx', 'pptx'],
    web: ['html', 'htm', 'xml'],
    media: ['mp3', 'wav', 'ogg', 'mp4', 'mov', 'avi', 'webm']
  };

  const SUPPORTED_EXTENSIONS = Object.values(SUPPORTED_FILES).flat();

  /**
   * Checks if the file type is supported based on its extension.
   * @param {string} filename - The name of the file.
   * @returns {boolean} - True if the file type is supported, else false.
   */
  function isValidFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    return SUPPORTED_EXTENSIONS.includes(extension);
  }

  /**
   * Retrieves the simple file type (extension) from a File object.
   * @param {File} file - The file object.
   * @returns {string} - The file extension.
   */
  function getSimpleFileType(file) {
    return file.name.split('.').pop().toLowerCase();
  }

  /**
   * Determines the category of the file based on its extension.
   * @param {string} extension - The file extension.
   * @returns {string} - The category name.
   */
  function getFileCategory(extension) {
    return Object.entries(SUPPORTED_FILES).find(([category, extensions]) => 
      extensions.includes(extension)
    )?.[0] || 'other';
  }

  /**
   * Adds selected files to the store after validation.
   * @param {FileList} selectedFiles - The list of selected files.
   */
  function addFiles(selectedFiles) {
    errorMessage = '';
    const filesArray = Array.from(selectedFiles);
    const addedFiles = [];
    
    for (let file of filesArray) {
      try {
        if (!(file instanceof File)) {
          throw new Error('Invalid file object');
        }

        if (!isValidFileType(file.name)) {
          throw new Error(`Unsupported file type: ${file.name.split('.').pop()}`);
        }

        const fileType = getSimpleFileType(file);
        const category = getFileCategory(fileType);
        
        const newFile = {
          id: crypto.randomUUID(),
          file,
          name: file.name,
          type: fileType,
          category,
          size: file.size,
          status: 'pending',
        };

        files.addFile(newFile);
        addedFiles.push(newFile);
      } catch (error) {
        console.error('Error adding file:', error);
        showError(error.message);
      }
    }

    if (fileInputElement) {
      fileInputElement.value = '';
    }

    if (addedFiles.length > 0) {
      showSuccess(`Added ${addedFiles.length} file(s) successfully`);
      dispatch('filesAdded', { files: addedFiles });
    }
  }

  /**
   * Validates the entered URL.
   * @param {string} url - The URL to validate.
   * @returns {boolean} - True if valid, else false.
   */
  function validateUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Adds the entered URL to the store after validation.
   */
  function addUrl() {
    errorMessage = '';
    const url = urlInput.trim();

    if (!url) {
      showError(`Please enter a ${activeTab === 'parent' ? 'Parent URL' : 'URL'}`);
      return;
    }

    if (!validateUrl(url)) {
      showError(`Please enter a valid ${activeTab === 'parent' ? 'Parent URL' : 'URL'}`);
      return;
    }

    try {
      const parsedUrl = new URL(url);
      const newFile = {
        id: crypto.randomUUID(),
        url: parsedUrl.href,
        name: parsedUrl.hostname,
        type: activeTab === 'parent' ? 'parentUrl' : 'url',
        status: 'pending',
      };

      files.addFile(newFile);
      urlInput = '';
      showSuccess('URL added successfully');
      dispatch('filesAdded', { files: [newFile] });
    } catch (error) {
      showError(`Invalid URL format`);
    }
  }

  /**
   * Displays an error message for a limited time.
   * @param {string} message - The error message to display.
   */
  function showError(message) {
    errorMessage = message;
    if (feedbackTimeout) clearTimeout(feedbackTimeout);
    feedbackTimeout = setTimeout(() => errorMessage = '', 5000);
  }

  /**
   * Placeholder for success message implementation.
   * @param {string} message - The success message to display.
   */
  function showSuccess(message) {
    // Implementation for success message if needed
    // Example: You can dispatch another event or use a store to show success notifications
    console.log(message);
  }

  // Drag and Drop Event Handlers

  /**
   * Handles the drag enter event.
   * @param {DragEvent} event - The drag event.
   */
  function handleDragEnter(event) {
    event.preventDefault();
    dragOver = true;
  }

  /**
   * Handles the drag leave event.
   * @param {DragEvent} event - The drag event.
   */
  function handleDragLeave(event) {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      dragOver = false;
    }
  }

  /**
   * Handles the drop event.
   * @param {DragEvent} event - The drop event.
   */
  function handleDrop(event) {
    event.preventDefault();
    dragOver = false;
    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles) {
      addFiles(droppedFiles);
    }
  }

  /**
   * Handles file selection via the hidden file input.
   * @param {Event} event - The change event.
   */
  function handleFileSelect(event) {
    const selectedFiles = event.target?.files;
    if (selectedFiles) {
      addFiles(selectedFiles);
    }
  }

  /**
   * Handles keypress events for accessibility.
   * @param {KeyboardEvent} event - The keyboard event.
   */
  function handleKeyPress(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      fileInputElement.click();
    }
  }
</script>

<div class="uploader-container card animate-fade-in">
  <!-- Tabs Section -->
  <div class="tabs-section">
    <div class="tabs">
      <button
        class="tab-button"
        class:active={activeTab === 'single'}
        on:click={() => activeTab = 'single'}
      >
        <span class="icon">🔗</span>
        Single URL
      </button>
      <button
        class="tab-button"
        class:active={activeTab === 'parent'}
        on:click={() => activeTab = 'parent'}
      >
        <span class="icon">🗺️</span>
        Parent URL
      </button>
    </div>

    <!-- URL Input -->
    <div class="url-input-container" in:fade={{ duration: 200 }}>
      <div class="input-group">
        <input
          type="url"
          bind:value={urlInput}
          placeholder={`Enter a ${activeTab === 'parent' ? 'Parent URL' : 'URL'} to convert`}
          class="input url-input"
          on:keypress={(e) => e.key === 'Enter' && addUrl()}
        />
        <button 
          class="btn btn-primary btn-icon"
          on:click={addUrl}
          disabled={!urlInput.trim()}
          aria-label={`Add ${activeTab === 'parent' ? 'Parent URL' : 'URL'}`}
        >
          <span class="icon">➕</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Enhanced Drop Zone -->
  <div
    class="drop-zone"
    class:dragging={dragOver}
    on:dragenter={handleDragEnter}
    on:dragover|preventDefault
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
    on:click={() => fileInputElement.click()}
    on:keypress={handleKeyPress}
    role="button"
    tabindex="0"
    aria-label="Drop files here or click to select"
  >
    <input
      type="file"
      bind:this={fileInputElement}
      on:change={handleFileSelect}
      accept={SUPPORTED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
      multiple
      class="hidden-input"
    />
    
    <div class="drop-zone-content" class:dragging={dragOver}>
      <div class="icon-container" class:animate-bounce={dragOver}>
        <span class="icon">📁</span>
      </div>
      <div class="drop-text">
        <p class="primary-text">
          {dragOver ? 'Drop files here' : 'Drag & drop files here or click to select'}
        </p>
        <div class="supported-formats">
          <p class="format-title">Supported formats:</p>
          <div class="format-groups">
            {#each Object.entries(SUPPORTED_FILES) as [category, extensions]}
              <div class="format-group">
                <span class="format-category">{category}:</span>
                <span class="format-list">{extensions.join(', ')}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Error Messages -->
  {#if errorMessage}
    <div class="error-message" role="alert" in:fly={{ y: 10, duration: 200 }}>
      <span class="icon">⚠️</span>
      {errorMessage}
    </div>
  {/if}

  <!-- File List -->
  <FileListComponent
    title="Items to Convert"
    files={$files}
    onRemove={(id) => files.removeFile(id)}
  />
</div>

<style>
  .uploader-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
  }

  /* Tabs Styling */
  .tabs-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .tabs {
    display: flex;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs);
    background: var(--color-background-secondary);
    border-radius: var(--rounded-lg);
  }

  .tab-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    background: transparent;
    border: none;
    border-radius: var(--rounded-md);
    cursor: pointer;
    transition: all var(--transition-duration-normal) var(--transition-timing-ease);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
  }

  .tab-button.active {
    background: var(--color-background-primary);
    color: var(--color-prime);
    box-shadow: var(--shadow-sm);
  }

  .tab-button:hover:not(.active) {
    background: var(--color-hover);
    color: var(--color-text-primary);
  }

  /* URL Input Styling */
  .url-input-container {
    position: relative;
  }

  .url-input {
    padding-right: var(--spacing-xl);
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--color-border);
    border-radius: var(--rounded-md);
    font-size: var(--font-size-base);
  }

  .btn-icon {
    padding: var(--spacing-sm);
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-prime);
    color: #fff;
    border: none;
    border-radius: var(--rounded-md);
    cursor: pointer;
    transition: background var(--transition-duration-normal) var(--transition-timing-ease);
  }

  .btn-icon:disabled {
    background: var(--color-disabled);
    cursor: not-allowed;
  }

  .btn-icon:hover:not(:disabled) {
    background: var(--color-prime-dark);
  }

  /* Drop Zone Styling */
  .drop-zone {
    position: relative;
    border: var(--border-width-normal) dashed var(--color-prime);
    border-radius: var(--rounded-lg);
    padding: var(--spacing-2xl);
    background: var(--gradient-surface);
    transition: all var(--transition-duration-normal) var(--transition-timing-bounce);
    cursor: pointer;
    overflow: hidden;
  }

  .drop-zone::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--gradient-primary);
    opacity: 0;
    transition: opacity var(--transition-duration-normal) var(--transition-timing-ease);
    z-index: 0;
  }

  .drop-zone.dragging {
    border-style: solid;
    transform: scale(1.02);
    border-color: var(--color-accent);
  }

  .drop-zone.dragging::before {
    opacity: 0.05;
  }

  .drop-zone-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);
  }

  .drop-zone-content.dragging {
    /* Add any specific styles for the content when dragging */
  }

  .icon-container {
    font-size: var(--font-size-4xl);
    color: var(--color-prime);
    transition: transform var(--transition-duration-normal) var(--transition-timing-bounce);
  }

  .icon-container.animate-bounce {
    animation: bounce 1s infinite var(--transition-timing-bounce);
  }

  .drop-text {
    text-align: center;
  }

  .primary-text {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    margin: 0 0 var(--spacing-md);
  }

  .supported-formats {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  .format-title {
    margin: 0 0 var(--spacing-xs);
    font-weight: var(--font-weight-medium);
  }

  .format-groups {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    justify-content: center;
  }

  .format-group {
    display: inline-flex;
    gap: var(--spacing-2xs);
  }

  .format-category {
    font-weight: var(--font-weight-medium);
    color: var(--color-prime);
  }

  .format-list {
    color: var(--color-text-tertiary);
  }

  /* Error Message Styling */
  .error-message {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-error-light);
    color: var(--color-error);
    border-radius: var(--rounded-md);
    font-size: var(--font-size-sm);
    border-left: 4px solid var(--color-error);
    animation: shake 0.5s var(--transition-timing-ease);
  }

  /* Hidden Input */
  .hidden-input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Input Group Styling */
  .input-group {
    display: flex;
    gap: var(--spacing-xs);
    width: 100%;
  }

  /* Animations */
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(5px);
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }

  /* Custom Scrollbar */
  .format-groups::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .format-groups::-webkit-scrollbar-track {
    background: var(--color-background-secondary);
    border-radius: var(--rounded-full);
  }

  .format-groups::-webkit-scrollbar-thumb {
    background: var(--color-prime);
    border-radius: var(--rounded-full);
  }

  .format-groups::-webkit-scrollbar-thumb:hover {
    background: var(--color-second);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .drop-zone {
      padding: var(--spacing-xl);
    }

    .format-groups {
      flex-direction: column;
      align-items: center;
    }

    .format-group {
      text-align: center;
    }

    .icon-container {
      font-size: var(--font-size-3xl);
    }

    .primary-text {
      font-size: var(--font-size-base);
    }
  }

  @media (max-width: 640px) {
    .tabs {
      flex-direction: column;
    }

    .drop-zone {
      padding: var(--spacing-lg);
    }

    .drop-zone-content {
      gap: var(--spacing-md);
    }

    .format-title {
      display: none;
    }

    .format-groups {
      font-size: var(--font-size-xs);
    }

    .input-group {
      flex-direction: column;
    }

    .btn-icon {
      width: 100%;
      aspect-ratio: auto;
    }
  }

  /* Focus States */
  .tab-button:focus-visible,
  .drop-zone:focus-visible {
    outline: 2px solid var(--color-prime);
    outline-offset: 2px;
  }

  /* Hover States */
  .drop-zone:hover:not(.dragging) {
    border-color: var(--color-second);
    transform: scale(1.01);
  }

  .icon-container:hover {
    transform: scale(1.1);
  }

  /* Active States */
  .drop-zone:active {
    transform: scale(0.99);
  }

  /* Loading States */
  .drop-zone.loading {
    opacity: 0.7;
    cursor: wait;
  }

  /* Success States */
  .drop-zone.success {
    border-color: var(--color-success);
    animation: pulse 0.5s var(--transition-timing-bounce);
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .drop-zone,
    .icon-container,
    .tab-button {
      transition: none;
      animation: none;
    }
  }

  /* Print Styles */
  @media print {
    .drop-zone {
      border: 1px solid #000;
      background: none;
    }

    .tab-button {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
  }
</style>
