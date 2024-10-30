<script>
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import ApiKeyInput from '$lib/components/ApiKeyInput.svelte';
  import FileUploader from '$lib/components/FileUploader/FileUploader.svelte';
  import ConversionStatus from '$lib/components/ConversionStatus.svelte';
  import ConversionClient, { ConversionError } from '$lib/utils/api/client.js';
  import { apiKey } from '$lib/stores/apiKey';
  import { files } from '$lib/stores/files';
  import { conversionStatus } from '$lib/stores/conversionStatus';

  // Media types that require API key
  const API_REQUIRED_TYPES = ['mp3', 'wav', 'ogg', 'mp4', 'mov', 'avi', 'webm'];

  // Reactive state
  let isConverting = false;
  let error = null;

  // Computed values
  $: status = $conversionStatus.status;
  $: hasMediaFiles = $files.some(file => API_REQUIRED_TYPES.includes(file.type));
  $: apiKeyRequired = hasMediaFiles;
  $: canStartConversion = (!apiKeyRequired || $apiKey) && $files.length > 0 && !isConverting;
  $: hasFiles = $files.length > 0;

  /**
   * Shows feedback to the user
   * @param {string} message - The message to display
   * @param {string} type - The type of message ('error' or 'success')
   * @param {boolean} showAlert - Whether to show an alert
   */
  function showFeedback(message, type = 'error', showAlert = false) {
    error = message;
    if (type === 'error') {
      console.error('❌ Error:', message);
      if (showAlert) alert(message);
    } else {
      console.log('✅ Success:', message);
    }
  }

  /**
   * Updates conversion progress
   * @param {number} progress - Progress percentage
   */
  function updateProgress(progress) {
    console.log('📊 Conversion progress:', progress);
    conversionStatus.setProgress(progress);
  }

  /**
   * Checks if a file requires an API key
   * @param {Object} file - The file to check
   * @returns {boolean} True if file requires API key
   */
  function requiresApiKey(file) {
    return API_REQUIRED_TYPES.includes(file.type);
  }

  /**
   * Validates conversion requirements
   * @throws {Error} If requirements not met
   */
  function validateConversion() {
    if ($files.length === 0) {
      throw new Error('Please add files to convert');
    }

    const mediaFiles = $files.filter(requiresApiKey);
    
    if (mediaFiles.length > 0 && !$apiKey) {
      throw new Error('API key required for audio/video file conversion');
    }
  }

  /**
   * Handles files being added via FileUploader
   * @param {CustomEvent} event - The filesAdded event
   */
  function handleFilesAdded(event) {
    const addedFiles = event.detail.files || [];
    console.log('📂 Processing files:', addedFiles);
    
    if (addedFiles.length === 0) return;
    
    // Reset status
    conversionStatus.reset();
    error = null;
    
    // Add each file individually
    addedFiles.forEach(file => {
      try {
        const result = files.addFile(file);
        if (!result.success) {
          showFeedback(result.message);
        }
      } catch (err) {
        console.error('Error adding file:', err);
        showFeedback(err.message);
      }
    });
    
    console.log('📂 Files processed:', addedFiles.length);
  }

  /**
   * Handles the conversion process
   */
  async function handleStartConversion() {
    if (!canStartConversion) return;

    try {
      validateConversion();

      isConverting = true;
      error = null;
      conversionStatus.reset();
      conversionStatus.setStatus('converting');

      console.log('🚀 Starting conversion with files:', $files);
      
      await ConversionClient.convertFiles(
        $files, 
        $apiKey, 
        updateProgress
      );
      
      console.log('✅ Conversion completed successfully');
      conversionStatus.setStatus('completed');
      showFeedback('Conversion completed successfully', 'success');
      
    } catch (err) {
      console.error('Conversion error:', err);
      
      const errorMessage = err instanceof ConversionError 
        ? err.message 
        : 'An unexpected error occurred during conversion';
      
      conversionStatus.setError(errorMessage);
      showFeedback(errorMessage);
      
    } finally {
      isConverting = false;
    }
  }

  /**
   * Clears all files and resets state
   */
  function handleClearFiles() {
    const result = files.clearFiles();
    if (result.success) {
      conversionStatus.reset();
      error = null;
    } else {
      showFeedback(result.message);
    }
  }

  // Cleanup on component unmount
  onMount(() => {
    return () => {
      conversionStatus.reset();
      error = null;
    };
  });
</script>

