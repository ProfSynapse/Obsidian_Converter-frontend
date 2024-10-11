<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { files } from '$lib/stores/files.js';
  import { Document, VideoCamera, MusicalNote, Photo, Link } from 'svelte-hero-icons';
  import type { ComponentType } from 'svelte';
  import type { IconSource } from 'svelte-hero-icons';

  const dispatch = createEventDispatcher();

  let dragOver = false;
  let urlInput = '';

  function addFiles(selectedFiles: FileList | File[]) {
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

  function handleFilesSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const selectedFiles = target.files || (event as DragEvent).dataTransfer?.files;
    if (selectedFiles) {
      addFiles(selectedFiles);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragOver = true;
  }

  function handleDragLeave() {
    dragOver = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
    handleFilesSelected(event);
  }

  function getFileType(mimeType: string): import('$lib/stores/files').FileType {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('text/')) return 'document';
    return 'unknown';
  }

  function getFileIcon(type: string): ComponentType {
    const iconMap: Record<string, IconSource> = {
      document: Document,
      video: VideoCamera,
      audio: MusicalNote,
      image: Photo,
      url: Link,
    };
    return (iconMap[type] || Document) as unknown as ComponentType;
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
      {#each $files as file (file.id)}
        <li class="file-item">
          <div class="file-info">
            <svelte:component this={getFileIcon(file.type)} class="file-icon" />
            <span>{file.name}</span>
          </div>
          <button class="remove-file" on:click={() => files.removeFile(file.id)}>×</button>
        </li>
      {/each}
    </ul>
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
    list-style-type: none;
    padding: 0;
    margin-top: 20px;
    max-height: 200px;
    overflow-y: auto;
  }

  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid var(--color-third);
  }

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

  :global(.file-icon) {
    width: 24px;
    height: 24px;
    color: var(--color-prime);
  }
</style>