<!-- src/lib/components/ResultDisplay.svelte -->
<!-- Component for displaying conversion results -->

<script>
    import { conversionStatus } from '$lib/stores';
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();
    
    // This should be populated with actual conversion results
    export let conversionResults = [];
  
    function downloadFile(fileName, content) {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  
    function handleDownload(result) {
      downloadFile(result.name, result.content);
      dispatch('fileDownloaded', result);
    }
  </script>
  
  <div class="result-display">
    {#if $conversionStatus === 'completed' && conversionResults.length > 0}
      <h2>Conversion Results</h2>
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
                  <button on:click={() => handleDownload(result)}>
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
    {:else if $conversionStatus === 'completed'}
      <p>No files were converted. Please try uploading some files.</p>
    {/if}
  </div>
  
  <style>
    .result-display {
      margin-top: 20px;
    }
  
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
  
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
  
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
  
    button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
  
    button:hover {
      background-color: #0056b3;
    }
  
    .success {
      color: #28a745;
    }
  
    .error {
      color: #dc3545;
    }
  
    .error-message {
      font-size: 0.8em;
      color: #dc3545;
    }
  </style>