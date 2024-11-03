<!-- src/lib/components/ResultDisplay.svelte -->
<script>
  import { files } from '$lib/stores/files.js';
  import { onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import Container from './common/Container.svelte';
  import JSZip from 'jszip';
  import { saveAs } from 'file-saver';

  let convertedFiles = [];

  const unsubscribe = files.subscribe(value => {
    convertedFiles = value.filter(file => file.status === 'completed');
  });

  onDestroy(() => {
    unsubscribe();
  });

  /**
   * Handles download event for a single file
   */
  async function handleDownload(fileId) {
    try {
      const file = $files.find(f => f.id === fileId);
      if (!file) throw new Error('File not found');

      const zip = new JSZip();
      zip.file(`${file.name}.md`, file.convertedContent);

      if (file.images?.length > 0) {
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        const imagesFolder = zip.folder(`attachments/${baseName}`);
        
        for (const image of file.images) {
          const imageData = atob(image.data);
          const arrayBuffer = new ArrayBuffer(imageData.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          
          for (let i = 0; i < imageData.length; i++) {
            uint8Array[i] = imageData.charCodeAt(i);
          }
          
          imagesFolder.file(image.name, uint8Array, { binary: true });
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${file.name}-converted.zip`);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  }

  /**
   * Handles batch download of all converted files
   */
  async function handleDownloadAll() {
    try {
      const zip = new JSZip();
      
      for (const file of convertedFiles) {
        zip.file(`${file.name}.md`, file.convertedContent);
        
        if (file.images?.length > 0) {
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const imagesFolder = zip.folder(`attachments/${baseName}`);
          
          for (const image of file.images) {
            const imageData = atob(image.data);
            const arrayBuffer = new ArrayBuffer(imageData.length);
            const uint8Array = new Uint8Array(arrayBuffer);
            
            for (let i = 0; i < imageData.length; i++) {
              uint8Array[i] = imageData.charCodeAt(i);
            }
            
            imagesFolder.file(image.name, uint8Array, { binary: true });
          }
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'converted_files.zip');
    } catch (error) {
      console.error('Batch Download error:', error);
      alert('Failed to download all files. Please try again.');
    }
  }
</script>
  <div class="result-display">
    <h2>Conversion Results</h2>
    {#if convertedFiles.length > 0}
      <ul class="result-list">
        {#each convertedFiles as file}
          <li class="result-item" in:fade>
            <span class="icon">📄</span>
            <span>{file.name}</span>
            <button on:click={() => handleDownload(file.id)} class="download-button">
              <span class="icon">⬇️</span>
              Download
            </button>
          </li>
        {/each}
      </ul>
      {#if convertedFiles.length > 1}
        <div class="batch-download">
          <button class="download-all-button" on:click={handleDownloadAll}>
            <span class="icon">📦</span>
            Download All Files (ZIP)
          </button>
        </div>
      {/if}
    {:else}
      <p class="no-results">No conversions completed yet.</p>
    {/if}
  </div>


<style>
  /* Ensure the container adheres to parent Container's width */
  .result-display-container {
    /* Container handles max-width */
  }

  .result-display {
    width: 100%;
    max-width: 600px; /* Match other components */
    margin: 0 auto;
    padding: var(--spacing-lg);
    background: var(--color-surface);
    border-radius: var(--rounded-lg);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--color-border);
    transition: all var(--transition-duration-normal) var(--transition-timing-ease);
  }

  .result-display h2 {
    margin-bottom: var(--spacing-md);
    font-size: var(--font-size-lg);
    color: var(--color-text-primary);
  }

  .result-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .result-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-2xs) 0;
    border-bottom: 1px solid var(--color-background-secondary);
  }

  .result-item:last-child {
    border-bottom: none;
  }

  .result-item .icon {
    font-size: var(--font-size-xl);
  }

  .download-button, .download-all-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-2xs) var(--spacing-sm);
    background: var(--color-success);
    color: var(--color-text-on-dark);
    border: none;
    border-radius: var(--rounded-md);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    text-decoration: none;
    transition: all var(--transition-duration-normal) var(--transition-timing-ease);
  }

  .download-button:hover, .download-all-button:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .batch-download {
    margin-top: var(--spacing-md);
    display: flex;
    justify-content: center;
  }

  .download-all-button {
    width: 100%;
    max-width: 300px;
    justify-content: center;
    background: var(--color-second);
  }

  .no-results {
    text-align: center;
    color: var(--color-text-secondary);
    padding: var(--spacing-lg);
  }

  /* Responsive Design */
  @media (max-width: 640px) {
    .result-display {
      padding: var(--spacing-md);
    }

    .result-display h2 {
      font-size: var(--font-size-base);
    }

    .result-item {
      gap: var(--spacing-2xs);
    }

    .result-item .icon {
      font-size: var(--font-size-lg);
    }

    .download-button {
      padding: var(--spacing-xs) var(--spacing-2xs);
    }

    .download-all-button {
      max-width: 100%;
    }
  }

  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    .download-button, .download-all-button {
      border: 2px solid var(--color-text-on-dark);
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .download-button, .download-all-button {
      transition: none;
    }

    .download-button:hover, .download-all-button:hover {
      transform: none;
      box-shadow: none;
    }
  }
</style>
