<!-- src/lib/components/ResultDisplay.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  
  export let conversionResults = [];
  
  const dispatch = createEventDispatcher();

  function downloadFile(fileName, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    dispatch('fileDownloaded', { fileName });
  }

  function handleDownloadAll() {
    dispatch('downloadAll', conversionResults);
  }
</script>

<div class="result-display">
  {#if conversionResults.length > 0}
    <h2>Conversion Results</h2>
    <button class="download-all-btn" on:click={handleDownloadAll}>Download All</button>
    <table>
      <thead>
        <tr>
          <th>File Name</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {#each conversionResults as result}
          <tr>
            <td>{result.name}</td>
            <td>
              {#if result.error}
                <span class="error">Failed</span>
              {:else}
                <span class="success">Converted</span>
              {/if}
            </td>
            <td>
              {#if !result.error}
                <button on:click={() => downloadFile(result.name, result.content)}>
                  Download
                </button>
              {:else}
                <span class="error-message">{result.error}</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p>No conversion results available.</p>
  {/if}
</div>

<style>
  .result-display {
    width: 100%;
    margin-top: 20px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  .download-all-btn {
    background-color: #00A99D;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 1rem;
  }

  .download-all-btn:hover, .download-all-btn:focus {
    background-color: #008c82;
  }
</style>