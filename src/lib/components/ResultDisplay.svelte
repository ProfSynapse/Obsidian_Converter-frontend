<!-- src/lib/components/ResultDisplay.svelte -->
<script>
  import { files } from '$lib/stores/files.js';
  import { getFileIcon } from '$lib/utils/iconUtils.js';

  // Function to handle file download
  export let onDownloadFile;

  // Function to get status color (you may have this function already)
  function getStatusColor(status) {
    switch (status) {
      case 'completed':
        return 'green';
      case 'error':
        return 'red';
      default:
        return 'black';
    }
  }
</script>

<div class="result-display">
  <h2>Conversion Results</h2>
  {#if $files.length > 0}
    <ul class="file-list">
      {#each $files as file}
        <li class="file-item">
          <div class="file-info">
            <span class="file-icon">{getFileIcon(file.type)}</span>
            <span class="file-name">{file.name}</span>
            <span class="file-status" style="color: {getStatusColor(file.status)}">
              {file.status}
            </span>
          </div>
          <!-- Download Button -->
          {#if file.status === 'completed'}
            <button
              class="download-button"
              on:click={() => onDownloadFile({ detail: { fileId: file.id } })}
            >
              Download
            </button>
          {/if}
        </li>
      {/each}
    </ul>
  {:else}
    <p>No files have been converted yet.</p>
  {/if}
</div>

<style>
  /* Styles for result-display component */
  .result-display {
    border: 2px solid var(--color-prime);
    padding: 20px;
    border-radius: var(--rounded-corners);
    margin-bottom: 20px;
    background-color: rgba(255, 255, 255, 0.9);
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
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .file-icon {
    font-size: 1.5rem;
  }

  .file-name {
    font-weight: 500;
  }

  .file-status {
    font-size: 0.9em;
    font-style: italic;
  }

  .download-button {
    background-color: var(--color-prime);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: var(--rounded-corners);
    cursor: pointer;
    transition: background-color var(--transition-speed);
  }

  .download-button:hover {
    background-color: var(--color-second);
  }
</style>
