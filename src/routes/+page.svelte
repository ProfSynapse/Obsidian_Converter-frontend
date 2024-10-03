<script>
  import { fade, slide } from 'svelte/transition';
  import FileUploader from '$lib/components/FileUploader.svelte';
  import ConversionStatus from '$lib/components/ConversionStatus.svelte';
  import ResultDisplay from '$lib/components/ResultDisplay.svelte';
  import { conversionStatus } from '$lib/stores';

  let conversionResults = [];
  let apiKey = '';
  let showPurpose = false;
  let showInstructions = false;
  let urlInput = '';
  let itemsToConvert = [];

  function handleFilesAdded(event) {
    const newFiles = event.detail;
    itemsToConvert = [...itemsToConvert, ...newFiles.map(file => ({ type: 'file', data: file }))];
  }

  function handleAddUrl() {
    if (urlInput.trim()) {
      itemsToConvert = [...itemsToConvert, { type: 'url', data: urlInput.trim() }];
      urlInput = '';
    }
  }

  function handleRemoveItem(index) {
    itemsToConvert = itemsToConvert.filter((_, i) => i !== index);
  }

  function handleFileDownloaded(event) {
    console.log('File downloaded:', event.detail);
  }

  function toggleAccordion(section) {
    if (section === 'purpose') {
      showPurpose = !showPurpose;
    } else if (section === 'instructions') {
      showInstructions = !showInstructions;
    }
  }

  function handleConvert() {
    if (itemsToConvert.length > 0 && apiKey) {
      $conversionStatus = 'processing';
      // Simulating conversion process
      setTimeout(() => {
        $conversionStatus = 'completed';
        conversionResults = itemsToConvert.map(item => ({
          name: item.type === 'file' ? item.data.name : item.data,
          content: `Converted content of ${item.type === 'file' ? item.data.name : item.data} with added metadata`,
          error: Math.random() < 0.2 ? 'Random error occurred' : null
        }));
      }, 2000);
    } else {
      alert('Please add files or URLs and enter an OpenAI API key before converting.');
    }
  }

  async function handleDownloadAll(event) {
    const results = event.detail;
    const response = await fetch('/api/create-zip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(results),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted_files.zip';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert('Failed to create ZIP file. Please try again.');
    }
  }
</script>

<svelte:head>
  <title>Omni-Converter</title>
</svelte:head>

