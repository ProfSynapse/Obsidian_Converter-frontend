<!-- src/lib/components/FileList.svelte -->
<script lang="ts">
    import { files } from '$lib/stores/files.js';
    import type { SvelteComponent } from 'svelte';
    import { Document, VideoCamera, MusicalNote, Photo, Link } from 'svelte-hero-icons';
    import { createEventDispatcher } from 'svelte';
  
    const dispatch = createEventDispatcher();
  
    function getFileIconComponent(type: string): typeof SvelteComponent {
      const iconMap = {
        document: Document,
        video: VideoCamera,
        audio: MusicalNote,
        image: Photo,
        url: Link,
      };
      return iconMap[type] || Document;
    }
  
    function handleRemoveFile(id: string) {
      files.removeFile(id);
    }
</script>

<div class="file-list-container container">
  <h3>Files to Convert</h3>
  {#if $files.length > 0}
    <ul class="file-list">
      {#each $files as file}
        <li class="file-item">
          <div class="file-info">
            <svelte:component this={getFileIconComponent(file.type)} class="file-icon" />
            <span>{file.name}</span>
          </div>
          <button class="remove-file" on:click={() => handleRemoveFile(file.id)}>×</button>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="no-files-message">No files added yet. Please add files or URLs to convert.</p>
  {/if}
</div>

<style>
  .file-list-container {
    margin-top: 2rem;
  }

  .file-list-container h3 {
    margin-bottom: 1rem;
    color: var(--color-second);
    text-align: center;
  }

  .file-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-third);
    transition: background-color var(--transition-speed);
  }

  .file-item:hover {
    background-color: rgba(0, 169, 157, 0.05);
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  :global(.file-icon) {
    width: 24px;
    height: 24px;
    color: var(--color-prime);
  }

  .remove-file {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: var(--color-error);
    transition: transform var(--transition-speed), color var(--transition-speed);
  }

  .remove-file:hover {
    transform: scale(1.2);
    color: var(--color-error-dark);
  }

  .no-files-message {
    text-align: center;
    color: var(--color-text);
    font-style: italic;
    padding: 1rem 0;
  }
</style>