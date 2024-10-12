<!-- src/lib/components/FileList.svelte -->
<script>
  import { files } from '$lib/stores/files.js';
  import { getFileIcon } from '$lib/utils/iconUtils.js';
  import { onDestroy } from 'svelte';

  export let title = 'Files';
  export let onAction; // Function to handle actions on files
  export let filterFunction = () => true; // Function to filter files
  export let getStatusColor = () => 'var(--color-text)'; // Function to get status color
  export let isDisabled = () => false; // Function to determine if action is disabled

  let filteredFiles = [];
  let selectedFiles = [];
  let selectAll = false;

  const unsubscribe = files.subscribe(value => {
    filteredFiles = value.filter(filterFunction);
    // Adjust selectedFiles based on filteredFiles
    selectedFiles = selectedFiles.filter(id => filteredFiles.some(file => file.id === id));
    // If all filtered files are selected, set selectAll to true
    selectAll = filteredFiles.length > 0 && selectedFiles.length === filteredFiles.length;
  });

  onDestroy(() => {
    unsubscribe();
  });

  // Function to handle checkbox change for a file
  function toggleFileSelection(fileId) {
    if (selectedFiles.includes(fileId)) {
      selectedFiles = selectedFiles.filter(id => id !== fileId);
    } else {
      selectedFiles = [...selectedFiles, fileId];
    }
  }

  // Function to handle Select All checkbox
  function handleSelectAll() {
    if (selectAll) {
      selectedFiles = [];
    } else {
      selectedFiles = filteredFiles.map(file => file.id);
    }
    selectAll = !selectAll;
  }

  // Function to handle Remove Selected button
  function removeSelectedFiles() {
    selectedFiles.forEach(id => {
      files.removeFile(id);
    });
    selectedFiles = [];
    selectAll = false;
  }

  // Function to return SVG markup or icon
  function getIconMarkup(type) {
    return getFileIcon(type);
  }
</script>

<div class="file-list-container">
  <!-- Sticky Header -->
  <div class="file-list-header">
    <h3>{title}</h3>
    {#if filteredFiles.length > 0}
      <div class="file-list-actions">
        <div class="select-all">
          <input
            type="checkbox"
            checked={selectAll}
            on:change={handleSelectAll}
            id="select-all-checkbox"
            aria-label="Select All Files"
          />
          <label for="select-all-checkbox">Select All</label>
        </div>
        {#if selectedFiles.length > 0}
          <button class="btn btn-pill remove-selected-button" on:click={removeSelectedFiles} aria-label="Remove Selected Files">
            Remove Selected ({selectedFiles.length})
          </button>
        {/if}
      </div>
    {/if}
  </div>

  {#if filteredFiles.length > 0}
    <ul class="file-list">
      {#each filteredFiles as file}
        <li class="file-item">
          <div class="file-info">
            <input
              type="checkbox"
              checked={selectedFiles.includes(file.id)}
              on:change={() => toggleFileSelection(file.id)}
              aria-label={`Select file ${file.name}`}
            />
            <!-- File Icon -->
            <span class="file-icon" aria-hidden="true">
              {@html getIconMarkup(file.type)}
            </span>
            <!-- File name -->
            <span class="file-name">{file.name}</span>
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="no-files-message">No files to display.</p>
  {/if}
</div>

<style>
  .file-list-container {
    border: 2px solid var(--color-prime);
    padding: 0 20px 20px 20px; /* Removed top padding */
    border-radius: var(--rounded-corners);
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: var(--box-shadow);
    max-height: 400px; /* Adjust based on item height */
    overflow-y: auto; /* Enable vertical scrolling */
    position: relative;
  }

  /* Sticky Header */
  .file-list-header {
    position: sticky;
    top: 0;
    background-color: rgba(255, 255, 255, 0.95); /* Slight transparency to blend with content */
    z-index: 100; /* Higher z-index to ensure it stays above the list items */
    padding: 10px 0; /* Uniform vertical padding */
    border-bottom: 1px solid var(--color-third);
  }

  .file-list-header h3 {
    margin: 0;
    color: var(--color-prime);
    font-size: 1.5rem;
    text-align: center;
    margin-bottom: 10px;
  }

  .file-list-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
  }

  .select-all {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .select-all input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  .select-all label {
    cursor: pointer;
    user-select: none;
  }

  /* "Remove Selected" Button - Pill-Shaped */
  .remove-selected-button {
    position: relative; /* For pseudo-element */
    overflow: hidden; /* To contain the pseudo-element */
    background-color: var(--color-prime); /* Teal by default */
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 9999px; /* Pill shape */
    cursor: pointer;
    transition: color var(--transition-speed), box-shadow var(--transition-speed), transform var(--transition-speed);
    font-weight: 600;
  }

  .remove-selected-button::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--gradient-button);
    opacity: 0;
    transition: opacity var(--transition-speed);
    border-radius: 9999px;
    z-index: -1; /* Place behind the button text */
  }

  .remove-selected-button:hover::before {
    opacity: 1; /* Fade in the gradient */
  }

  .remove-selected-button:hover {
    color: white; /* Ensure text remains visible over gradient */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .remove-selected-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
    padding: 10px 0;
    border-bottom: 1px solid var(--color-third);
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .file-icon {
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .file-icon svg {
    width: 100%;
    height: 100%;
  }

  .file-name {
    font-weight: 500;
    flex: 1;
  }

  .no-files-message {
    text-align: center;
    color: var(--color-text);
    font-style: italic;
    padding: 1rem 0;
  }

  /* Scrollbar Styling (Optional) */
  .file-list-container::-webkit-scrollbar {
    width: 8px;
  }

  .file-list-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: var(--rounded-corners);
  }

  .file-list-container::-webkit-scrollbar-thumb {
    background: var(--color-prime);
    border-radius: var(--rounded-corners);
  }

  .file-list-container::-webkit-scrollbar-thumb:hover {
    background: var(--color-second);
  }
</style>
