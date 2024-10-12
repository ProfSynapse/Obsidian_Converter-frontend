<!-- src/lib/components/FileItem.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { getFileIcon } from '$lib/utils/iconUtils';

  export let file;
  export let actionLabel;
  export let onAction;
  export let statusColor = 'var(--color-text)';
  export let disabled = false;

  const dispatch = createEventDispatcher();

  function handleAction() {
    if (onAction) {
      onAction(file);
      dispatch('action', { file });
    }
  }

  let icon;

  $: icon = getFileIcon(file.type);
</script>

<li class="file-item">
  <div class="file-info">
    {#if icon}
      <span class="file-icon">{icon}</span>
    {/if}
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
    aria-label="Remove File"
  >
    <span class="icon-button">✖️</span>
  </button>
</li>

<style>
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

  .file-icon {
    font-size: 1.5rem;
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
    cursor: pointer;
    padding: 0;
    margin-left: 10px;
  }

  .icon-button {
    background: var(--gradient-button); /* Applied gradient */
    color: white;
    border: none;
    padding: 0;
    border-radius: 50%; /* Circular shape */
    cursor: pointer;
    transition: background-color var(--transition-speed), transform var(--transition-speed);
    height: 32px;
    width: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 600;
  }

  .icon-button:hover {
    background-color: var(--color-error-dark); /* Solid color for visibility */
    transform: scale(1.1);
  }

  .icon-button:active {
    transform: scale(1);
  }

  .icon-button:disabled {
    background-color: #cccccc; /* Gray for Disabled State */
    cursor: not-allowed;
  }
</style>
