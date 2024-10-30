<!-- src/lib/components/FileUploader/FileUploader.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { files } from '$lib/stores/files.js';
  import { conversionStatus } from '$lib/stores/conversionStatus.js';
  import FileListComponent from '$lib/components/FileList.svelte';
  import { validateUrl, couldBeValidUrl } from '$lib/utils/validators.js';

  const dispatch = createEventDispatcher();

  // UI state
  let dragOver = false;
  let urlInput = '';
  let activeTab = 'single';
  let fileInputElement;
  let errorMessage = '';
  let feedbackTimeout;

  // File type configuration
  const SUPPORTED_FILES = {
    documents: ['txt', 'rtf', 'pdf', 'docx', 'odt', 'epub'],
    data: ['csv', 'json', 'yaml', 'yml', 'xlsx', 'pptx'],
    web: ['html', 'htm', 'xml'],
    media: ['mp3', 'wav', 'ogg', 'mp4', 'mov', 'avi', 'webm']
  };

  const SUPPORTED_EXTENSIONS = Object.values(SUPPORTED_FILES).flat();

  /**
   * Validates file type against supported extensions
   */
  function isValidFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    return SUPPORTED_EXTENSIONS.includes(extension);
  }

  /**
   * Gets file type and category info
   */
  function getFileInfo(file) {
    const type = file.name.split('.').pop().toLowerCase();
    const category = Object.entries(SUPPORTED_FILES)
      .find(([cat, exts]) => exts.includes(type))?.[0] || 'other';
    
    return { type, category };
  }

  /**
   * Shows feedback message to user
   */
  function showFeedback(message, type = 'error') {
    errorMessage = message;
    if (feedbackTimeout) clearTimeout(feedbackTimeout);
    feedbackTimeout = setTimeout(() => errorMessage = '', 5000);
    
    if (type === 'success') {
      console.log('Success:', message);
    }
  }

  /**
   * Processes and adds single file
   */
  function processFile(file) {
    if (!(file instanceof File)) {
      throw new Error('Invalid file object');
    }

    if (!isValidFileType(file.name)) {
      throw new Error(`Unsupported file type: ${file.name.split('.').pop()}`);
    }

    const { type, category } = getFileInfo(file);
    
    return {
      id: crypto.randomUUID(),
      file,
      name: file.name,
      type,
      category,
      size: file.size,
      status: 'pending'
    };
  }

  /**
   * Handles adding files to store
   */
  function handleFiles(selectedFiles) {
    errorMessage = '';
    const filesArray = Array.from(selectedFiles);
    const addedFiles = [];
    
    for (const file of filesArray) {
      try {
        const newFile = processFile(file);
        files.addFile(newFile);
        addedFiles.push(newFile);
      } catch (error) {
        console.error('Error processing file:', error);
        showFeedback(error.message);
      }
    }

    if (fileInputElement) {
      fileInputElement.value = '';
    }

    if (addedFiles.length > 0) {
      showFeedback(`Added ${addedFiles.length} file(s) successfully`, 'success');
      dispatch('filesAdded', { files: addedFiles });
    }

    return addedFiles;
  }

  /**
   * Handles URL processing and addition
   */

  async function handleUrl() {
    try {
      const url = urlInput.trim();
      
      if (!url) {
        throw new Error(`Please enter a ${activeTab === 'parent' ? 'Parent URL' : 'URL'}`);
      }

      if (!couldBeValidUrl(url)) {
        throw new Error('Please enter a valid website address');
      }

      const normalizedUrl = validateUrl(url);
      
      const newFile = {
        id: crypto.randomUUID(),
        url: normalizedUrl,
        parentUrl: activeTab === 'parent' ? normalizedUrl : undefined,
        name: new URL(normalizedUrl).hostname,
        type: activeTab === 'parent' ? 'parentUrl' : 'url',
        status: 'pending'
      };

      // Use the enhanced addFile result
      const result = files.addFile(newFile);
      
      if (result.success) {
        urlInput = '';
        showFeedback(result.message, 'success');
        dispatch('filesAdded', { files: [newFile] });
      } else {
        showFeedback(result.message, 'error');
      }

    } catch (error) {
      console.error('Error adding URL:', error);
      showFeedback(error.message, 'error');
    }
  }

  /**
   * Event handler for drag and drop
   */
  function handleDragDrop(event) {
    event.preventDefault();
    dragOver = false;
    
    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles?.length) {
      handleFiles(droppedFiles);
    }
  }

  /**
   * Drag enter/leave handlers
   */
  function handleDragEnter(event) {
    event.preventDefault();
    dragOver = true;
  }

  function handleDragLeave(event) {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const { clientX: x, clientY: y } = event;

    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      dragOver = false;
    }
  }

  /**
   * File input change handler
   */
  function handleFileSelect(event) {
    const selectedFiles = event.target?.files;
    if (selectedFiles?.length) {
      handleFiles(selectedFiles);
    }
  }

  /**
   * Accessibility handler for keyboard events
   */
  function handleKeyPress(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      fileInputElement?.click();
    }
  }

  // Reset conversion status when component initializes
  $: {
    if ($files.length === 0) {
      conversionStatus.reset();
    }
  }
