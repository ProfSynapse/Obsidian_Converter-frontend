<!-- src/lib/components/FileUploader/FileUploader.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { files } from '$lib/stores/files';
  import { getFileIconComponent } from '$lib/utils/iconUtils';
  import FileListComponent from '$lib/components/FileList.svelte';

  const dispatch = createEventDispatcher();

  let dragOver = false;
  let urlInput = '';

  /**
   * Adds files to the store
   * @param {FileList | File[]} selectedFiles - A list of files selected by the user
   */
  function addFiles(selectedFiles) {
    const filesArray = Array.from(selectedFiles);
    for (let file of filesArray) {
      if (file instanceof File) {
        files.addFile({
          id: crypto.randomUUID(),
          file,
          name: file.name,
          type: getFileType(file.type),
          status: 'pending',
        });
      }
    }
    dispatch('filesAdded');
  }

  /**
   * Adds a URL as a file to the store
   */
  function addUrl() {
    if (urlInput.trim()) {
      files.addFile({
        id: crypto.randomUUID(),
        url: urlInput.trim(),
        name: urlInput.trim(),
        type: 'url',
        status: 'pending',
      });
      urlInput = '';
      dispatch('filesAdded');
    } else {
      console.warn('URL input is empty');
    }
  }

  /**
   * Handles file selection event
   * @param {Event} event - The file input change or drop event
   */
  function handleFilesSelected(event) {
    const target = event.target;
    const selectedFiles = target.files || event.dataTransfer?.files;
    if (selectedFiles) {
      addFiles(selectedFiles);
    } else {
      console.warn('No files selected');
    }
  }

  /**
   * Handles drag-over event to indicate drag state
   * @param {DragEvent} event - The drag-over event
   */
  function handleDragOver(event) {
    event.preventDefault();
    dragOver = true;
  }

  /**
   * Handles drag-leave event to reset drag state
   */
  function handleDragLeave() {
    dragOver = false;
  }

  /**
   * Handles drop event to add files
   * @param {DragEvent} event - The drop event
   */
  function handleDrop(event) {
    event.preventDefault();
    dragOver = false;
    handleFilesSelected(event);
  }

  /**
   * Gets the file type based on MIME type
   * @param {string} mimeType - The MIME type of the file
   * @returns {string} The type of the file (e.g., image, video, audio, document, or unknown)
   */
  function getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('text/')) return 'document';
    return 'unknown';
  }

  // Function to handle file removal
  function handleRemoveFile(file) {
    files.removeFile(file.id);
    dispatch('fileRemoved');
  }

  // Function to determine if a file should be displayed (e.g., all pending files)
  function isPendingFile(file) {
    return file.status === 'pending';
  }
</script>

<div class="file-uploader container">
  <!-- URL Input -->
  <div class="url-input">
    <input
      type="text"
      bind:value={urlInput}
      placeholder="Enter a URL to convert"
      class="input"
    />
    <button class="btn" on:click={addUrl}>Add URL</button>
  </div>

  <!-- File Dropzone -->
  <div
    class="dropzone"
    class:drag-over={dragOver}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
    on:click={() => document.getElementById('file-input').click()}
    role="button"
    tabindex="0"
    aria-label="Drop files here or click to select"
  >
    <input
      id="file-input"
      type="file"
      multiple
      on:change={handleFilesSelected}
      style="display: none;"
    />
    <div class="dropzone-content">
      <span class="icon">📁</span>
      <span>Drag & drop files here or click to select</span>
      <button class="btn upload-btn" on:click|stopPropagation={() => document.getElementById('file-input').click()}>
        Browse Files
      </button>
    </div>
  </div>

  <!-- File List using FileListComponent -->
  <FileListComponent
    title="Files to Convert"
    actionLabel="×"
    onAction={handleRemoveFile}
    filterFunction={isPendingFile}
    getStatusColor={() => 'var(--color-text)'}
    isDisabled={() => false}
  />
</div>

<style>
  .file-uploader {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .url-input {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .dropzone {
    border: 2px dashed var(--color-prime);
    border-radius: var(--rounded-corners);
    padding: 40px;
    text-align: center;
    position: relative;
    cursor: pointer;
    transition: background-color var(--transition-speed);
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

  .upload-btn {
    background-color: var(--color-second);
    color: white;
  }

  .upload-btn:hover {
    background-color: var(--color-prime);
  }
</style>
