<!-- src/lib/components/FileUploader/FileUploader.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { files } from '$lib/stores/files.js';
  import FileListComponent from '$lib/components/FileList.svelte';

  const dispatch = createEventDispatcher();

  let dragOver = false;
  let urlInput = '';
  let fileInputElement; // Reference to the file input element

  function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  function addFiles(selectedFiles) {
    const filesArray = Array.from(selectedFiles);
    for (let file of filesArray) {
      if (file instanceof File) {
        const newFile = {
          id: generateUniqueId(),
          file,
          name: file.name,
          type: getFileType(file.type),
          status: 'pending',
        };
        files.addFile(newFile);
        console.log('Added file:', newFile);
      }
    }
    dispatch('filesAdded');
  }

  function addUrl() {
    if (urlInput.trim()) {
      const newFile = {
        id: generateUniqueId(),
        url: urlInput.trim(),
        name: urlInput.trim(),
        type: 'url',
        status: 'pending',
      };
      files.addFile(newFile);
      console.log('Added URL:', newFile);
      urlInput = '';
      dispatch('filesAdded');
    }
  }

  function handleFilesSelected(event) {
    const selectedFiles = event.target.files || event.dataTransfer?.files;
    if (selectedFiles) {
      addFiles(selectedFiles);

      // Reset the file input's value to allow re-uploading the same file
      if (fileInputElement) {
        fileInputElement.value = '';
      }
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
    dragOver = true;
  }

  function handleDragLeave() {
    dragOver = false;
  }

  function handleDrop(event) {
    event.preventDefault();
    dragOver = false;
    handleFilesSelected(event);
  }

  function getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('text/') || mimeType === 'application/pdf') return 'document';
    return 'unknown';
  }

  // Function to handle file removal
  function handleRemoveFile(file) {
    files.removeFile(file.id);
    console.log('Removed file:', file);
    dispatch('fileRemoved');
  }

  // Function to determine if a file should be displayed (e.g., all pending files)
  function isPendingFile(file) {
    return file.status === 'pending';
  }
</script>

<div class="file-uploader">
  <!-- URL Input -->
  <div class="url-input">
    <input
      type="text"
      bind:value={urlInput}
      placeholder="Enter a URL to convert"
      class="input"
      on:keypress={(e) => { if (e.key === 'Enter') addUrl(); }}
      aria-label="URL Input"
    />
    <button class="btn btn-pill" on:click={addUrl} aria-label="Add URL">
      ➕
    </button>
  </div>

  <!-- File Dropzone -->
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
      id="file-input"
      type="file"
      multiple
      on:change={handleFilesSelected}
      bind:this={fileInputElement}
      style="display: none;"
    />
    <div class="dropzone-content">
      <span class="icon">📁</span>
      <span>Drag & drop files here or click to select</span>
      <button class="btn" on:click|stopPropagation={() => fileInputElement.click()} aria-label="Browse Files">
        Browse Files
      </button>
    </div>
  </div>

  <!-- File List using FileListComponent -->
  <FileListComponent
    title="Conversion List"
    onAction={handleRemoveFile}
    filterFunction={isPendingFile}
    getStatusColor={() => 'var(--color-text)'}
    isDisabled={() => false}
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

  /* "Add URL" Button - Pill-Shaped */
  .btn-pill {
    position: relative; /* For pseudo-element */
    overflow: hidden; /* To contain the pseudo-element */
    background-color: var(--color-prime); /* Teal by default */
    color: white;
    border: none;
    padding: 0;
    border-radius: 9999px; /* Pill shape */
    cursor: pointer;
    transition: color var(--transition-speed), box-shadow var(--transition-speed), transform var(--transition-speed);
    font-weight: 600;
    height: 40px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .btn-pill::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--gradient-button);
    opacity: 0;
    transition: opacity var(--transition-speed);
    border-radius: 9999px;
    z-index: -1; /* Place behind the button text */
  }

  .btn-pill:hover::before {
    opacity: 1; /* Fade in the gradient */
  }

  .btn-pill:hover {
    color: white; /* Ensure text remains visible over gradient */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .btn-pill:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .icon {
    color: white;
  }

  /* File Dropzone */
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

  /* "Browse Files" Button */
  .dropzone-content .btn {
    background-color: var(--color-prime); /* Teal by default */
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: var(--rounded-corners);
    cursor: pointer;
    transition: color var(--transition-speed), box-shadow var(--transition-speed), transform var(--transition-speed);
    font-size: 1rem;
    font-weight: 600;
    position: relative; /* For pseudo-element */
    overflow: hidden;
  }

  .dropzone-content .btn::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--gradient-button);
    opacity: 0;
    transition: opacity var(--transition-speed);
    border-radius: var(--rounded-corners);
    z-index: -1;
  }

  .dropzone-content .btn:hover::before {
    opacity: 1;
  }

  .dropzone-content .btn:hover {
    color: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .dropzone-content .btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* Consistent Input Styling */
  .input {
    width: 100%;
    padding: 10px;
    border: 2px solid var(--color-prime);
    border-radius: var(--rounded-corners);
    font-size: 1rem;
    outline: none;
    transition: border-color var(--transition-speed);
    box-sizing: border-box;
  }

  .input:focus {
    border-color: var(--color-second);
  }
</style>
