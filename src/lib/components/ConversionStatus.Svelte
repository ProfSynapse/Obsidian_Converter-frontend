<!-- src/lib/components/ConversionStatus.svelte -->
<!-- Component for displaying the current conversion status -->

<script>
  import { fade } from 'svelte/transition';
  import { conversionStatus } from '$lib/stores';

  let transitionDuration = 300;
</script>

<div 
  class="conversion-status" 
  transition:fade={{ duration: transitionDuration }}
  role="status" 
  aria-live="polite" 
  aria-label="Conversion Status"
>
  {#if $conversionStatus === 'idle'}
    <p class="status idle">Ready to convert your files.</p>
  {:else if $conversionStatus === 'processing'}
    <p class="status processing">Converting your files...</p>
    <div class="spinner" role="presentation" aria-hidden="true"></div>
  {:else if $conversionStatus === 'completed'}
    <p class="status completed">Conversion completed successfully!</p>
  {:else if $conversionStatus === 'error'}
    <p class="status error">An error occurred during conversion. Please try again.</p>
  {/if}
</div>

<style>
  .conversion-status {
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
    text-align: center;
    background-color: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .status {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .idle {
    color: #666;
  }

  .processing {
    color: #00A99D;
  }

  .completed {
    color: #28a745;
  }

  .error {
    color: #dc3545;
  }

  .spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #00A99D;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin: 1rem auto;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>