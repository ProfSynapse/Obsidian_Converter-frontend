<!-- src/lib/components/ResultDisplay.svelte -->

<script>
  import { files } from '$lib/stores/files.js';
  import { onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import Container from './common/Container.svelte';
  import JSZip from 'jszip';
  import { derived } from 'svelte/store';
  import pkg from 'file-saver';
  const { saveAs } = pkg;

  // Derived store to get all converted files
  const convertedFiles = derived(files, $files => $files.filter(file => file.status === 'completed'));

  // Derived store to check if all files are processed
  const allConverted = derived(files, $files => 
    $files.length > 0 && $files.every(file => file.status === 'completed' || file.status === 'error')
  );

  // Reactive flag to prevent multiple auto-download triggers
  let triggerAutoDownload = false;

  // Reactive statement to trigger auto-download when all conversions are complete
  $: if ($allConverted && $convertedFiles.length > 0 && !triggerAutoDownload) {
    triggerDownloadAll();
    triggerAutoDownload = true;
  }

  /**
   * Handles download event for a single file
   */
  async function handleDownload(fileId) {
    try {
      const file = $files.find(f => f.id === fileId);
      if (!file) throw new Error('File not found');

      const zip = new JSZip();
      zip.file(`${file.name}.md`, file.convertedContent || ''); // Ensure convertedContent exists

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

      for (const file of $convertedFiles) {
        zip.file(`${file.name}.md`, file.convertedContent || '');

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

  /**
   * Automatically triggers the download of all converted files
   */
  function triggerDownloadAll() {
    // Delay to ensure UI updates before triggering download
    setTimeout(() => {
      handleDownloadAll();
    }, 500);
  }
</script>

<div class="result-display" in:fade>
  <h2>
    <span class="icon">🎉</span>
    Conversion Results
  </h2>
  {#if $convertedFiles.length > 0}
    <ul class="result-list">
      {#each $convertedFiles as file (file.id)}
        <li class="result-item" in:fade out:fade>
          <div class="file-info">
            <span class="icon">📄</span>
            <span class="file-name">{file.name}</span>
            <span class="badge-success" title="Conversion successful">
              ✨ Success
            </span>
          </div>
          <button on:click={() => handleDownload(file.id)} class="download-button" aria-label={`Download ${file.name}`}>
            <span class="icon">⬇️</span>
            Download
          </button>
        </li>
      {/each}
    </ul>
    {#if $convertedFiles.length > 1}
      <div class="batch-download">
        <button class="download-all-button" on:click={handleDownloadAll} aria-label="Download all converted files as ZIP">
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
  .result-display {
    width: 100%;
    max-width: 800px; /* Increased max-width for better layout */
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
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
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
    justify-content: space-between;
    gap: var(--spacing-xs);
    padding: var(--spacing-2xs) var(--spacing-sm);
    border-bottom: 1px solid var(--color-background-secondary);
    transition: background 0.3s ease;
  }

  .result-item:hover {
    background: var(--color-background-hover);
  }

  .result-item:last-child {
    border-bottom: none;
  }

  .result-item .icon {
    font-size: var(--font-size-xl);
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    flex: 1;
  }

  .file-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  .badge-success {
    background-color: var(--color-success-light);
    color: var(--color-success);
    padding: 4px 8px;
    border-radius: var(--rounded-full);
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
    font-size: var(--font-size-sm);
    transition: background 0.3s ease;
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

  .download-all-button {
    width: 100%;
    max-width: 300px;
    justify-content: center;
    background: var(--color-second);
    margin-top: var(--spacing-md);
  }

  .batch-download {
    display: flex;
    justify-content: center;
    margin-top: var(--spacing-md);
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
      padding: var(--spacing-2xs) var(--spacing-xs);
    }

    .result-item .icon {
      font-size: var(--font-size-lg);
    }

    .download-button, .download-all-button {
      padding: var(--spacing-xs) var(--spacing-2xs);
      font-size: var(--font-size-xs);
    }

    .download-all-button {
      max-width: 100%;
    }
  }

  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    .download-button, .download-all-button {
      border: 2px solid currentColor;
    }

    .badge-success {
      border: 2px solid currentColor;
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .download-button, .download-all-button, .result-item {
      transition: none;
    }
  }
</style>
