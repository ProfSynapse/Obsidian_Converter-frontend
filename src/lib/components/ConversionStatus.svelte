<!-- src/lib/components/ConversionStatus.svelte -->
<script>
  import { conversionStatus } from '$lib/stores/conversionStatus.js';

  // Subscribe to the store
  $: status = $conversionStatus.status;
  $: progress = $conversionStatus.progress;
  $: currentFile = $conversionStatus.currentFile;
  $: error = $conversionStatus.error;

  function getStatusMessage(status) {
    if (typeof status !== 'string') status = '';
    switch (status) {
      case 'idle':
        return 'Waiting to start conversion...';
      case 'converting':
        return `Converting: ${currentFile ? currentFile.name : 'Files'}`;
      case 'completed':
        return 'Conversion completed successfully!';
      case 'error':
        return `Error: ${error}`;
      default:
        return 'Unknown status';
    }
  }
</script>

<div class="conversion-status">
  <h3>Conversion Status</h3>

  <div class="status-message" role="status" aria-live="polite">
    {getStatusMessage(status)}
  </div>

  {#if status === 'converting'}
    <div class="progress-wrapper">
      <div class="progress-bar">
        <div class="progress-fill" style="width: {progress}%"></div>
      </div>
      <span class="progress-text">{progress}%</span>
    </div>
    <div class="spinner-wrapper">
      <!-- Custom Spinner -->
      <div class="spinner"></div>
    </div>
  {/if}

  {#if status === 'completed'}
    <div class="completion-message animate-pulse">
      🎉 All files converted successfully! 🎉
    </div>
  {/if}

  {#if status === 'error'}
    <div class="error-message">
      <p>An error occurred during conversion. Please try again.</p>
      <p class="error-details">{error}</p>
    </div>
  {/if}
</div>

<style>
  .conversion-status {
    border: 2px solid var(--color-prime);
    padding: 20px;
    border-radius: var(--rounded-corners);
    background-color: rgba(255, 255, 255, 0.9);
    margin-bottom: 20px;
  }

  h3 {
    margin-bottom: 1rem;
    color: var(--color-prime);
    text-align: center;
  }

  .status-message {
    text-align: center;
    font-size: 1rem;
    margin-bottom: 20px;
    color: var(--color-text);
  }

  .progress-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  .progress-bar {
    flex: 1;
    height: 20px;
    background-color: #e0e0e0;
    border-radius: var(--rounded-corners);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background-color: var(--color-prime);
    transition: width var(--transition-speed);
  }

  .progress-text {
    width: 50px;
    text-align: right;
    font-size: 0.9rem;
    color: var(--color-text);
  }

  .spinner-wrapper {
    display: flex;
    justify-content: center;
  }

  /* Simple CSS Spinner */
  .spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid var(--color-prime);
    border-radius: 50%;
    width: 24px;
    height: 24px;
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .completion-message {
    text-align: center;
    font-size: 1.1rem;
    color: var(--color-prime);
  }

  .error-message {
    text-align: center;
    font-size: 1rem;
    color: var(--color-error);
  }

  .error-details {
    margin-top: 10px;
    font-size: 0.9rem;
    color: var(--color-text);
  }

  .animate-pulse {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.6; }
    100% { opacity: 1; }
  }
</style>
