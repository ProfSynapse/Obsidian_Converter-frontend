<!-- src/lib/components/ResultDisplay.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { files } from '$lib/stores/files';
  import { DocumentText, VideoCamera, MusicalNote, Photo, Link } from 'svelte-hero-icons';
  import Button from '@smui/button';
  import type { Readable } from 'svelte/store';

  const dispatch = createEventDispatcher();

  interface File {
    id: string;
    name: string;
    type: string;
    status: string;
  }

  const fileIcons: { [key: string]: typeof import('svelte-hero-icons').IconSource } = {
    document: DocumentText,
    video: VideoCamera,
    audio: MusicalNote,
    image: Photo,
    url: Link,
  };

  function getFileIcon(type: string): typeof import('svelte-hero-icons').IconSource {
    return fileIcons[type] || DocumentText;
  }

  function handleDownload(file: File) {
    dispatch('downloadFile', { fileId: file.id });
  }

  function getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      completed: 'var(--color-prime)',
      error: 'var(--color-error)',
      pending: 'var(--color-text)',
    };
    return colors[status] || 'var(--color-text)';
  }

  // Type assertion for files store
  const typedFiles = files as Readable<File[]>;
</script>

<div class="result-display container">
  <h2>Converted Files</h2>
  {#if $typedFiles.length === 0}
    <p>No files have been converted yet.</p>
  {:else}
    <ul class="file-list">
      {#each $typedFiles as file (file.id)}
        <li class="file-item">
          <div class="file-info">
            <svelte:component this={getFileIcon(file.type)} class="file-icon" />
            <span class="file-name">{file.name}</span>
            <span class="file-status" style="color: {getStatusColor(file.status)}">
              {file.status}
            </span>
          </div>
          <Button 
            on:click={() => handleDownload(file)}
            disabled={file.status !== 'completed'}
            class="download-button"
          >
            Download
          </Button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .result-display {
    margin-top: 20px;
  }

  h2 {
    color: var(--color-second);
    margin-bottom: 15px;
  }

  .file-list {
    list-style-type: none;
    padding: 0;
  }

  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid var(--color-third);
    transition: background-color 0.3s ease;
  }

  .file-item:hover {
    background-color: rgba(0, 169, 157, 0.1);
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  :global(.file-icon) {
    width: 24px;
    height: 24px;
    color: var(--color-prime);
  }

  .file-name {
    font-weight: 500;
  }

  .file-status {
    font-size: 0.9em;
    font-style: italic;
  }

  :global(.download-button) {
    padding: 5px 10px;
    font-size: 0.9em;
  }

  :global(.download-button:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>