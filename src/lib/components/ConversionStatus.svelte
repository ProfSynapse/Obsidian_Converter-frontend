<!-- src/lib/components/ConversionStatus.svelte -->
<script>
  import { conversionStatus } from '$lib/stores/conversionStatus';

  // Get status messages
  function getStatusMessage(status, currentFile, imageCount) {
    switch (status) {
      case 'converting':
        return `Converting: ${currentFile || 'Files'}`;
      case 'processing_images':
        return `Processing images (${imageCount} found)...`;
      case 'creating_zip':
        return 'Creating ZIP archive...';
      case 'completed':
        return 'Conversion completed! Ready for download.';
      case 'error':
        return `Error: ${$conversionStatus.error}`;
      default:
        return 'Ready to convert';
    }
  }
</script>

<div class="status-container">
  <h3>Conversion Status</h3>
  
  <div class="status-message">
    {getStatusMessage(
      $conversionStatus.status,
      $conversionStatus.currentFile,
      $conversionStatus.imageCount
    )}
  </div>
  
  {#if $conversionStatus.status !== 'idle' && $conversionStatus.status !== 'error'}
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        style="width: {$conversionStatus.progress}%"
      />
    </div>
    <div class="progress-text">
      {$conversionStatus.progress}%
    </div>
  {/if}

  {#if $conversionStatus.status === 'error'}
    <div class="error-message">
      {$conversionStatus.error}
    </div>
  {/if}
</div>

<style>
  .status-container {
    border: 2px solid var(--color-prime);
    padding: 20px;
    border-radius: var(--rounded-corners);
    margin: 20px 0;
    background-color: white;
  }

  .status-message {
    text-align: center;
    margin: 10px 0;
    font-weight: 500;
  }

  .progress-bar {
    width: 100%;
    height: 20px;
    background-color: #eee;
    border-radius: 10px;
    overflow: hidden;
    margin: 10px 0;
  }

  .progress-fill {
    height: 100%;
    background-color: var(--color-prime);
    transition: width 0.3s ease;
  }

  .progress-text {
    text-align: center;
    font-size: 0.9em;
    color: var(--color-text);
  }

  .error-message {
    color: var(--color-error);
    text-align: center;
    margin-top: 10px;
    padding: 10px;
    background-color: #ffebee;
    border-radius: var(--rounded-corners);
  }
</style>