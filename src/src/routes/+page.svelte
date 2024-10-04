<!-- src/routes/+page.svelte -->
<script>
    import { onMount } from 'svelte';
    import FileUploader from '$lib/components/FileUploader/FileUploader.svelte';
    import ConversionStatus from '$lib/components/ConversionStatus.svelte';
    import ResultDisplay from '$lib/components/ResultDisplay.svelte';
    import { TextField } from '@smui/textfield';
    import { Button } from '@smui/button';
    import { apiKey, files, conversionStatus } from '$lib/stores';
    import { convertFiles, downloadZip, downloadSingleFile } from '$lib/utils/api/client.js';
    import { validateApiKey, validateFile } from '$lib/utils/validators.js';
    import { COLORS, ERROR_MESSAGES } from '$lib/constants.js';
  
    let apiKeyInput = '';
    let isConverting = false;
    let isDownloading = false;
    let errorMessage = '';
  
    onMount(() => {
      apiKeyInput = $apiKey || '';
    });
  
    function handleSetApiKey() {
      try {
        validateApiKey(apiKeyInput);
        apiKey.set(apiKeyInput);
        localStorage.setItem('obsdian_note_converter_api_key', apiKeyInput);
        errorMessage = '';
      } catch (error) {
        errorMessage = error.message;
      }
    }
  
    function handleClearApiKey() {
      apiKey.set('');
      apiKeyInput = '';
      localStorage.removeItem('obsdian_note_converter_api_key');
    }
  
    async function handleStartConversion() {
      if (!$apiKey) {
        errorMessage = ERROR_MESSAGES.API_KEY_REQUIRED;
        return;
      }
  
      if ($files.length === 0) {
        errorMessage = ERROR_MESSAGES.NO_FILES_FOR_CONVERSION;
        return;
      }
  
      isConverting = true;
      errorMessage = '';
      try {
        await convertFiles($files, $apiKey);
      } catch (error) {
        console.error('Conversion failed:', error);
        errorMessage = error.message;
      } finally {
        isConverting = false;
      }
    }
  
    function handleFilesAdded(event) {
      const newFiles = event.detail;
      newFiles.forEach(file => {
        try {
          validateFile(file);
          files.update(currentFiles => [...currentFiles, file]);
        } catch (error) {
          errorMessage = error.message;
        }
      });
    }
  
    async function handleDownloadAll() {
      if ($files.length === 0) {
        errorMessage = ERROR_MESSAGES.NO_FILES_FOR_CONVERSION;
        return;
      }
  
      isDownloading = true;
      errorMessage = '';
      try {
        const fileIds = $files.map(file => file.id);
        await downloadZip(fileIds, $apiKey);
      } catch (error) {
        console.error('Error downloading zip file:', error);
        errorMessage = 'Failed to download files. Please try again.';
      } finally {
        isDownloading = false;
      }
    }
  
    async function handleSingleFileDownload(event) {
      const fileId = event.detail.fileId;
      try {
        await downloadSingleFile(fileId, $apiKey);
      } catch (error) {
        console.error('Error downloading file:', error);
        errorMessage = 'Failed to download file. Please try again.';
      }
    }
  </script>
  
  <svelte:head>
    <title>Obsidian Note Converter</title>
  </svelte:head>
  
  <main class="obsidian-note-converter">
    <section class="api-key-section">
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
  
    {#if errorMessage}
      <div class="error-message">
        {errorMessage}
      </div>
    {/if}
  </main>
  
  <style>
    .obsidian-note-converter {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
  
    h2 {
      color: var(--color-second);
      margin-bottom: 1rem;
    }
  
    .api-key-section, .conversion-actions, .download-actions {
      background-color: white;
      padding: 1.5rem;
      border-radius: var(--rounded-corners);
      box-shadow: var(--box-shadow);
    }
  
    .api-key-input {
      margin-bottom: 1rem;
    }
  
    .api-key-actions, .conversion-actions, .download-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }
  
    .error-message {
      background-color: var(--color-error);
      color: white;
      padding: 1rem;
      border-radius: var(--rounded-corners);
      text-align: center;
      margin-top: 1rem;
    }
  
    @media (max-width: 768px) {
      .api-key-actions, .conversion-actions, .download-actions {
        flex-direction: column;
      }
    }
  </style>