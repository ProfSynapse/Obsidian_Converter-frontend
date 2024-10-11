<!-- src/routes/+page.svelte -->
<script>
  // Import necessary modules and components
  import { onMount } from 'svelte';
  import FileUploader from '$lib/components/FileUploader/FileUploader.svelte';
  import ConversionStatus from '$lib/components/ConversionStatus.svelte';
  import ResultDisplay from '$lib/components/ResultDisplay.svelte';
  import TextField from '@smui/textfield';
  import Button from '@smui/button';
  import { apiKey } from '$lib/stores/apiKey';
  import { files } from '$lib/stores/files';
  import { conversionStatus } from '$lib/stores/conversionStatus';
  import { convertFiles, downloadZip, downloadSingleFile } from '$lib/utils/api/client.js';

  // Initialize reactive variables
  let apiKeyInput = '';
  let isConverting = false;
  let isDownloading = false;

  // Set API key from local storage if available on mount
  onMount(() => {
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiKey) {
      apiKey.set(storedApiKey);
      apiKeyInput = storedApiKey;
    }
  });

  /**
   * Sets the API key and stores it in local storage
   */
  function handleSetApiKey() {
    console.log('Setting API key'); // Log API key setting action
    apiKey.set(apiKeyInput);
    localStorage.setItem('apiKey', apiKeyInput);
  }

  /**
   * Clears the API key and removes it from local storage
   */
  function handleClearApiKey() {
    console.log('Clearing API key'); // Log API key clearing action
    apiKey.set('');
    apiKeyInput = '';
    localStorage.removeItem('apiKey');
  }

  /**
   * Starts the conversion process for the selected files
   */
  async function handleStartConversion() {
    if (!$apiKey) {
      alert('Please set your API key first.');
      return;
    }

    if ($files.length === 0) {
      alert('Please add files to convert.');
      return;
    }

    isConverting = true;
    console.log('Starting file conversion'); // Log conversion start
    try {
      await convertFiles($files, $apiKey);
      console.log('File conversion completed'); // Log successful conversion
    } catch (error) {
      console.error('Conversion failed:', error); // Log conversion error
      conversionStatus.setError(error.message || String(error));
    } finally {
      isConverting = false;
    }
  }

  /**
   * Handles files being added to the uploader
   * @param {CustomEvent} event - The custom event containing details of added files
   */
  function handleFilesAdded(event) {
    console.log('Files added event:', event); // Log files added event
    // Access event.detail if it exists
    if (event.detail) {
      console.log('Files added:', event.detail); // Log added files details
    }
  }

  /**
   * Downloads all converted files as a zip
   */
  async function handleDownloadAll() {
    if ($files.length === 0) {
      alert('No files to download.');
      return;
    }

    isDownloading = true;
    console.log('Starting download of all files as zip'); // Log download action
    try {
      const fileIds = $files.map((file) => file.id);
      await downloadZip(fileIds, $apiKey);
      console.log('Download completed'); // Log successful download
    } catch (error) {
      console.error('Error downloading zip file:', error); // Log download error
      alert('Failed to download files. Please try again.');
    } finally {
      isDownloading = false;
    }
  }

  /**
   * Downloads a single converted file
   * @param {CustomEvent} event - The custom event containing the file ID to be downloaded
   */
  async function handleSingleFileDownload(event) {
    const fileId = event.detail.fileId;
    console.log(`Starting download for file ID: ${fileId}`); // Log download start
    try {
      await downloadSingleFile(fileId, $apiKey);
      console.log(`Download completed for file ID: ${fileId}`); // Log successful download
    } catch (error) {
      console.error('Error downloading file:', error); // Log download error
      alert('Failed to download file. Please try again.');
    }
  }
</script>

<main class="obsidian-note-converter">
  <h1>Obsidian Note Converter</h1>

  <!-- API Key Section -->
  <section class="api-key-section container">
    <h2>API Key</h2>
    <div class="api-key-input">
      <TextField
        bind:value={apiKeyInput}
        label="Enter your API key"
        type="password"
        style="width: 100%;"
      />
    </div>
    <div class="api-key-actions">
      <Button on:click={handleSetApiKey} disabled={!apiKeyInput}>
        Set API Key
      </Button>
      <Button on:click={handleClearApiKey} disabled={!$apiKey}>
        Clear API Key
      </Button>
    </div>
  </section>

  <!-- File Uploader Component -->
  <FileUploader on:filesAdded={handleFilesAdded} />

  <!-- Conversion Status Component -->
  <ConversionStatus />

  <!-- Result Display and Download Actions -->
  {#if $conversionStatus.status === 'completed'}
    <ResultDisplay on:downloadFile={handleSingleFileDownload} />
    <div class="download-actions">
      <Button
        on:click={handleDownloadAll}
        disabled={isDownloading || $files.length === 0}
        variant="raised"
      >
        {isDownloading ? 'Downloading...' : 'Download All as Zip'}
      </Button>
    </div>
  {/if}

  <!-- Conversion Actions -->
  <div class="conversion-actions">
    <Button
      on:click={handleStartConversion}
      disabled={isConverting || $files.length === 0 || !$apiKey}
      variant="raised"
    >
      {isConverting ? 'Converting...' : 'Start Conversion'}
    </Button>
  </div>
</main>

<style>
  .obsidian-note-converter {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  h1,
  h2 {
    color: var(--color-prime);
    margin-bottom: 15px;
  }

  .api-key-section {
    margin-bottom: 30px;
  }

  .api-key-input {
    margin-bottom: 15px;
  }

  .api-key-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .conversion-actions,
  .download-actions {
    display: flex;
    justify-content: center;
    margin-top: 30px;
  }

  /* Adjusted global styles */
  :global(.mdc-button) {
    background-color: var(--color-prime);
    color: white;
  }

  :global(.mdc-button:hover) {
    background-color: var(--color-second);
  }

  :global(.mdc-button:disabled) {
    background-color: #cccccc;
    color: #666666;
  }
</style>
