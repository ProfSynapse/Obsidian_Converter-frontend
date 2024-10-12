<!-- src/routes/+page.svelte -->
<script>
  import ApiKeyInput from '$lib/components/ApiKeyInput.svelte';
  import FileUploader from '$lib/components/FileUploader/FileUploader.svelte';
  import ConversionStatus from '$lib/components/ConversionStatus.svelte';
  import ResultDisplay from '$lib/components/ResultDisplay.svelte';
  import Button from '@smui/button';
  import { apiKey } from '$lib/stores/apiKey';
  import { files } from '$lib/stores/files';
  import { conversionStatus } from '$lib/stores/conversionStatus';
  import { convertFiles, downloadZip, downloadSingleFile } from '$lib/utils/api/client.js';

  let isConverting = false;
  let isDownloading = false;

  // Reactive statement to get the current conversion status
  $: status = $conversionStatus.status;

  async function handleStartConversion() {
    if (!$apiKey) {
      alert('Please enter your API key first.');
      return;
    }

    if ($files.length === 0) {
      alert('Please add files to convert.');
      return;
    }

    isConverting = true;
    conversionStatus.setStatus('converting'); // Set status to 'converting'
    conversionStatus.setProgress(0); // Initialize progress
    console.log('Starting file conversion'); // Log conversion start

    try {
      await convertFiles($files, $apiKey, (progress) => {
        conversionStatus.setProgress(progress);
      });
      console.log('File conversion completed'); // Log successful conversion
      conversionStatus.setStatus('completed'); // Set status to 'completed'
    } catch (error) {
      console.error('Conversion failed:', error); // Log conversion error
      conversionStatus.setError(error.message || String(error));
    } finally {
      isConverting = false;
    }
  }

  function handleFilesAdded(event) {
    console.log('Files added event:', event); // Log files added event
    // Additional handling if needed
  }

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

<!-- Main Content -->
<ApiKeyInput />
<FileUploader on:filesAdded={handleFilesAdded} />

{#if status === 'converting'}
  <ConversionStatus />
{/if}

{#if $conversionStatus.status === 'completed'}
  <ResultDisplay on:downloadFile={handleSingleFileDownload} />
  <!-- Download Actions -->
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
{#if $files.length > 0}
  <div class="conversion-actions">
    <button
      class="convert-button"
      on:click={handleStartConversion}
      disabled={isConverting || !$apiKey}
    >
      {isConverting ? 'Converting...' : 'Start Conversion'}
    </button>
  </div>
{/if}

<style>
  .conversion-actions {
    display: flex;
    justify-content: center;
    margin-top: 30px;
  }

  .convert-button {
    font-size: 1.5rem;
    padding: 20px 40px;
    background: var(--gradient-button); /* Gradient background */
    color: white;
    border: none;
    border-radius: var(--rounded-corners);
    cursor: pointer;
    transition: background-color var(--transition-speed), box-shadow var(--transition-speed);
    font-weight: 600;
  }

  .convert-button:hover {
    background-color: var(--color-second);
    box-shadow: 0 0 10px var(--color-second);
  }

  .convert-button:disabled {
    background-color: #cccccc;
    color: #666666;
    cursor: not-allowed;
    box-shadow: none;
  }

  .download-actions {
    display: flex;
    justify-content: center;
    margin-top: 30px;
  }

  /* Adjusted global styles for buttons */
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
