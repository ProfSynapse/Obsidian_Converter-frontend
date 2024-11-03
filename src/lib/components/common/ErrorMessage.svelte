<!-- src/lib/components/FileUploader/components/ErrorMessage.svelte -->
<script>
    import { fly } from 'svelte/transition';
    import { uploadStore } from '$lib/stores/uploadStore';
  </script>
  
  {#if $uploadStore.errorMessage}
    <div class="error-message" role="alert" in:fly={{ y: 10, duration: 200 }}>
      <span class="icon">⚠️</span>
      <span>{$uploadStore.errorMessage}</span>
    </div>
  {/if}
  
  <style>
    .error-message {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      background: var(--color-error-light);
      color: var(--color-error);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--rounded-md);
      font-size: var(--font-size-sm);
    }
  
    .icon {
      font-size: 1.2em;
    }
  </style>