<script>
  import { conversionStatus, conversionProgress, currentFile, conversionError } from '$lib/stores/conversionStatus';

  // Subscribe to the stores
  $: status = $conversionStatus.status;
  $: progress = $conversionProgress;
  $: file = $currentFile;
  $: error = $conversionError;

  function getStatusMessage(status) {
    if (typeof status !== 'string') status = '';
    switch (status) {
      case 'idle':
        return 'Waiting to start conversion...';
      case 'converting':
        return `Converting: ${file}`;
      case 'completed':
        return 'Conversion completed successfully!';
      case 'error':
        return `Error: ${error}`;
      default:
        return 'Unknown status';
    }
  }
</script>

<div class="conversion-status container">
  <h2>Conversion Status</h2>

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
  {:else if status === 'completed'}
    <div class="completion-message animate-pulse">
      🎉 All files converted successfully! 🎉
    </div>
  {:else if status === 'error'}
    <div class="error-message">
      <p>An error occurred during conversion. Please try again.</p>
      <p class="error-details">{error}</p>
    </div>
  {/if}
</div>

<style lang="scss">
  .conversion-status {
    text-align: center;
    padding: 20px;
    border-radius: var(--rounded-corners);
    background: var(--color-background);
    box-shadow: var(--box-shadow);
  }

  h2 {
    color: var(--color-prime);
    margin-bottom: 15px;
  }

  .status-message {
    font-size: 1.1em;
    margin-bottom: 20px;
  }

  .progress-wrapper {
    margin-bottom: 20px;
    position: relative;
  }

  .progress-bar {
    width: 100%;
    background-color: #eee;
    height: 10px;
    border-radius: 5px;
    overflow: hidden;
  }

  .progress-fill {
    background-color: var(--color-prime);
    height: 100%;
    width: 0%;
    transition: width 0.2s ease-in-out;
  }

  .progress-text {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    font-weight: bold;
    color: var(--color-prime);
  }

  .spinner-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  /* Custom Spinner Styles */
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: var(--color-prime);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 0.75s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .completion-message {
    color: var(--color-prime);
    font-weight: bold;
    font-size: 1.2em;
    margin-top: 20px;
  }

  .error-message {
    color: var(--color-error);
    margin-top: 20px;

    .error-details {
      font-size: 0.9em;
      margin-top: 10px;
      word-break: break-word;
    }
  }
</style>
