<!-- src/lib/components/ObsidianNoteConverter.svelte -->
<script>
  import { onMount } from 'svelte';
  import FileUploader from './FileUploader/FileUploader.svelte';
  import ConversionStatus from './ConversionStatus.svelte';
  import ResultDisplay from './ResultDisplay.svelte';
  import Textfield from '@smui/textfield';
  import Button from '@smui/button';
  import { apiKey } from '$lib/stores/apiKey.js';
  import { files } from '$lib/stores/files.js';
  import { conversionStatus } from '$lib/stores/conversionStatus.js';
  import { convertFiles, downloadZip, downloadSingleFile } from '$lib/utils/api/client.js';

  let apiKeyInput = '';
  let isConverting = false;
  let isDownloading = false;

  onMount(() => {
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiKey) {
      apiKey.set(storedApiKey);
      apiKeyInput = storedApiKey;
    }
  });

  function handleSetApiKey() {
    console.log('Setting API key');
    apiKey.set(apiKeyInput);
    localStorage.setItem('apiKey', apiKeyInput);
  }

  function handleClearApiKey() {
    console.log('Clearing API key');
    apiKey.set('');
    apiKeyInput = '';
    localStorage.removeItem('apiKey');
  }

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
    console.log('Starting file conversion');
    try {
      await convertFiles($files, $apiKey);
      console.log('File conversion completed');
    } catch (error) {
      console.error('Conversion failed:', error instanceof Error ? error.message : String(error));
      conversionStatus.setError(error instanceof Error ? error.message : String(error));
    } finally {
      isConverting = false;
    }
  }

  function handleFilesAdded(event) {
    console.log('Files added event:', event);
    if (event.detail) {
      console.log('Files added:', event.detail);
    }
  }

  async function handleDownloadAll() {
    if ($files.length === 0) {
      alert('No files to download.');
      return;
    }

    isDownloading = true;
    console.log('Starting download of all files as zip');
    try {
      const fileIds = $files.map(file => file.id);
      await downloadZip(fileIds, $apiKey);
      console.log('Download completed');
    } catch (error) {
      console.error('Error downloading zip file:', error instanceof Error ? error.message : String(error));
      alert('Failed to download files. Please try again.');
    } finally {
      isDownloading = false;
    }
  }

  async function handleSingleFileDownload(event) {
    const fileId = event.detail.fileId;
    console.log(`Starting download for file ID: ${fileId}`);
    try {
      await downloadSingleFile(fileId, $apiKey);
      console.log(`Download completed for file ID: ${fileId}`);
    } catch (error) {
      console.error('Error downloading file:', error instanceof Error ? error.message : String(error));
      alert('Failed to download file. Please try again.');
    }
  }
</script>

<main class="obsidian-note-converter">
  <h1>Obsidian Note Converter</h1>

  <section class="api-key-section container">
    <h2>API Key</h2>
    <div class="api-key-input">
      <Textfield
        bind:value={apiKeyInput}
        label="Enter your API key"
        type="password"
        style="width: 100%;"
      />
    </div>
    <div class="api-key-actions">
      <Button on:click={handleSetApiKey} disabled={!apiKeyInput}>Set API Key</Button>
      <Button on:click={handleClearApiKey} disabled={!$apiKey}>Clear API Key</Button>
    </div>
  </section>

  <FileUploader on:filesAdded={handleFilesAdded} />

  <ConversionStatus />

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
  /* Your existing styles */
</style>