</script>

<!-- Rest of your template code remains the same -->
<!-- Just update the event handlers to use the new function names -->

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
          on:keypress={(e) => e.key === 'Enter' && handleUrl()}
        />
        <button 
          class="btn btn-primary btn-icon"
          on:click={handleUrl}
          disabled={!urlInput.trim()}
          aria-label={`Add ${activeTab === 'parent' ? 'Parent URL' : 'URL'}`}
        >
          <span class="icon">➕</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Drop Zone -->
  <div
    class="drop-zone"
    class:dragging={dragOver}
    on:dragenter={handleDragEnter}
    on:dragover|preventDefault
    on:dragleave={handleDragLeave}
    on:drop={handleDragDrop}
    on:click={() => fileInputElement?.click()}
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
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  /* Tabs */
  .tabs-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .tabs {
    display: flex;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs);
    background: rgba(0, 0, 0, 0.05);
    border-radius: var(--rounded-md);
  }

  .tab-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    background: transparent;
    border: none;
    border-radius: var(--rounded-sm);
    cursor: pointer;
    color: var(--color-text-light);
    font-size: var(--font-size-base);
  }

  .tab-button.active {
    background: var(--color-surface);
    color: var(--color-prime);
    box-shadow: var(--shadow-sm);
  }

  /* URL Input */
  .input-group {
    display: flex;
    gap: var(--spacing-xs);
  }

  .url-input {
    flex: 1;
    min-width: 0;
  }

  .btn-icon {
    width: 36px;
    height: 36px;
    padding: 0;
    flex-shrink: 0;
  }

  /* Drop Zone */
  .drop-zone {
    border: 2px dashed var(--color-prime);
    border-radius: var(--rounded-md);
    padding: var(--spacing-lg);
    transition: all var(--transition-speed);
    cursor: pointer;
    text-align: center;
  }

  .drop-zone.dragging {
    border-style: solid;
    border-color: var(--color-second);
    background: rgba(0, 169, 157, 0.05);
  }

  .drop-zone-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
  }

  .icon-container {
    font-size: var(--font-size-xl);
    color: var(--color-prime);
  }

  .icon-container.animate-bounce {
    animation: bounce 1s infinite;
  }

  .drop-text {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .primary-text {
    font-size: var(--font-size-base);
    font-weight: 500;
    margin: 0;
  }

  .supported-formats {
    font-size: var(--font-size-sm);
    color: var(--color-text-light);
  }

  .format-groups {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    justify-content: center;
  }

  .format-group {
    display: flex;
    gap: var(--spacing-2xs);
  }

  .format-category {
    color: var(--color-prime);
    font-weight: 500;
  }

  /* Error Message */
  .error-message {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    background: var(--color-error-light);
    color: var(--color-error);
    border-radius: var(--rounded-sm);
    font-size: var(--font-size-sm);
  }

  .hidden-input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .drop-zone {
      padding: var(--spacing-md);
    }

    .format-groups {
      flex-direction: column;
      align-items: center;
    }
  }

  @media (max-width: 640px) {
    .tabs {
      flex-direction: column;
    }

    .input-group {
      flex-direction: column;
    }

    .btn-icon {
      width: 100%;
      height: 32px;
    }

    .format-title {
      display: none;
    }
  }
</style>