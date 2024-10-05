<script lang="ts">
  import { onMount } from 'svelte';
  import FileUploader from '$components/FileUploader/FileUploader.svelte';
  import ConversionStatus from '$components/ConversionStatus.svelte';
  import ResultDisplay from '$components/ResultDisplay.svelte';
  import Button from '@smui/button';
import TextField from '@smui/textfield';
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
    apiKey.set(apiKeyInput);
    localStorage.setItem('apiKey', apiKeyInput);
  }

  function handleClearApiKey() {
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
    try {
      await convertFiles($files, $apiKey);
    } catch (error) {
      console.error('Conversion failed:', error instanceof Error ? error.message : String(error));
      conversionStatus.setError(error instanceof Error ? error.message : String(error));
    } finally {
      isConverting = false;
    }
  }

  function handleFilesAdded(event: CustomEvent) {
    console.log('Files added:', event.detail);
  }

  async function handleDownloadAll() {
    if ($files.length === 0) {
      alert('No files to download.');
      return;
    }

    isDownloading = true;
    try {
      const fileIds = $files.map(file => file.id);
      await downloadZip(fileIds, $apiKey);
    } catch (error) {
      console.error('Error downloading zip file:', error instanceof Error ? error.message : String(error));
      alert('Failed to download files. Please try again.');
    } finally {
      isDownloading = false;
    }
  }

  async function handleSingleFileDownload(event: CustomEvent<{fileId: string}>) {
    const fileId = event.detail.fileId;
    try {
      await downloadSingleFile(fileId, $apiKey);
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
      <TextField
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

<style lang="scss">
  .obsidian-note-converter {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  h1, h2 {
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

  .conversion-actions, .download-actions {
    display: flex;
    justify-content: center;
    margin-top: 30px;
  }

  :global(.mdc-button) {
    background-color: var(--color-prime);
    color: white;

    &:hover {
      background-color: var(--color-second);
    }

    &:disabled {
      background-color: #cccccc;
      color: #666666;
    }
  }
</style>