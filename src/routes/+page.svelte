<!-- src/routes/+page.svelte -->
<script>
  import ApiKeyInput from '$lib/components/ApiKeyInput.svelte';
  import FileUploader from '$lib/components/FileUploader/FileUploader.svelte';
  import ConversionStatus from '$lib/components/ConversionStatus.svelte';
  import Button from '@smui/button';
  import { apiKey } from '$lib/stores/apiKey';
  import { files } from '$lib/stores/files';
  import { conversionStatus } from '$lib/stores/conversionStatus';
  import { convertFiles, ConversionError } from '$lib/utils/api/client.js';

  let isConverting = false;

  // Reactive statement to get the current conversion status
  $: status = $conversionStatus.status;

  /**
   * Handles conversion of selected files and creation of ZIP
   */
   async function handleStartConversion() {
  if (!$apiKey) {
    alert('Please enter your API key first.');
    return;
  }

  const currentFiles = $files;
  console.log('🚀 Starting conversion with files:', currentFiles);

  if (currentFiles.length === 0) {
    alert('Please add files to convert.');
    return;
  }

  isConverting = true;
  conversionStatus.setStatus('converting');
  conversionStatus.setProgress(0);

  try {
    await convertFiles(currentFiles, $apiKey, (progress) => {
      console.log('📊 Conversion progress:', progress);
      conversionStatus.setProgress(progress);
    });

    console.log('✅ Conversion completed successfully');
    
  } catch (error) {
    console.error('❌ Conversion failed:', error);
    console.error('Error stack:', error.stack);
    conversionStatus.setError(
      error instanceof ConversionError 
        ? error.message 
        : 'Failed to convert files'
    );
    
    alert(error instanceof ConversionError 
      ? error.message 
      : 'An unexpected error occurred during conversion');
      
  } finally {
    isConverting = false;
  }
}

  /**
   * Handles files being added via the FileUploader
   * @param {CustomEvent} event - The filesAdded event
   */
   function handleFilesAdded(event) {
  console.log('Received filesAdded event:', event.detail);

  const addedItems = event.detail.files.map(item => {
    console.log('Processing item:', item);
    
    // Item should already be properly formatted, just ensure it has an ID
    return {
      ...item,
      id: item.id || crypto.randomUUID()
    };
  });

  // Reset status when new files are added
  conversionStatus.reset();
  
  // Add files to store
  files.addFiles(addedFiles);
  
  console.log('Files added to store:', addedFiles);
}

  /**
   * Clears all files and resets status
   */
  function handleClearFiles() {
    files.clearFiles();
    conversionStatus.reset();
  }
</script>

<div class="container">
  <main class="main-content">
    <!-- API Key Input -->
    <section class="section">
      <ApiKeyInput />
    </section>

    <!-- File Upload -->
    <section class="section">
      <FileUploader 
        on:filesAdded={handleFilesAdded}
      />
    </section>

    <!-- Conversion Status -->
    {#if status !== 'idle'}
      <section class="section">
        <ConversionStatus />
      </section>
    {/if}

    <!-- Action Buttons -->
    {#if $files.length > 0}
      <section class="flex-center actions">
        <div class="button-group">
          <button
            class="btn btn-primary convert-button"
            on:click={handleStartConversion}
            disabled={isConverting || !$apiKey}
          >
            {#if isConverting}
              Converting Files...
            {:else}
              Convert & Download ZIP
            {/if}
          </button>

          <button
            class="btn btn-secondary"
            on:click={handleClearFiles}
            disabled={isConverting}
          >
            Clear Files
          </button>
        </div>

        {#if status === 'error'}
          <p class="error">
            Conversion failed. Please try again or check the console for details.
          </p>
        {/if}
      </section>
    {/if}
  </main>

  <footer class="footer text-center text-muted">
    <p>
      Files will be converted to Markdown and downloaded as a ZIP file ready for 
      importing into Obsidian.
    </p>
  </footer>
</div>

<style>
  /* Only keeping styles that are specific to this component */
  .actions {
    gap: var(--spacing-md);
  }

  .convert-button {
    min-width: 200px;
  }

  .header {
    margin-bottom: var(--spacing-lg);
  }

  .footer {
    margin-top: var(--spacing-xl);
  }

  /* Component-specific responsive adjustments */
  @media (max-width: 600px) {
    .convert-button {
      min-width: 100%;
    }
  }
</style>