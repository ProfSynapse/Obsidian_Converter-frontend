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
      <span class="file-icon" aria-hidden="true">{icon}</span>
    {/if}
    <div class="file-details">
      <span class="file-name">{file.name}</span>
      {#if file.status}
        <span class="file-status" style="color: {statusColor}">
          {file.status}
        </span>
      {/if}
    </div>
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
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--color-border);
    transition: background-color var(--transition-duration-normal);
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    gap: var(--spacing-sm);
  }

  .file-item:hover {
    background-color: var(--color-hover);
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    min-width: 0;
    flex: 1;
  }

  .file-icon {
    font-size: var(--font-size-xl);
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .file-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    min-width: 0;
    flex: 1;
  }

  .file-name {
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--color-text-primary);
  }

  .file-status {
    font-size: var(--font-size-sm);
    font-style: italic;
    color: var(--color-text-secondary);
  }

  .action-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-button {
    background: var(--gradient-primary);
    color: var(--color-text-on-dark);
    border: none;
    padding: 0;
    border-radius: var(--rounded-full);
    cursor: pointer;
    transition: all var(--transition-duration-normal) var(--transition-timing-ease);
    height: 32px;
    width: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-base);
  }

  .icon-button:hover {
    background: var(--color-error);
    transform: scale(1.1);
  }

  .icon-button:active {
    transform: scale(1);
  }

  .icon-button:disabled {
    background: var(--color-disabled);
    cursor: not-allowed;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .file-item {
      padding: var(--spacing-sm);
    }

    .file-info {
      gap: var(--spacing-sm);
    }

    .file-icon {
      font-size: var(--font-size-lg);
      width: 20px;
      height: 20px;
    }

    .icon-button {
      height: 28px;
      width: 28px;
      font-size: var(--font-size-sm);
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .icon-button {
      border: 2px solid currentColor;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .file-item,
    .icon-button {
      transition: none;
    }
  }
</style>