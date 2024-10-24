<!-- src/lib/components/ObsidianNoteConverter.svelte -->
<script>
  import { onMount } from 'svelte';
  import FileUploader from './FileUploader/FileUploader.svelte';
  import ConversionStatus from './ConversionStatus.svelte';
  import ResultDisplay from './ResultDisplay.svelte';
  import { apiKey } from '$lib/stores/apiKey.js';
  import { files } from '$lib/stores/files.js';
  import { conversionStatus } from '$lib/stores/conversionStatus.js';

  let isConverting = false;
  let currentFile = null;

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
    conversionStatus.setStatus('converting');
    conversionStatus.setProgress(0);
    
    try {
      const file = $files[0];  // Get the first file
      const formData = new FormData();
      formData.append('file', file.file);
      
      const fileType = file.name.split('.').pop().toLowerCase();
      formData.append('fileType', fileType);

      // Update status to show we're processing
      conversionStatus.setCurrentFile(file.name);
      
      const response = await fetch('http://localhost:3000/api/v1/convert/file', {
        method: 'POST',
        headers: {
          'X-API-Key': $apiKey,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Conversion failed');
      }

      // Update file status with conversion result
      files.updateFile(file.id, {
        status: 'completed',
        convertedContent: result.content,
        images: result.images || [],
        fileId: result.fileId
      });

      // Show completion status
      conversionStatus.setStatus('completed');
      conversionStatus.setProgress(100);
      
      // Log success
      console.log('Conversion completed:', {
        fileId: file.id,
        status: 'completed',
        hasImages: result.images?.length > 0
      });

    } catch (error) {
      console.error('Conversion error:', error);
      files.updateFile($files[0].id, { status: 'error' });
      conversionStatus.setError(error.message);
    } finally {
      isConverting = false;
    }
  }

  async function handleDownload(fileId) {
    try {
      const file = $files.find(f => f.id === fileId);
      if (!file) throw new Error('File not found');

      // Create a ZIP containing the markdown and images
      const zip = new JSZip();
      
      // Add the markdown content
      zip.file(`${file.name}.md`, file.convertedContent);
      
      // Add images if they exist
      if (file.images && file.images.length > 0) {
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        const imagesFolder = zip.folder(`attachments/${baseName}`);
        
        file.images.forEach(image => {
          const imageData = atob(image.data);
          const arrayBuffer = new ArrayBuffer(imageData.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          
          for (let i = 0; i < imageData.length; i++) {
            uint8Array[i] = imageData.charCodeAt(i);
          }
          
          imagesFolder.file(image.name, uint8Array, { binary: true });
        });
      }

      // Generate and download the ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${file.name}-converted.zip`);

    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  }
</script>

<main class="obsidian-note-converter">
  <h1>Obsidian Note Converter</h1>

  <FileUploader on:filesAdded />

  <ConversionStatus />

  {#if $conversionStatus.status === 'completed'}
    <ResultDisplay 
      files={$files} 
      on:download={e => handleDownload(e.detail.fileId)} 
    />
  {/if}

  <div class="conversion-actions">
    <button
      class="convert-button"
      on:click={handleStartConversion}
      disabled={isConverting || $files.length === 0 || !$apiKey}
    >
      {#if isConverting}
        Converting...
      {:else}
        Start Conversion
      {/if}
    </button>
  </div>
</main>

<style>
  .obsidian-note-converter {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  .conversion-actions {
    margin-top: 2rem;
    text-align: center;
  }

  .convert-button {
    background: var(--color-prime);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: var(--rounded-corners);
    cursor: pointer;
    font-size: 1.2rem;
    transition: all var(--transition-speed);
  }

  .convert-button:hover:not(:disabled) {
    background: var(--color-second);
    transform: translateY(-2px);
  }

  .convert-button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
</style>