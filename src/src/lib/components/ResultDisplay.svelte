<!-- src/lib/components/ResultDisplay.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { files } from '$lib/stores/files';
    import { Document, Video, Music, Image, Link } from 'svelte-hero-icons';
    import { Button } from '@smui/button';
  
    const dispatch = createEventDispatcher();
  
    function getFileIcon(type: string) {
      switch(type) {
        case 'document': return Document;
        case 'video': return Video;
        case 'audio': return Music;
        case 'image': return Image;
        case 'url': return Link;
        default: return Document;
      }
    }
  
    function handleDownload(file) {
      dispatch('downloadFile', { fileId: file.id });
    }
  
    function getStatusColor(status: string) {
      switch(status) {
        case 'completed': return 'var(--color-prime)';
        case 'error': return 'var(--color-error)';
        default: return 'var(--color-text)';
      }
    }
  </script>
  
  <div class="result-display container">
    <h2>Converted Files</h2>
    {#if $files.length === 0}
      <p>No files have been converted yet.</p>
    {:else}
      <ul class="file-list">
        {#each $files as file (file.id)}
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
  
  <style lang="scss">
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
  
      &:hover {
        background-color: rgba(0, 169, 157, 0.1);
      }
    }
  
    .file-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  
    .file-icon {
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