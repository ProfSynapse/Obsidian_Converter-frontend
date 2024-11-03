<!-- src/lib/components/ObsidianNoteConverter -->

<script>
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import FileUploader from './FileUploader.svelte';
  import ConversionStatus from './ConversionStatus.svelte';
  import ResultDisplay from './ResultDisplay.svelte';
  import { apiKey } from '$lib/stores/apiKey.js';
  import { files } from '$lib/stores/files.js';
  import { conversionStatus } from '$lib/stores/conversionStatus.js';

  let isConverting = false;
  let currentFile = null;
  let conversionError = null;

  $: canConvert = $apiKey && $files.length > 0 && !isConverting;
  $: isComplete = $conversionStatus.status === 'completed';
  $: hasError = $conversionStatus.status === 'error';

  async function handleStartConversion() {
    if (!canConvert) return;

    try {
      isConverting = true;
      conversionError = null;
      conversionStatus.setStatus('converting');
      conversionStatus.setProgress(0);
      
      for (const file of $files) {
        conversionStatus.setCurrentFile(file.name);
        await convertFile(file);
      }

      conversionStatus.setStatus('completed');
      conversionStatus.setProgress(100);
    } catch (error) {
      console.error('Conversion error:', error);
      conversionError = error.message;
      conversionStatus.setError(error.message);
    } finally {
      isConverting = false;
    }
  }

  async function convertFile(file) {
    const formData = new FormData();
    formData.append('file', file.file);
    formData.append('fileType', file.name.split('.').pop().toLowerCase());

    const response = await fetch('http://localhost:3000/api/v1/convert/file', {
      method: 'POST',
      headers: { 'X-API-Key': $apiKey },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to convert ${file.name}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error?.message || 'Conversion failed');
    }

    files.updateFile(file.id, {
      status: 'completed',
      convertedContent: result.content,
      images: result.images || [],
      fileId: result.fileId
    });
  }

  async function handleDownload(event) {
    try {
      const fileId = event.detail.fileId;
      const file = $files.find(f => f.id === fileId);
      if (!file) throw new Error('File not found');

      const zip = new JSZip();
      zip.file(`${file.name}.md`, file.convertedContent);

      if (file.images?.length > 0) {
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        const imagesFolder = zip.folder(`attachments/${baseName}`);
        
        for (const image of file.images) {
          const imageData = atob(image.data);
          const arrayBuffer = new ArrayBuffer(imageData.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          
          for (let i = 0; i < imageData.length; i++) {
            uint8Array[i] = imageData.charCodeAt(i);
          }
          
          imagesFolder.file(image.name, uint8Array, { binary: true });
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${file.name}-converted.zip`);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  }
</script>

<main class="converter-app" in:fade={{ duration: 300 }}>
  <header class="app-header">
    <h1 class="app-title">
      <span class="icon">📝</span>
      Obsidian Note Converter
    </h1>
    <p class="app-description">
      Convert your documents to Obsidian-compatible Markdown notes
    </p>
  </header>

  <div class="converter-sections">
    <!-- File Upload Section -->
    <section 
      class="section upload-section"
      class:is-active={!isComplete}
      transition:slide|local
    >
      <FileUploader on:filesAdded />
    </section>

    <!-- Conversion Status Section -->
    {#if $files.length > 0}
      <section 
        class="section status-section"
        transition:slide|local
      >
        <ConversionStatus />
        
        {#if !isComplete && canConvert}
          <div class="conversion-actions" transition:fade>
            <button
              class="convert-button"
              class:loading={isConverting}
              disabled={!canConvert}
              on:click={handleStartConversion}
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
                  {isConverting ? 'Converting...' : 'Start Conversion'}
                </span>
              </span>
            </button>
          </div>
        {/if}
      </section>
    {/if}

    <!-- Results Section -->
    {#if isComplete}
      <section 
        class="section results-section"
        transition:slide|local
      >
        <ResultDisplay 
          files={$files} 
          on:download={handleDownload} 
        />
      </section>
    {/if}
  </div>
</main>

<style>
  .converter-app {
    max-width: var(--content-width-lg);
    margin: 0 auto;
    padding: var(--spacing-xl) var(--spacing-lg);
  }

  .app-header {
    text-align: center;
    margin-bottom: var(--spacing-2xl);
  }

  .app-title {
    font-size: var(--font-size-3xl);
    color: var(--color-text-on-dark);
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
  }

  .app-description {
    color: var(--color-text-on-dark);
    font-size: var(--font-size-lg);
    margin: var(--spacing-sm) 0 0;
    opacity: 0.9;
  }

  .converter-sections {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
  }

  .section {
    opacity: 0.95;
    transition: all var(--transition-duration-normal) var(--transition-timing-ease);
  }

  .section:hover {
    opacity: 1;
  }

  .section.is-active {
    transform: scale(1.01);
  }

  .conversion-actions {
    display: flex;
    justify-content: center;
    margin-top: var(--spacing-xl);
  }

  .convert-button {
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

  .convert-button::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--gradient-primary);
    opacity: 0;
    transition: opacity var(--transition-duration-normal);
  }

  .convert-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .convert-button:hover::before {
    opacity: 1;
  }

  .convert-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .convert-button:disabled {
    background: var(--color-disabled);
    cursor: not-allowed;
  }

  .button-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
  }

  .convert-button.loading .icon {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .converter-app {
      padding: var(--spacing-lg) var(--spacing-md);
    }

    .app-title {
      font-size: var(--font-size-2xl);
    }

    .app-description {
      font-size: var(--font-size-base);
    }

    .converter-sections {
      gap: var(--spacing-lg);
    }
  }

  @media (max-width: 640px) {
    .converter-app {
      padding: var(--spacing-md);
    }

    .app-header {
      margin-bottom: var(--spacing-xl);
    }

    .convert-button {
      width: 100%;
      padding: var(--spacing-md);
    }
  }

  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    .convert-button {
      background: var(--color-prime);
      border: 2px solid var(--color-text-on-dark);
    }

    .convert-button::before {
      display: none;
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .section,
    .convert-button {
      transition: none;
      transform: none;
    }

    .section.is-active {
      transform: none;
    }

    .convert-button:hover {
      transform: none;
    }
  }
</style>