<!-- src/lib/components/FileItem.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';

  export let file; // The file object
  export let iconComponent; // The icon component to display
  export let actionLabel = '×'; // Label for the action button
  export let onAction; // Function to handle the action
  export let statusColor = 'var(--color-text)'; // Color for the status text
  export let disabled = false; // Whether the action button is disabled

  const dispatch = createEventDispatcher();

  /**
   * Handles the action button click
   */
  function handleAction() {
    if (onAction) {
      onAction(file);
      dispatch('action', { file });
    }
  }
</script>

<li class="file-item">
  <div class="file-info">
    <svelte:component this={iconComponent} class="file-icon" />
    <span class="file-name">{file.name}</span>
    {#if file.status}
      <span class="file-status" style="color: {statusColor}">
        {file.status}
      </span>
    {/if}
  </div>
  <button
    class="action-button"
    on:click={handleAction}
    disabled={disabled}
  >
    {actionLabel}
  </button>
</li>

<style>
  /* FileItem Component Styles */
  .file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-third);
    transition: background-color var(--transition-speed);
  }

  .file-item:hover {
    background-color: rgba(0, 169, 157, 0.05);
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  :global(.file-icon) {
    width: 24px;
    height: 24px;
    color: var(--color-prime);
  }

  .file-name {
    font-weight: 500;
  }

  .file-status {
    font-size: 0.9em;
    font-style: italic;
  }

  .action-button {
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    color: var(--color-prime);
    transition: transform var(--transition-speed), color var(--transition-speed);
  }

  .action-button:hover {
    transform: scale(1.1);
    color: var(--color-prime-dark);
  }

  .action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
