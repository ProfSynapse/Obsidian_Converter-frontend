<!-- src/lib/components/ConversionStatus.svelte -->
<script>
  import { conversionStatus } from '$lib/stores/conversionStatus.js';
  import { files } from '$lib/stores/files.js';
  import { apiKey } from '$lib/stores/apiKey.js';
  import { ENDPOINTS } from '$lib/utils/api/endpoints.js';
  import { onDestroy } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import Container from './common/Container.svelte';

  let status = 'idle';
  let progress = 0;
  let error = null;

  // Subscribe to stores
  const unsubscribe = conversionStatus.subscribe(value => {
    status = value.status;
    progress = value.progress;
    error = value.error;
  });

  // Compute if conversion can start and if API key is required
  $: hasMediaFiles = $files.some(file => 
    ['mp3', 'wav', 'ogg', 'mp4', 'mov', 'avi', 'webm'].includes(file.type)
  );
  $: apiKeyRequired = hasMediaFiles && !$apiKey;
  $: canStartConversion = $files.length > 0 && status !== 'converting' && !apiKeyRequired;

  onDestroy(() => {
    unsubscribe();
  });

  /**
   * Extracts YouTube video ID from URL
   */
  function extractYoutubeId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^\s&]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Prepares files for batch conversion
   */
  async function prepareBatchItems() {
    return await Promise.all($files.map(async file => {
      try {
        if (file.file) {
          // Handle uploaded files
          const base64Content = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file.file);
          });

          return {
            type: 'file',
            name: file.name,
            content: base64Content,
            fileType: file.type
          };
        } else if (file.type === 'youtube') {
          // Handle YouTube URLs - no API key needed
          const videoId = extractYoutubeId(file.url);
          if (!videoId) {
            throw new Error('Invalid YouTube URL');
          }

          return {
            type: 'youtube',
            name: videoId,
            content: file.url,
            fileType: 'youtube'
          };
        } else {
          // Handle other URLs
          return {
            type: file.type,
            name: file.name,
            content: file.url,
            fileType: file.type
          };
        }
      } catch (error) {
        console.error(`Error preparing item ${file.name}:`, error);
        throw error;
      }
    }));
  }

  /**
   * Handles starting the conversion process
   */
  async function handleStartConversion() {
    if (!canStartConversion) return;

    try {
      conversionStatus.setStatus('converting');
      conversionStatus.setProgress(0);

      const items = await prepareBatchItems();
      
      // Prepare headers
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add API key only if we have media files (not for YouTube)
      if (hasMediaFiles && $apiKey) {
        headers['X-API-Key'] = $apiKey;
      }

      // Make the conversion request
      const response = await fetch(ENDPOINTS.CONVERT_BATCH, {
        method: 'POST',
        headers,
        body: JSON.stringify({ items })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || response.statusText);
      }

      // Handle the ZIP file response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted_files_${new Date().toISOString().slice(0,10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      conversionStatus.setStatus('completed');
      conversionStatus.setProgress(100);
    } catch (error) {
      console.error('Conversion error:', error);
      conversionStatus.setError(error.message);
      conversionStatus.setStatus('error');
    }
  }
</script>

<Container className="conversion-container">
  <div class="conversion-controls">
    <!-- Status Display -->
    {#if status === 'converting'}
      <div class="status-info" in:fade>
        <span class="icon">🔄</span>
        <span>Converting... {progress}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: {progress}%"></div>
      </div>
    {:else if status === 'completed'}
      <div class="status-info completed" in:fade>
        <span class="icon">✅</span>
        <span>Conversion Completed Successfully!</span>
      </div>
    {:else if status === 'error'}
      <div class="status-info error" role="alert" in:fade>
        <span class="icon">⚠️</span>
        <span>Error: {error}</span>
      </div>
    {:else if status === 'stopped'}
      <div class="status-info stopped" in:fade>
        <span class="icon">🛑</span>
        <span>Conversion Stopped.</span>
      </div>
    {/if}

    <!-- API Key Warning (only for media files) -->
    {#if apiKeyRequired}
      <div class="api-key-warning" role="alert" in:slide>
        <span class="icon">⚠️</span>
        <span>API key required for audio/video file conversion</span>
      </div>
    {/if}

    <!-- Conversion Button -->
    <div class="button-wrapper">
      <button
        class="convert-button"
        class:loading={status === 'converting'}
        disabled={!canStartConversion}
        on:click={handleStartConversion}
      >
        <span class="button-content">
          {#if status === 'converting'}
            <span class="icon rotating">🕛</span>
            <span>Converting...</span>
          {:else}
            <span class="icon">🔄</span>
            <span>Start Conversion</span>
          {/if}
        </span>
      </button>
    </div>
  </div>
</Container>

<style>
  /* Ensure the container does not exceed parent widths */
  .conversion-container {
    /* No max-width here; Container handles it */
  }

  .conversion-controls {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: center; /* Center child elements horizontally */
    width: 100%; /* Ensure it takes full width of the Container */
  }

  /* Button Wrapper to control button width */
  .button-wrapper {
    width: 100%;
    max-width: 300px; /* Adjust as needed to match other containers */
    display: flex;
    justify-content: center;
  }

  .convert-button {
    width: 100%; /* Button takes full width of its wrapper */
    padding: var(--spacing-md) var(--spacing-lg);
    background: var(--gradient-primary);
    border: none;
    border-radius: var(--rounded-lg);
    color: var(--color-text-on-dark);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all var(--transition-duration-normal) var(--transition-timing-bounce);
    position: relative;
    overflow: hidden;
  }

  /* Loading state styles */
  .convert-button.loading .icon {
    animation: spin 1s linear infinite;
  }

  /* Keyframes for spin animation */
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Status Info Styles */
  .status-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
  }

  .status-info.completed { color: var(--color-success); }
  .status-info.error { color: var(--color-error); }
  .status-info.stopped { color: var(--color-warning); }

  /* Progress Bar Styles */
  .progress-bar {
    width: 100%;
    height: 8px;
    background: var(--color-background-secondary);
    border-radius: var(--rounded-full);
    overflow: hidden;
    margin-top: var(--spacing-xs);
  }

  .progress-fill {
    height: 100%;
    background: var(--color-prime);
    transition: width var(--transition-duration-normal) var(--transition-timing-ease);
  }

  /* API Key Warning Styles */
  .api-key-warning {
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-warning-light);
    color: var(--color-warning);
    border-radius: var(--rounded-md);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-sm);
    width: 100%;
    max-width: 300px; /* Align with button width */
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .button-wrapper {
      max-width: 100%; /* Allow button to take full width on smaller screens */
    }

    .convert-button {
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: var(--font-size-base);
    }

    .conversion-controls {
      gap: var(--spacing-md);
    }

    .api-key-warning {
      max-width: 100%;
    }
  }

  @media (max-width: 640px) {
    .convert-button {
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: var(--font-size-base);
    }
  }

  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    .convert-button {
      border: 2px solid var(--color-text-on-dark);
    }

    .api-key-warning {
      border: 2px solid var(--color-text-on-dark);
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .convert-button,
    .progress-fill {
      transition: none;
    }

    .convert-button:hover {
      transform: none;
    }

    .rotating {
      animation: none;
    }
  }
</style>
