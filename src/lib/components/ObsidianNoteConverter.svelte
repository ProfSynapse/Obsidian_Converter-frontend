<script>
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { apiKey, files, conversionStatus } from '$lib/stores';
  import { convertFiles } from '$lib/api';
  import logo from '$lib/assets/logo.png';

  let isInstructionsOpen = false;
  let conversionProgress = 0;
  let convertedContents = [];

  $: isConvertReady = $apiKey && $files.length > 0;

  function handleApiKeyChange(event) {
    $apiKey = event.target.value;
  }

  function handleFileChange(event) {
    const newFiles = Array.from(event.target.files);
    $files = [...$files, ...newFiles];
  }

  function removeFile(index) {
    $files = $files.filter((_, i) => i !== index);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    $conversionStatus = 'processing';
    convertedContents = [];
    conversionProgress = 0;

    for (let i = 0; i < $files.length; i++) {
      const formData = new FormData();
      formData.append('file', $files[i]);
      formData.append('apiKey', $apiKey);

      try {
        const response = await convertFiles(formData);
        convertedContents = [...convertedContents, { fileName: $files[i].name, content: response.convertedContent }];
        conversionProgress = ((i + 1) / $files.length) * 100;
      } catch (error) {
        console.error('Error during conversion:', error);
        $conversionStatus = 'error';
        return;
      }
    }

    $conversionStatus = 'completed';
  }

  function handleDownload(fileName, content) {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted_${fileName}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="container">
  <div class="logo-container">
    <img src={logo} alt="Obsidian Note Converter Logo" class="logo" />
  </div>
  <h1 class="title">Obsidian Note Converter</h1>
  <p class="subtitle">Transform your files for Obsidian with ease</p>
  
  <div class="accordion-container">
    <button class="accordion-header" on:click={() => isInstructionsOpen = !isInstructionsOpen}>
      How to Use
    </button>
    {#if isInstructionsOpen}
      <div class="accordion-content" transition:slide>
        <ol>
          <li>Enter your OpenAI API key.</li>
          <li>Select one or more files you want to convert.</li>
          <li>Click the "Convert Notes" button.</li>
          <li>Download your converted notes.</li>
        </ol>
      </div>
    {/if}
  </div>

  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="apiKey">OpenAI API Key:</label>
      <input
        type="password"
        id="apiKey"
        value={$apiKey}
        on:input={handleApiKeyChange}
        placeholder="Enter your OpenAI API key"
      />
      <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer" class="api-key-link">
        Don't have an API key? Get one here.
      </a>
    </div>

    <div class="form-group">
      <label for="fileInput">Select Files:</label>
      <input
        type="file"
        id="fileInput"
        on:change={handleFileChange}
        multiple
      />
    </div>

    <ul class="file-list">
      {#each $files as file, index}
        <li class="file-item">
          {file.name}
          <button class="remove-file-button" on:click={() => removeFile(index)}>×</button>
        </li>
      {/each}
    </ul>

    <button type="submit" class="styled-button" class:ready={isConvertReady} disabled={!isConvertReady}>
      Convert Notes
    </button>
  </form>

  {#if $conversionStatus === 'processing'}
    <p class="status-message">Processing your files...</p>
    <div class="progress-bar-container">
      <div class="progress-bar-fill" style="width: {conversionProgress}%"></div>
    </div>
  {/if}

  {#if $conversionStatus === 'completed'}
    <div class="result-container">
      <p class="status-message">Conversion completed!</p>
      {#each convertedContents as item}
        <div class="converted-content">
          <h3>{item.fileName}</h3>
          <p>{item.content.substring(0, 100)}...</p>
          <button class="styled-button ready" on:click={() => handleDownload(item.fileName, item.content)}>
            Download Converted Note
          </button>
        </div>
      {/each}
    </div>
  {/if}

  {#if $conversionStatus === 'error'}
    <p class="status-message error">An error occurred during conversion. Please try again.</p>
  {/if}
</div>

<style>
  .container {
    font-family: 'Montserrat', sans-serif;
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem;
    background-color: #FFFFFF;
    color: #33475B;
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  .logo-container {
    text-align: center;
    margin-bottom: 2rem;
  }

  .logo {
    max-width: 200px;
    height: auto;
  }

  .title {
    color: #00A99D;
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 2rem;
  }

  .subtitle {
    text-align: center;
    color: #93278F;
    margin-bottom: 2rem;
    font-size: 1rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #33475B;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #00A99D;
    border-radius: 6px;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  input:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 169, 157, 0.3);
  }

  .styled-button {
    background-color: #cccccc;
    color: #FFFFFF;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: not-allowed;
    transition: all 0.3s ease;
  }

  .styled-button.ready {
    background-color: #00A99D;
    cursor: pointer;
  }

  .styled-button.ready:hover {
    background-color: #93278F;
  }

  .status-message {
    text-align: center;
    font-weight: 600;
    margin-top: 1rem;
    color: #29ABE2;
  }

  .status-message.error {
    color: #FF0000;
  }

  .result-container {
    margin-top: 2rem;
  }

  .converted-content {
    background-color: #33475B;
    color: #FFFFFF;
    padding: 1rem;
    border-radius: 6px;
    white-space: pre-wrap;
    word-wrap: break-word;
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 1rem;
  }

  .api-key-link {
    color: #29ABE2;
    text-decoration: none;
  }

  .api-key-link:hover {
    text-decoration: underline;
  }

  .accordion-container {
    margin-bottom: 1.5rem;
  }

  .accordion-header {
    background-color: #00A99D;
    color: #FFFFFF;
    cursor: pointer;
    padding: 1rem;
    width: 100%;
    text-align: left;
    border: none;
    outline: none;
    transition: 0.4s;
    border-radius: 6px;
    font-weight: 600;
  }

  .accordion-header:hover {
    background-color: #93278F;
  }

  .accordion-content {
    padding: 0 1rem;
    background-color: #FFFFFF;
    overflow: hidden;
  }

  .file-list {
    list-style-type: none;
    padding: 0;
  }

  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    background-color: #FFFFFF;
    border: 1px solid #00A99D;
    border-radius: 4px;
  }

  .remove-file-button {
    background-color: #F7931E;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-weight: bold;
  }

  .remove-file-button:hover {
    background-color: #93278F;
  }

  .progress-bar-container {
    width: 100%;
    background-color: #e0e0e0;
    border-radius: 4px;
    margin-top: 1rem;
  }

  .progress-bar-fill {
    height: 20px;
    background-color: #00A99D;
    border-radius: 4px;
    transition: width 0.3s ease-in-out;
  }

  @media (max-width: 768px) {
    .container {
      padding: 1rem;
    }

    .title {
      font-size: 1.5rem;
    }
  }
</style>