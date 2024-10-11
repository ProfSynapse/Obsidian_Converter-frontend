<!-- src/lib/components/ConversionStatus.svelte -->
<script>
  import { conversionStatus } from '$lib/stores/conversionStatus.js';

  // Reactive variables
  $: status = $conversionStatus.status;
  $: progress = $conversionStatus.progress;
  $: file = $conversionStatus.currentFile;
  $: error = $conversionStatus.error;

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

<style>
  /* Your existing styles */
</style>
