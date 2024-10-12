<!-- src/lib/components/FileUploader/FileUploader.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { files } from '$lib/stores/files.js';
  import FileListComponent from '$lib/components/FileList.svelte';

  const dispatch = createEventDispatcher();

  let dragOver = false;
  let urlInput = '';
  let fileInputElement;

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
    if (mimeType.startsWith('text/')) return 'document';
    return 'unknown';
  }

  function handleRemoveFile(file) {
    files.removeFile(file.id);
    console.log('Removed file:', file);
    dispatch('fileRemoved');
  }

  function isPendingFile(file) {
    return file.status === 'pending';
  }
</script>

<section class="file-uploader">
  <h2>File Upload</h2>
  <div class="url-input">
    <input
      type="text"
      bind:value={urlInput}
      placeholder="Enter a URL to convert"
      class="input"
      on:keypress={(e) => { if (e.key === 'Enter') addUrl(); }}
      aria-label="URL Input"
    />
    <button class="btn btn-icon" on:click={addUrl} aria-label="Add URL">
      <span class="icon">➕</span>
    </button>
  </div>
  <p class="url-info">
    Enter a URL to convert or use the file uploader below.
  </p>

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

  <FileListComponent
    title="Files to Convert"
    onAction={handleRemoveFile}
    filterFunction={isPendingFile}
    getStatusColor={() => 'var(--color-text)'}
    isDisabled={() => false}
  />
</section>

<style>
  .file-uploader {
    border: 2px solid var(--color-prime);
    padding: 20px;
    border-radius: var(--rounded-corners);
    margin-bottom: 20px;
    background-color: rgba(255, 255, 255, 0.9);
  }

  h2 {
    color: var(--color-prime);
    margin-bottom: 15px;
    font-family: 'Montserrat', sans-serif;
    font-weight: 600;
  }

  .url-input {
    display: flex;
    gap: 10px;
    margin-bottom: 5px;
  }

  .input {
    flex-grow: 1;
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

  .url-info {
    margin-top: 5px;
    margin-bottom: 15px;
    font-size: 0.9rem;
  }

  .btn {
    background-color: var(--color-prime);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: var(--rounded-corners);
    cursor: pointer;
    transition: background-image var(--transition-speed), box-shadow var(--transition-speed);
    font-size: 1rem;
    font-weight: 600;
    position: relative;
    overflow: hidden;
  }

  .btn:hover {
    background-image: var(--gradient-button);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .btn:active {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .btn-icon {
    padding: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  .btn-icon .icon {
    font-size: 1.5rem;
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
</style>