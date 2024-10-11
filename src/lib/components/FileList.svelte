<!-- src/lib/components/FileList.svelte -->
<script>
  import { files } from '$lib/stores/files.js';
  import { getFileIconComponent } from '$lib/utils/iconUtils.js';
  import FileItem from './FileItem.svelte';

  export let title = 'Files';
  export let actionLabel = '×';
  export let onAction;

  // Define functions with parameters
  export let filterFunction = (file) => true;
  export let getStatusColor = (status) => 'var(--color-text)';
  export let isDisabled = (file) => false;

  $: filteredFiles = $files.filter(filterFunction);
</script>

<div class="file-list-container container">
  <h3>{title}</h3>
  {#if filteredFiles.length > 0}
    <ul class="file-list">
      {#each filteredFiles as file}
        <FileItem
          {file}
          iconComponent={getFileIconComponent(file.type)}
          {actionLabel}
          {onAction}
          statusColor={getStatusColor(file.status)}
          disabled={isDisabled(file)}
        />
      {/each}
    </ul>
  {:else}
    <p class="no-files-message">No files to display.</p>
  {/if}
</div>

<style>
  /* Your existing styles */
</style>