<div class="gradient-background">
  <main class="container">
    <h1 class="animated-gradient-text">Omni-Converter</h1>
    
    <section class="accordion">
      <h2>
        <button 
          class="accordion-header"
          class:active={showPurpose}
          on:click={() => toggleAccordion('purpose')}
          aria-expanded={showPurpose}
          aria-controls="purpose-content"
        >
          Purpose and Features
          <span class="accordion-icon" aria-hidden="true">{showPurpose ? '−' : '+'}</span>
        </button>
      </h2>
      {#if showPurpose}
      <div id="purpose-content" class="accordion-content" transition:slide>
        <div class="content-container markdown-style">
          <p>Omni-Converter is a powerful tool designed to transform your files and web content while enhancing their content using OpenAI technology:</p>
          <ul>
            <li>Convert between various file types</li>
            <li>Scrape and convert web content</li>
            <li>Add rich metadata based on the content</li>
            <li>Enhance searchability and organization of your documents</li>
            <li>Preserve formatting and structure during conversion</li>
            <li>Seamlessly integrate with your existing workflow</li>
          </ul>
        </div>
      </div>
    {/if}
  </section>

    <section class="accordion">
      <h2>
        <button 
          class="accordion-header"
          class:active={showInstructions}
          on:click={() => toggleAccordion('instructions')}
          aria-expanded={showInstructions}
          aria-controls="instructions-content"
        >
          How to Use
          <span class="accordion-icon" aria-hidden="true">{showInstructions ? '−' : '+'}</span>
        </button>
      </h2>
      {#if showInstructions}
        <div id="instructions-content" class="accordion-content" transition:slide>
          <div class="content-container markdown-style">
            <ol>
              <li>Enter your OpenAI API key in the field below.</li>
              <li>Add files by dragging and dropping or clicking to select.</li>
              <li>Add URLs by entering them in the URL field and clicking the "+" button.</li>
              <li>Review your list of files and URLs to be converted.</li>
              <li>Click the <code>Convert</code> button to start the process.</li>
              <li>Once conversion is complete, download your converted files individually or all at once.</li>
            </ol>
            <p><strong>Note:</strong> Ensure you have a valid OpenAI API key before starting the conversion process.</p>
          </div>
        </div>
      {/if}
    </section>

    <div class="api-key-input">
      <input 
        id="api-key" 
        type="password" 
        bind:value={apiKey} 
        placeholder="Enter your OpenAI API key"
        aria-required="true"
      />
      <p class="api-key-info">
        Don't have an API key? <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">Get one here</a>
      </p>
    </div>

    <FileUploader on:filesAdded={handleFilesAdded} />

    <div class="url-input">
      <input 
        id="url-input" 
        type="url" 
        bind:value={urlInput}
        placeholder="Enter a URL"
      />
      <button on:click={handleAddUrl} aria-label="Add URL">
        <span aria-hidden="true">+</span>
      </button>
    </div>

    {#if itemsToConvert.length > 0}
      <div class="items-to-convert">
        <h3>Items to Convert:</h3>
        <ul>
          {#each itemsToConvert as item, index}
            <li>
              {item.type === 'file' ? item.data.name : item.data}
              <button on:click={() => handleRemoveItem(index)} aria-label={`Remove ${item.type === 'file' ? item.data.name : item.data}`}>
                <span aria-hidden="true">×</span>
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    <button 
      class="convert-button" 
      on:click={handleConvert}
      aria-label="Convert files and URLs using OpenAI"
    >
      Convert
    </button>

    <ConversionStatus />
    <ResultDisplay 
      {conversionResults} 
      on:fileDownloaded={handleFileDownloaded}
      on:downloadAll={handleDownloadAll}
    />
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: 'Montserrat', sans-serif;
    line-height: 1.5;
    color: #333;
  }

  .gradient-background {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #00A99D, #93278F);
    padding: 2rem;
  }

  .container {
    background-color: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    max-width: 800px;
    width: 100%;
  }

  .animated-gradient-text {
    font-size: 2.5rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 1.5rem;
    background: linear-gradient(
      to right,
      #00A99D,
      #93278F,
      #00A99D,
      #93278F
    );
    background-size: 300% auto;
    color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
    animation: gradient 20s linear infinite;
  }

  @keyframes gradient {
    0% {
      background-position: 0% center;
    }
    100% {
      background-position: 300% center;
    }
  }

  .accordion {
    margin-bottom: 1rem;
    border-radius: 4px;
    overflow: hidden;
  }

  .accordion-header {
    background-color: #00A99D; /* Primary color */
    color: white;
    border: none;
    padding: 1rem;
    width: 100%;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .accordion-header:hover {
    background-color: #93278F; /* Secondary color */
  }

  .accordion-header.active {
    background-color: #93278F; /* Secondary color */
  }

  .accordion-icon {
    font-size: 1.2rem;
  }

  .accordion-content {
    background-color: white;
    overflow: hidden;
  }

  .content-container {
    background-color: white;
    padding: 1.5rem;
  }

  .markdown-style {
    font-size: 1rem;
    line-height: 1.6;
    color: #333;
  }

  .markdown-style p {
    margin-bottom: 1rem;
  }

  .markdown-style ul, .markdown-style ol {
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }

  .markdown-style li {
    margin-bottom: 0.5rem;
  }

  .markdown-style code {
    background-color: #f0f0f0;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9em;
  }

  .markdown-style strong {
    font-weight: 600;
  }

  .api-key-input {
    width: 100%;
    margin-bottom: 1.5rem;
  }

  .api-key-input input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }

  .url-input {
    margin-top: 1rem;
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .url-input input {
    flex-grow: 1;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .url-input button, .items-to-convert button {
    background-color: #00A99D;
    color: white;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.5rem;
    line-height: 1;
    padding: 0;
  }

  .items-to-convert {
    margin-top: 1rem;
  }

  .items-to-convert ul {
    list-style-type: none;
    padding: 0;
  }

  .items-to-convert li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background-color: #f0f0f0;
    margin-bottom: 0.5rem;
    border-radius: 4px;
  }

  .convert-button {
    background-color: #93278F;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 1rem;
    width: 100%;
  }

  @media (max-width: 768px) {
    .gradient-background {
      padding: 1rem;
    }

    .container {
      padding: 1.5rem;
    }

    .animated-gradient-text {
      font-size: 2rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .animated-gradient-text {
      animation: none;
      background-size: 100%;
      background-position: 0% center;
    }
  }
</style>