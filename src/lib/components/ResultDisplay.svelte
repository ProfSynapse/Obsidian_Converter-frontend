<script>
  import { files } from '$lib/stores/files.js';
  import { getFileIcon } from '$lib/utils/iconUtils.js';
  import { fade, fly, slide } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  // File status configuration
  const statusConfig = {
    pending: {
      color: 'var(--color-warning)',
      background: 'var(--color-warning-light)',
      icon: '⏳'
    },
    completed: {
      color: 'var(--color-success)',
      background: 'var(--color-success-light)',
      icon: '✨'
    },
    error: {
      color: 'var(--color-error)',
      background: 'var(--color-error-light)',
      icon: '⚠️'
    }
  };

  // Local state
  let selectedFiles = new Set();
  let isDownloading = false;

  // Computed values
  $: completedFiles = $files.filter(f => f.status === 'completed');
  $: hasCompletedFiles = completedFiles.length > 0;
  $: totalFiles = $files.length;
  $: conversionSuccess = totalFiles > 0 && 
     completedFiles.length === totalFiles;

  // File handling functions
  function getStatusConfig(status) {
    return statusConfig[status] || statusConfig.pending;
  }

  function formatFileSize(bytes) {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  // Download handling
  async function handleDownload(fileId) {
    // Implement single file download
    console.log('Downloading file:', fileId);
  }

  async function handleDownloadAll() {
    if (isDownloading) return;
    isDownloading = true;
    try {
      // Implement batch download
      console.log('Downloading all files');
    } finally {
      isDownloading = false;
    }
  }

  function toggleFileSelection(fileId) {
    if (selectedFiles.has(fileId)) {
      selectedFiles.delete(fileId);
    } else {
      selectedFiles.add(fileId);
    }
    selectedFiles = selectedFiles; // Trigger reactivity
  }
</script>

<div class="results-card" in:fade={{ duration: 300 }}>
  <!-- Header Section -->
  <div class="card-header">
    <div class="header-content">
      <h2 class="title">
        <span class="icon">📝</span>
        Conversion Results
      </h2>
      {#if totalFiles > 0}
        <div class="stats" transition:fade>
          <span class="stat-item">
            <span class="stat-value">{completedFiles.length}</span>
            <span class="stat-label">completed</span>
          </span>
          <span class="stat-divider">/</span>
          <span class="stat-item">
            <span class="stat-value">{totalFiles}</span>
            <span class="stat-label">total</span>
          </span>
        </div>
      {/if}
    </div>

    {#if hasCompletedFiles}
      <button
        class="download-all-button"
        on:click={handleDownloadAll}
        disabled={isDownloading}
        transition:fade
      >
        <span class="icon">
          {isDownloading ? '⏳' : '📥'}
        </span>
        <span class="button-text">
          {isDownloading ? 'Preparing...' : 'Download All'}
        </span>
      </button>
    {/if}
  </div>

  <!-- Results Content -->
  <div class="card-content">
    {#if totalFiles > 0}
      <ul class="results-list" role="list">
        {#each $files as file (file.id)}
          <li
            class="result-item"
            class:is-completed={file.status === 'completed'}
            class:is-error={file.status === 'error'}
            animate:flip={{ duration: 300 }}
            transition:slide|local
          >
            <div class="result-content">
              <!-- File Icon and Info -->
              <div class="file-preview">
                <div 
                  class="file-icon"
                  style="--status-color: {getStatusConfig(file.status).color}"
                >
                  {getFileIcon(file.type)}
                </div>
              </div>

              <div class="file-details">
                <div class="file-name-row">
                  <span class="file-name">{file.name}</span>
                  {#if file.size}
                    <span class="file-size">
                      {formatFileSize(file.size)}
                    </span>
                  {/if}
                </div>

                <div class="file-status-row">
                  <span 
                    class="status-badge"
                    style="
                      --status-color: {getStatusConfig(file.status).color};
                      --status-background: {getStatusConfig(file.status).background}
                    "
                  >
                    <span class="status-icon">
                      {getStatusConfig(file.status).icon}
                    </span>
                    {file.status}
                  </span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="actions">
                {#if file.status === 'completed'}
                  <button
                    class="action-button download"
                    on:click={() => handleDownload(file.id)}
                    title="Download file"
                  >
                    <span class="icon">📥</span>
                  </button>
                {/if}
              </div>
            </div>

            <!-- Error Message -->
            {#if file.status === 'error' && file.error}
              <div 
                class="error-message"
                transition:slide|local
              >
                {file.error}
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    {:else}
      <div class="empty-state" in:fade>
        <div class="empty-content">
          <span class="empty-icon">📄</span>
          <p class="empty-text">No files have been converted yet.</p>
          <p class="empty-subtext">
            Upload some files to get started!
          </p>
        </div>
      </div>
    {/if}
  </div>

  <!-- Success Message -->
  {#if conversionSuccess}
    <div 
      class="success-banner"
      transition:fly={{ y: 20, duration: 300 }}
    >
      <div class="banner-content">
        <span class="banner-icon">✨</span>
        <span class="banner-text">
          All files converted successfully! Click Download All to get your files.
        </span>
      </div>
    </div>
  {/if}
</div>

<style>
  .results-card {
    background: var(--color-surface);
    border-radius: var(--rounded-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    border: 1px solid var(--color-background-secondary);
  }

  .card-header {
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--color-background-secondary);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-md);
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }

  .title {
    margin: 0;
    font-size: var(--font-size-xl);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .stats {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
  }

  .stat-value {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  .download-all-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-lg);
    background: var(--gradient-primary);
    color: var(--color-text-on-dark);
    border: none;
    border-radius: var(--rounded-lg);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all var(--transition-duration-normal) var(--transition-timing-ease);
  }

  .download-all-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .download-all-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .card-content {
    padding: var(--spacing-lg);
  }

  .results-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .result-item {
    background: var(--color-background-primary);
    border-radius: var(--rounded-lg);
    border: 1px solid var(--color-background-secondary);
    transition: all var(--transition-duration-normal) var(--transition-timing-ease);
  }

  .result-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }

  .result-content {
    padding: var(--spacing-md);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .file-preview {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--rounded-lg);
    background: color-mix(in srgb, var(--status-color) 10%, transparent);
  }

  .file-icon {
    font-size: var(--font-size-2xl);
    color: var(--status-color);
  }

  .file-details {
    flex: 1;
    min-width: 0;
  }

  .file-name-row {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
  }

  .file-name {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-size {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2xs);
    padding: var(--spacing-2xs) var(--spacing-xs);
    border-radius: var(--rounded-full);
    background: var(--status-background);
    color: var(--status-color);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  }

  .actions {
    display: flex;
    gap: var(--spacing-xs);
  }

  .action-button {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: var(--rounded-lg);
    background: var(--color-background-secondary);
    color: var(--color-text-primary);
    cursor: pointer;
    transition: all var(--transition-duration-normal) var(--transition-timing-ease);
  }

  .action-button:hover {
    background: var(--color-hover);
    transform: scale(1.1);
  }

  .action-button.download:hover {
    background: var(--color-success-light);
    color: var(--color-success);
  }

  .error-message {
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-error-light);
    color: var(--color-error);
    font-size: var(--font-size-sm);
    border-top: 1px solid var(--color-error);
  }

  .empty-state {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--color-text-secondary);
  }

  .empty-icon {
    font-size: var(--font-size-4xl);
    margin-bottom: var(--spacing-md);
    display: inline-block;
  }

  .empty-text {
    font-size: var(--font-size-lg);
    margin: 0 0 var(--spacing-xs);
    color: var(--color-text-primary);
  }

  .empty-subtext {
    margin: 0;
    font-size: var(--font-size-base);
  }

  .success-banner {
    padding: var(--spacing-md) var(--spacing-lg);
    background: var(--color-success-light);
    border-top: 1px solid var(--color-success);
  }

  .banner-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    color: var(--color-success);
    font-weight: var(--font-weight-medium);
  }

  @media (max-width: 640px) {
    .card-header {
      flex-direction: column;
      align-items: stretch;
    }

    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-xs);
    }

    .download-all-button {
      width: 100%;
      justify-content: center;
      margin-top: var(--spacing-sm);
    }

    .stats {
      width: 100%;
      justify-content: flex-start;
      margin-top: var(--spacing-xs);
    }

    .result-content {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-sm);
    }

    .file-preview {
      width: 100%;
      height: auto;
      padding: var(--spacing-sm);
      background: var(--color-background-secondary);
    }

    .file-name-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .file-size {
      font-size: var(--font-size-xs);
    }

    .actions {
      width: 100%;
      justify-content: flex-end;
      padding-top: var(--spacing-xs);
      border-top: 1px solid var(--color-background-secondary);
    }

    .action-button {
      width: 100%;
      height: 44px;
    }

    .status-badge {
      width: fit-content;
    }

    .empty-state {
      padding: var(--spacing-lg);
    }

    .empty-icon {
      font-size: var(--font-size-3xl);
    }

    .empty-text {
      font-size: var(--font-size-base);
    }

    .banner-content {
      flex-direction: column;
      text-align: center;
      gap: var(--spacing-xs);
    }
  }

  @media (max-width: 480px) {
    .card-header {
      padding: var(--spacing-md);
    }

    .title {
      font-size: var(--font-size-lg);
    }

    .card-content {
      padding: var(--spacing-md);
    }

    .result-item {
      margin: 0 calc(-1 * var(--spacing-md));
      border-radius: 0;
      border-left: none;
      border-right: none;
    }

    .result-item:first-child {
      border-top: none;
    }

    .result-item:last-child {
      border-bottom: none;
    }

    .file-preview {
      padding: var(--spacing-xs);
    }

    .file-icon {
      font-size: var(--font-size-xl);
    }

    .status-badge {
      font-size: var(--font-size-xs);
    }
  }

  /* Print Styles */
  @media print {
    .results-card {
      box-shadow: none;
      border: 1px solid #000;
    }

    .download-all-button,
    .action-button {
      display: none;
    }

    .result-item {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .file-preview {
      border: 1px solid #000;
    }

    .status-badge {
      border: 1px solid currentColor;
    }
  }

  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    .results-card {
      border: 2px solid currentColor;
    }

    .status-badge {
      border: 1px solid currentColor;
      background: none !important;
    }

    .file-preview {
      border: 1px solid currentColor;
      background: none !important;
    }

    .success-banner {
      border: 2px solid currentColor;
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .result-item,
    .action-button,
    .download-all-button {
      transition: none;
      transform: none;
    }

    .result-item:hover {
      transform: none;
    }
  }

  /* Dark Mode Support (if needed) */
  @media (prefers-color-scheme: dark) {
    .results-card {
      background: var(--color-surface-dark, #1a1a1a);
      border-color: var(--color-border-dark, #333);
    }

    .empty-text {
      color: var(--color-text-dark, #fff);
    }

    .file-preview {
      background: var(--color-background-dark, #222);
    }

    .action-button {
      background: var(--color-background-dark, #333);
    }
  }
</style>