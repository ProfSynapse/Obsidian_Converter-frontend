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

    if ($files.length === 0) {
      alert('Please add files to convert.');
      return;
    }

    console.log('Starting conversion of files:', $files);

    isConverting = true;
    conversionStatus.setStatus('converting'); 
    conversionStatus.setProgress(0);

    try {
      await convertFiles($files, $apiKey, (progress) => {
        conversionStatus.setProgress(progress);
      });

      console.log('Conversion and ZIP creation completed');
      
    } catch (error) {
      console.error('Conversion failed:', error);
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
    const addedFiles = event.detail.files.map(fileObj => ({
      id: crypto.randomUUID(), // Generate unique ID
      name: fileObj.file.name,
      type: fileObj.file.name.split('.').pop().toLowerCase(),
      status: 'pending',
      file: fileObj.file
    }));

    // Reset status when new files are added
    conversionStatus.reset();
    
    // Add files to store
    files.addFiles(addedFiles);
    
    console.log('Files added:', addedFiles);
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
  <header class="header">
    <h1>Obsidian Note Converter</h1>
    <p>Convert your files to Obsidian-compatible Markdown</p>
  </header>

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
      <section class="actions">
        <div class="button-group">
          <button
            class="convert-button"
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
            class="clear-button"
            on:click={handleClearFiles}
            disabled={isConverting}
          >
            Clear Files
          </button>
        </div>

        {#if status === 'error'}
          <p class="error-message">
            Conversion failed. Please try again or check the console for details.
          </p>
        {/if}
      </section>
    {/if}
  </main>

  <footer class="footer">
    <p>
      Files will be converted to Markdown and downloaded as a ZIP file ready for 
      importing into Obsidian.
    </p>
  </footer>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  h1 {
    color: var(--color-prime);
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .section {
    margin-bottom: 2rem;
  }

  .actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .button-group {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .convert-button {
    font-size: 1.2rem;
    padding: 1rem 2rem;
    background: var(--gradient-button);
    color: white;
    border: none;
    border-radius: var(--rounded-corners);
    cursor: pointer;
    transition: all var(--transition-speed);
    font-weight: 600;
    min-width: 200px;
  }

  .convert-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .convert-button:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .clear-button {
    padding: 1rem 2rem;
    background: transparent;
    color: var(--color-prime);
    border: 2px solid var(--color-prime);
    border-radius: var(--rounded-corners);
    cursor: pointer;
    transition: all var(--transition-speed);
    font-weight: 500;
  }

  .clear-button:hover:not(:disabled) {
    background: var(--color-prime);
    color: white;
  }

  .clear-button:disabled {
    border-color: #cccccc;
    color: #cccccc;
    cursor: not-allowed;
  }

  .error-message {
    color: var(--color-error);
    text-align: center;
    margin-top: 1rem;
  }

  .footer {
    margin-top: 3rem;
    text-align: center;
    color: var(--color-text);
    opacity: 0.8;
    font-size: 0.9rem;
  }

  /* Responsive adjustments */
  @media (max-width: 600px) {
    .container {
      padding: 1rem;
    }

    .button-group {
      flex-direction: column;
      width: 100%;
    }

    .convert-button,
    .clear-button {
      width: 100%;
    }
  }
</style>