<div class="container animate-fade-in">
  <main class="main-content">
    <!-- Conditional API Key Input -->
    {#if hasMediaFiles}
      <section class="section" transition:fade>
        <ApiKeyInput />
      </section>
    {/if}

    <!-- File Upload -->
    <section class="section" transition:fade>
      <FileUploader on:filesAdded={handleFilesAdded} />
    </section>

    <!-- Conversion Status -->
    {#if status !== 'idle'}
      <section class="section" transition:slide>
        <ConversionStatus />
      </section>
    {/if}

    <!-- Action Buttons -->
    {#if hasFiles}
      <section class="flex-center actions" transition:fade>
        <div class="button-group">
          <button
            class="btn btn-primary convert-button"
            on:click={handleStartConversion}
            disabled={!canStartConversion}
          >
            <span class="button-content">
              <span class="icon">
                {#if isConverting}
                  ⚡
                {:else}
                  🔄
                {/if}
              </span>
              <span class="button-text">
                {#if isConverting}
                  Converting Files...
                {:else if !canStartConversion && apiKeyRequired && !$apiKey}
                  API Key Required
                {:else}
                  Convert & Download ZIP
                {/if}
              </span>
            </span>
          </button>

          <button
            class="btn btn-secondary clear-button"
            on:click={handleClearFiles}
            disabled={isConverting}
          >
            <span class="button-content">
              <span class="icon">🗑️</span>
              <span class="button-text">Clear Files</span>
            </span>
          </button>
        </div>

        {#if error}
          <div class="error-message" role="alert" transition:slide>
            <span class="icon">⚠️</span>
            <span>{error}</span>
          </div>
        {/if}
      </section>
    {/if}
  </main>
</div>

<style>
  /* Main Container */
  .container {
    width: 100%;
    max-width: var(--content-width-lg);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
  }

  /* Content Section */
  .main-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
    width: 100%;
    max-width: 100%;
  }

  /* Section Containers */
  .section {
    width: 100%;
    background: var(--color-surface);
    border-radius: var(--rounded-lg);
    overflow: hidden;
    transition: transform var(--transition-duration-normal) var(--transition-timing-ease);
  }

  .section:hover {
    transform: translateY(-2px);
  }

  /* Action Buttons */
  .actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    width: 100%;
    max-width: var(--content-width-md);
    margin: 0 auto;
  }

  .button-group {
    display: flex;
    gap: var(--spacing-md);
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .convert-button {
    min-width: 200px;
    position: relative;
    padding: var(--spacing-md) var(--spacing-xl);
    background: var(--gradient-primary);
    border: none;
    border-radius: var(--rounded-lg);
    color: var(--color-text-on-dark);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all var(--transition-duration-normal) var(--transition-timing-bounce);
    overflow: hidden;
  }

  .convert-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .convert-button:disabled {
    background: var(--color-disabled);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    opacity: 0.7;
  }

  .button-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
  }

  /* Error Message */
  .error-message {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-error-light);
    color: var(--color-error);
    border-radius: var(--rounded-md);
    font-size: var(--font-size-sm);
    width: 100%;
    max-width: var(--content-width-sm);
    margin: 0 auto;
    box-shadow: var(--shadow-sm);
  }

  /* Footer */
  .footer {
    margin-top: var(--spacing-2xl);
    text-align: center;
    color: var(--color-text-on-dark);
    font-size: var(--font-size-sm);
    padding: 0 var(--spacing-md);
  }

  .api-note {
    display: inline-block;
    margin-top: var(--spacing-xs);
    color: var(--color-text-on-dark);
    font-style: italic;
    opacity: 0.8;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .container {
      gap: var(--spacing-lg);
    }

    .button-group {
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .convert-button,
    .clear-button {
      width: 100%;
      min-width: unset;
      font-size: var(--font-size-base);
    }

    .error-message {
      margin: var(--spacing-xs) auto;
      flex-direction: column;
      text-align: center;
    }
  }

  @media (max-width: 640px) {
    .container {
      gap: var(--spacing-md);
    }

    .main-content {
      gap: var(--spacing-lg);
    }

    .section {
      border-radius: var(--rounded-md);
    }

    .footer {
      margin-top: var(--spacing-xl);
      font-size: var(--font-size-xs);
    }

    .api-note {
      margin-top: var(--spacing-2xs);
    }
  }

  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    .section {
      border: 2px solid var(--color-text-on-dark);
    }

    .convert-button {
      border: 2px solid currentColor;
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .section,
    .convert-button {
      transition: none;
    }

    .section:hover {
      transform: none;
    }
  }

  /* Print Styles */
  @media print {
    .container {
      padding: 0;
    }

    .section {
      break-inside: avoid;
      border: 1px solid #000;
    }

    .actions {
      display: none;
    }
  }
</style>