<script>
  import { conversionStatus } from '$lib/stores/conversionStatus';
  import { fade, fly, slide } from 'svelte/transition';

  // Status config with icons and colors
  const statusConfig = {
    idle: {
      icon: '⚡',
      color: 'var(--color-info)',
      background: 'var(--color-info-light)'
    },
    converting: {
      icon: '🔄',
      color: 'var(--color-prime)',
      background: 'var(--color-hover)'
    },
    processing_images: {
      icon: '🖼️',
      color: 'var(--color-second)',
      background: 'var(--color-hover)'
    },
    creating_zip: {
      icon: '📦',
      color: 'var(--color-warning)',
      background: 'var(--color-warning-light)'
    },
    completed: {
      icon: '✨',
      color: 'var(--color-success)',
      background: 'var(--color-success-light)'
    },
    error: {
      icon: '⚠️',
      color: 'var(--color-error)',
      background: 'var(--color-error-light)'
    }
  };

  function getStatusMessage(status, currentFile, imageCount) {
    switch (status) {
      case 'converting':
        return `Converting${currentFile ? `: ${currentFile}` : '...'}`;
      case 'processing_images':
        return `Processing images${imageCount ? ` (${imageCount} found)` : ''}...`;
      case 'creating_zip':
        return 'Creating ZIP archive...';
      case 'completed':
        return 'Conversion completed! Ready for download.';
      case 'error':
        return $conversionStatus.error;
      default:
        return 'Ready to convert';
    }
  }

  $: status = $conversionStatus.status;
  $: currentStatus = statusConfig[status] || statusConfig.idle;
  $: isProcessing = ['converting', 'processing_images', 'creating_zip'].includes(status);
</script>

<div
  class="status-card"
  class:is-processing={isProcessing}
  class:is-completed={status === 'completed'}
  class:is-error={status === 'error'}
  style="--status-color: {currentStatus.color}; --status-background: {currentStatus.background}"
>
  <div class="card-header" in:fly={{ y: -20, duration: 300 }}>
    <div class="status-icon" class:spin={isProcessing}>
      {currentStatus.icon}
    </div>
    <h3 class="status-title">Conversion Status</h3>
  </div>

  <div class="card-content">
    <div 
      class="status-message"
      in:fade={{ duration: 200 }}
    >
      {getStatusMessage(
        status,
        $conversionStatus.currentFile,
        $conversionStatus.imageCount
      )}
    </div>

    {#if isProcessing}
      <div class="progress-container" transition:slide>
        <div class="progress-track">
          <div 
            class="progress-bar"
            style="width: {$conversionStatus.progress}%"
          >
            <div class="progress-glow"></div>
          </div>
        </div>
        <div class="progress-info">
          <span class="progress-percentage">
            {$conversionStatus.progress}%
          </span>
          {#if $conversionStatus.currentFile}
            <span class="current-file" transition:fade>
              {$conversionStatus.currentFile}
            </span>
          {/if}
        </div>
      </div>
    {/if}

    {#if status === 'error'}
      <div 
        class="error-container"
        transition:fly={{ y: 20, duration: 300 }}
      >
        <div class="error-icon">⚠️</div>
        <div class="error-content">
          <div class="error-title">Error Occurred</div>
          <div class="error-message">
            {$conversionStatus.error}
          </div>
        </div>
      </div>
    {/if}

    {#if status === 'completed'}
      <div 
        class="success-container"
        transition:fly={{ y: 20, duration: 300 }}
      >
        <div class="success-icon animate-bounce">✨</div>
        <div class="success-message">
          Your files are ready for download!
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .status-card {
    background: var(--color-surface);
    border-radius: var(--rounded-lg);
    padding: var(--spacing-lg);
    border: 1px solid var(--status-color);
    box-shadow: var(--shadow-md);
    transition: all var(--transition-duration-normal) var(--transition-timing-ease);
    position: relative;
    overflow: hidden;
  }

  .status-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--status-background);
    opacity: 0.1;
    z-index: 0;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
    position: relative;
  }

  .status-icon {
    font-size: var(--font-size-xl);
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--status-background);
    border-radius: var(--rounded-lg);
    color: var(--status-color);
  }

  .status-title {
    margin: 0;
    color: var(--color-text-primary);
    font-size: var(--font-size-lg);
  }

  .status-message {
    text-align: center;
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
    margin-bottom: var(--spacing-md);
  }

  /* Progress Bar Styles */
  .progress-container {
    margin-top: var(--spacing-lg);
  }

  .progress-track {
    width: 100%;
    height: 8px;
    background: var(--color-background-secondary);
    border-radius: var(--rounded-full);
    overflow: hidden;
    position: relative;
  }

  .progress-bar {
    height: 100%;
    background: var(--status-color);
    border-radius: var(--rounded-full);
    transition: width var(--transition-duration-normal) var(--transition-timing-ease);
    position: relative;
  }

  .progress-glow {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: glow 2s infinite linear;
    transform: skewX(-20deg);
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--spacing-xs);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .progress-percentage {
    font-weight: var(--font-weight-medium);
    color: var(--status-color);
  }

  .current-file {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Error Styles */
  .error-container {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--color-error-light);
    border-radius: var(--rounded-lg);
    margin-top: var(--spacing-lg);
  }

  .error-content {
    flex: 1;
  }

  .error-title {
    font-weight: var(--font-weight-medium);
    color: var(--color-error);
    margin-bottom: var(--spacing-2xs);
  }

  .error-message {
    color: var(--color-error);
    font-size: var(--font-size-sm);
  }

  /* Success Styles */
  .success-container {
    text-align: center;
    margin-top: var(--spacing-lg);
  }

  .success-icon {
    font-size: var(--font-size-2xl);
    margin-bottom: var(--spacing-sm);
  }

  .success-message {
    color: var(--color-success);
    font-weight: var(--font-weight-medium);
  }

  /* Animations */
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes glow {
    from { transform: translateX(-100%) skewX(-20deg); }
    to { transform: translateX(200%) skewX(-20deg); }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .spin {
    animation: spin 2s linear infinite;
  }

  .animate-bounce {
    animation: bounce 2s infinite;
  }

  /* Responsive Design */
  @media (max-width: 640px) {
    .status-card {
      padding: var(--spacing-md);
    }

    .progress-info {
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .current-file {
      text-align: center;
    }
  }
</style>