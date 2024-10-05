<script>
  import { createEventDispatcher } from 'svelte';
  import { files } from '$lib/stores/files';
  import { apiKey } from '$lib/stores/apiKey';
  import { Document, VideoCamera, MusicalNote, Photo, Link } from 'svelte-hero-icons';

  const dispatch = createEventDispatcher();

  export let dragOver = false;
  export let urlInput = '';

  function addFiles(selectedFiles) {
    const filesArray = Array.isArray(selectedFiles)
      ? selectedFiles
      : Array.from(selectedFiles);
    for (let file of filesArray) {
      files.addFile({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        type: getFileType(file.type),
        status: 'pending',
      });
    }
    dispatch('filesAdded');
  }

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
    }
  }

  function removeFile(id) {
    files.removeFile(id);
  }

  function handleFilesSelected(event) {
    const selectedFiles =
      event.target.files || (event.dataTransfer ? event.dataTransfer.files : null);
    if (selectedFiles) {
      addFiles(Array.from(selectedFiles));
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
    if (mimeType) {
      if (mimeType.startsWith('image/')) return 'image';
      if (mimeType.startsWith('video/')) return 'video';
      if (mimeType.startsWith('audio/')) return 'audio';
    }
    return 'document';
  }

  function getFileIcon(type) {
    const iconMap = {
      document: Document,
      video: VideoCamera,
      audio: MusicalNote,
      image: Photo,
      url: Link,
    };
    return iconMap[type] || Document;
  }
</script>

<div class="file-uploader container">
  <div
    class="dropzone"
    class:drag-over={dragOver}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
    role="button"
    tabindex="0"
    aria-label="Drop files here or click to select"
  >
    <label for="file-input" class="file-label">
      <span class="icon">📁</span>
      <span>Drag & drop files here or click to select</span>
    </label>
    <input
      id="file-input"
      type="file"
      multiple
      on:change={handleFilesSelected}
      style="display: none;"
    />
  </div>

  <div class="url-input">
    <input
      type="text"
      bind:value={urlInput}
      placeholder="Enter a URL to convert"
      class="input"
    />
    <button class="btn" on:click={addUrl}>Add URL</button>
  </div>

  {#if $files.length > 0}
    <ul class="file-list">
      {#each $files as file, index}
        <li class="file-item">
          <div class="file-info">
            <svelte:component this={getFileIcon(file.type)} class="file-icon" />
            <span>{file.name}</span>
          </div>
          <button class="remove-file" on:click={() => removeFile(index)}>×</button>
        </li>
      {/each}
    </ul>
  {/if}

  {#if $files.length > 0 && $apiKey}
    <button class="btn convert-btn" on:click={() => dispatch('startConversion')}>
      Start Conversion
    </button>
  {/if}
</div>

<style lang="scss">
  .file-uploader {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .dropzone {
    border: 3px dashed var(--color-prime);
    border-radius: var(--rounded-corners);
    padding: 40px;
    text-align: center;
    transition: all var(--transition-speed);
    cursor: pointer;

    &:hover,
    &.drag-over {
      background-color: rgba(0, 169, 157, 0.1);
      border-color: var(--color-second);
    }
  }

  .file-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;

    .icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
  }

  .url-input {
    display: flex;
    gap: 10px;

    .input {
      flex-grow: 1;
    }
  }

  .file-list {
    max-height: 200px;
    overflow-y: auto;
  }

  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;

    .file-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .remove-file {
      background: none;
      border: none;
      font-size: 1.5em;
      cursor: pointer;
      color: var(--color-danger);
    }
  }

  :global(.file-icon) {
    width: 24px;
    height: 24px;
  }

  .convert-btn {
    align-self: center;
    font-size: 1.1em;
    padding: 12px 24px;
  }
</style>
