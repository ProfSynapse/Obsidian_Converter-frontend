<script>
  import { onMount } from 'svelte';
  import ApiKeyInput from '$lib/components/ApiKeyInput.svelte';
  import FileUploader from '$lib/components/FileUploader/FileUploader.svelte';
  import ConversionStatus from '$lib/components/ConversionStatus.svelte';
  import ConversionClient, { ConversionError } from '$lib/utils/api/client.js';
  import { apiKey } from '$lib/stores/apiKey';
  import { files } from '$lib/stores/files';
  import { conversionStatus } from '$lib/stores/conversionStatus';

  // Reactive state
  let isConverting = false;
  let error = null;

  // Computed values
  $: status = $conversionStatus.status;
  $: canStartConversion = $apiKey && $files.length > 0 && !isConverting;
  $: hasFiles = $files.length > 0;

  /**
   * Shows an error message to the user
   * @param {string} message - The error message to display
   * @param {boolean} isAlert - Whether to show as alert
   */
  function showError(message, isAlert = true) {
    error = message;
    if (isAlert) {
      alert(message);
    }
    console.error('❌ Error:', message);
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
   * Handles the start of conversion process
   */
  async function handleStartConversion() {
    if (!canStartConversion) return;

    if (!$apiKey) {
      showError('Please enter your API key first.');
      return;
    }

    if ($files.length === 0) {
      showError('Please add files to convert.');
      return;
    }

    isConverting = true;
    error = null;
    conversionStatus.reset();
    conversionStatus.setStatus('converting');

    console.log('🚀 Starting conversion with files:', $files);

    try {
      await ConversionClient.convertFiles($files, $apiKey, updateProgress);
      console.log('✅ Conversion completed successfully');
      
    } catch (err) {
      console.error('Conversion error:', err);
      console.error('Error stack:', err.stack);
      
      const errorMessage = err instanceof ConversionError 
        ? err.message 
        : 'An unexpected error occurred during conversion';
      
      conversionStatus.setError(errorMessage);
      showError(errorMessage);
      
    } finally {
      isConverting = false;
    }
  }

  /**
   * Handles files being added via the FileUploader
   * @param {CustomEvent} event - The filesAdded event
   */
  function handleFilesAdded(event) {
    const addedFiles = event.detail.addedFiles || event.detail.files || [];
    
    console.log('📂 Processing files:', addedFiles);
    
    if (addedFiles.length === 0) return;
    
    // Reset any previous conversion status
    conversionStatus.reset();
    error = null;
    
    // Add files to store
    files.addFiles(addedFiles);
    console.log('📂 Files added to store:', addedFiles);
  }

  /**
   * Clears all files and resets state
   */
  function handleClearFiles() {
    files.clearFiles();
    conversionStatus.reset();
    error = null;
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
    <!-- API Key Input -->
    <section class="section" transition:fade>
      <ApiKeyInput />
    </section>

    <!-- File Upload -->
    <section class="section" transition:fade>
      <FileUploader 
        on:filesAdded={handleFilesAdded}
      />
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
                {isConverting ? 'Converting Files...' : 'Convert & Download ZIP'}
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

  <footer class="footer text-center text-muted" transition:fade>
    <p>
      Files will be converted to Markdown and downloaded as a ZIP file ready for 
      importing into Obsidian.
    </p>
  </footer>
</div>

<style>
  .container {
    max-width: var(--content-width-lg);
    margin: 0 auto;
    padding: var(--spacing-xl) var(--spacing-lg);
  }

  .main-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
  }

  .section {
    width: 100%;
  }

  .actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
  }

  .button-group {
    display: flex;
    gap: var(--spacing-md);
    width: 100%;
    justify-content: center;
  }

  .convert-button {
    min-width: 200px;
  }

  .button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-error-light);
    color: var(--color-error);
    border-radius: var(--rounded-md);
    font-size: var(--font-size-sm);
  }

  .footer {
    margin-top: var(--spacing-2xl);
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .container {
      padding: var(--spacing-lg) var(--spacing-md);
    }

    .button-group {
      flex-direction: column;
    }

    .convert-button,
    .clear-button {
      width: 100%;
      min-width: unset;
    }
  }

  @media (max-width: 640px) {
    .container {
      padding: var(--spacing-md);
    }

    .main-content {
      gap: var(--spacing-lg);
    }

    .footer {
      margin-top: var(--spacing-xl);
    }
  }
</style>