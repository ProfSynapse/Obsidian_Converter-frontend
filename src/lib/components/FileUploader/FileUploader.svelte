<!-- src/lib/components/FileUploader/FileUploader.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { files } from '$lib/stores/files.js';
  import FileListComponent from '$lib/components/FileList.svelte';

  const dispatch = createEventDispatcher();

  // UI state
  let dragOver = false;
  let urlInput = '';
  let fileInputElement;
  let errorMessage = '';

  // Supported file types
  const SUPPORTED_EXTENSIONS = [
    'txt', 'rtf', 'pdf', 'docx', 'odt', 'epub',
    'csv', 'json', 'yaml', 'yml', 'xlsx', 'pptx',
    'html', 'htm', 'xml', 'mp3', 'wav', 'ogg',
    'mp4', 'mov', 'avi', 'webm'
  ];

  // File type validation helper
  function isValidFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    return SUPPORTED_EXTENSIONS.includes(extension);
  }

  // Generate unique ID for files
  function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get simple file type from file extension
  function getSimpleFileType(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    console.log('File type detection:', {
      name: file.name,
      mimeType: file.type,
      detectedExtension: extension
    });
    return extension;
  }

  // Add multiple files
  function addFiles(selectedFiles) {
    errorMessage = ''; // Clear any previous errors
    const filesArray = Array.from(selectedFiles);
    
    console.log('Processing files:', filesArray.map(f => f.name));

    for (let file of filesArray) {
      try {
        if (!(file instanceof File)) {
          console.error('Invalid file object:', file);
          continue;
        }

        // Validate file type
        if (!isValidFileType(file.name)) {
          throw new Error(`Unsupported file type: ${file.name.split('.').pop()}`);
        }

        const fileType = getSimpleFileType(file);
        
        const newFile = {
          id: generateUniqueId(),
          file,
          name: file.name,
          type: fileType,
          size: file.size,
          status: 'pending',
        };

        console.log('Adding file:', {
          name: newFile.name,
          type: newFile.type,
          size: newFile.size
        });

        files.addFile(newFile);
      } catch (error) {
        console.error('Error adding file:', error);
        errorMessage = error.message;
      }
    }

    // Reset file input to allow selecting the same file again
    if (fileInputElement) {
      fileInputElement.value = '';
    }

    dispatch('filesAdded');
  }

  // Validate and add URL
  function addUrl() {
    errorMessage = ''; // Clear any previous errors
    const url = urlInput.trim();

    if (!url) {
      errorMessage = 'Please enter a URL';
      return;
    }

    try {
      // Validate URL format
      new URL(url);

      const newFile = {
        id: generateUniqueId(),
        url: url,
        name: url,
        type: 'url',
        status: 'pending',
      };

      console.log('Adding URL:', newFile);
      
      files.addFile(newFile);
      urlInput = ''; // Clear input after successful add
      dispatch('filesAdded');
    } catch (error) {
      console.error('Invalid URL:', error);
      errorMessage = 'Please enter a valid URL';
    }
  }

  // Handle file drop
  function handleDrop(event) {
    event.preventDefault();
    dragOver = false;
    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles) {
      addFiles(droppedFiles);
    }
  }

  // Handle dragover
  function handleDragOver(event) {
    event.preventDefault();
    dragOver = true;
  }

  // Handle dragleave
  function handleDragLeave() {
    dragOver = false;
  }

  // Handle file selection
  function handleFileSelect(event) {
    const selectedFiles = event.target?.files;
    if (selectedFiles) {
      addFiles(selectedFiles);
    }
  }
</script>

<div class="file-uploader">
  <!-- URL Input Section -->
  <div class="url-input">
    <input
      type="text"
      bind:value={urlInput}
      placeholder="Enter a URL to convert"
      class="input"
      on:keypress={(e) => { if (e.key === 'Enter') addUrl(); }}
      aria-label="URL Input"
    />
    <button 
      class="btn btn-pill" 
      on:click={addUrl}
      aria-label="Add URL"
      disabled={!urlInput.trim()}
    >
      ➕
    </button>
  </div>

  <!-- File Drop Zone -->
  <div
    class="dropzone"
    class:drag-over={dragOver}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
    on:click={() => fileInputElement.click()}
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
      style="display: none;"
    />
    <div class="dropzone-content">
      <span class="icon">📁</span>
      <span class="drop-text">
        Drag & drop files here or click to select
        <br>
        <small>Supported formats: {SUPPORTED_EXTENSIONS.join(', ')}</small>
      </span>
    </div>
  </div>

  <!-- Error Message Display -->
  {#if errorMessage}
    <div class="error-message" role="alert">
      {errorMessage}
    </div>
  {/if}

  <!-- File List -->
  <FileListComponent
    title="Files to Convert"
    files={$files}
    onRemove={(id) => files.removeFile(id)}
  />
</div>

<style>
  .file-uploader {
    border: 2px solid var(--color-prime);
    padding: 20px;
    border-radius: var(--rounded-corners);
    margin-bottom: 20px;
    background-color: rgba(255, 255, 255, 0.9);
  }

  .url-input {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 15px;
  }

  .url-input .input {
    flex: 1;
  }

  .dropzone {
    border: 2px dashed var(--color-prime);
    border-radius: var(--rounded-corners);
    padding: 40px;
    text-align: center;
    position: relative;
    cursor: pointer;
    transition: background-color var(--transition-speed);
    margin-bottom: 20px;
    background: var(--color-background);
  }

  .dropzone.drag-over {
    background-color: rgba(0, 169, 157, 0.1);
    border-color: var(--color-second);
  }

  .dropzone-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .dropzone .icon {
    font-size: 3rem;
    color: var(--color-prime);
  }

  .drop-text {
    color: var(--color-text);
  }

  .drop-text small {
    color: var(--color-text);
    opacity: 0.7;
  }

  .error-message {
    background-color: #ffe6e6;
    color: #d63031;
    padding: 10px;
    margin: 10px 0;
    border-radius: var(--rounded-corners);
    text-align: center;
  }

  /* Button Styles */
  .btn-pill {
    position: relative;
    overflow: hidden;
    background-color: var(--color-prime);
    color: white;
    border: none;
    padding: 0;
    border-radius: 9999px;
    cursor: pointer;
    height: 40px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    transition: all var(--transition-speed);
  }

  .btn-pill:hover {
    background-color: var(--color-second);
    transform: scale(1.05);
  }

  .btn-pill:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
  }

  /* Input Styles */
  .input {
    width: 100%;
    padding: 10px;
    border: 2px solid var(--color-prime);
    border-radius: var(--rounded-corners);
    font-size: 1rem;
    outline: none;
    transition: border-color var(--transition-speed);
  }

  .input:focus {
    border-color: var(--color-second);
  }
</style>
