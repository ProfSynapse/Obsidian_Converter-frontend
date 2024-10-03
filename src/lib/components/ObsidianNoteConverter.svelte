<script>
  let apiKey = '';
  let files = [];
  let conversionProgress = 0;
  let convertedContents = [];
  let conversionStatus = 'idle';

  function handleFileSelect(event) {
    files = Array.from(event.target.files);
  }

  async function convertFiles() {
    if (!apiKey || files.length === 0) {
      alert('Please enter your API key and select files to convert.');
      return;
    }

    conversionStatus = 'converting';
    conversionProgress = 0;
    convertedContents = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const content = await file.text();

        const response = await fetch('/api/convert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey
          },
          body: JSON.stringify({ content })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        convertedContents = [...convertedContents, { fileName: file.name, content: result.convertedContent }];
        conversionProgress = ((i + 1) / files.length) * 100;
      }

      conversionStatus = 'complete';
    } catch (error) {
      console.error('Conversion error:', error);
      conversionStatus = 'error';
    }
  }

  function downloadFile(fileName, content) {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

<main>
  <h1>Obsidian Note Converter</h1>
  
  <div>
    <label for="apiKey">API Key:</label>
    <input id="apiKey" type="password" bind:value={apiKey} />
  </div>

  <div>
    <label for="fileInput">Select Files:</label>
    <input id="fileInput" type="file" on:change={handleFileSelect} multiple accept=".md" />
  </div>

  <button on:click={convertFiles} disabled={conversionStatus === 'converting'}>
    {conversionStatus === 'converting' ? 'Converting...' : 'Convert Notes'}
  </button>

  {#if conversionStatus === 'converting'}
    <div>
      <progress value={conversionProgress} max="100"></progress>
      <p>Converting files... {conversionProgress.toFixed(0)}%</p>
    </div>
  {/if}

  {#if conversionStatus === 'complete'}
    <div>
      <h2>Converted Files</h2>
      {#each convertedContents as { fileName, content }}
        <div>
          <span>{fileName}</span>
          <button on:click={() => downloadFile(fileName, content)}>Download</button>
        </div>
      {/each}
    </div>
  {/if}

  {#if conversionStatus === 'error'}
    <div>
      <p>There was an error during conversion. Please try again.</p>
    </div>
  {/if}
</main>

<style>
  main {
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }

  h1 {
    color: #00A99D;
  }

  input, button {
    margin: 10px 0;
    padding: 5px;
  }

  button {
    background-color: #00A99D;
    color: white;
    border: none;
    padding: 10px 15px;
    cursor: pointer;
  }

  button:disabled {
    background-color: #cccccc;
  }

  progress {
    width: 100%;
  }
</style>