<!-- src/lib/components/ResultDisplay.svelte -->
<script>
  import FileList from './FileList.svelte';
  import { files } from '$lib/stores/files.js';

  function handleDownload(file) {
    console.log(`Downloading file: ${file.name}`);
  }

  function isConvertedFile(file) {
    return ['completed', 'error', 'pending'].includes(file.status);
  }

  function getStatusColor(status) {
    const colors = {
      completed: 'var(--color-prime)',
      error: 'var(--color-error)',
      pending: 'var(--color-text)',
    };
    return colors[status] || 'var(--color-text)';
  }

  function isDisabled(file) {
    return file.status !== 'completed';
  }

  const actionLabel = 'Download';

  function onAction(file) {
    handleDownload(file);
  }
</script>

<div class="result-display container">
  <h2>Converted Files</h2>
  <FileList
    title="Converted Files"
    {actionLabel}
    {onAction}
    filterFunction={isConvertedFile}
    {getStatusColor}
    {isDisabled}
  />
</div>

<style>
  /* Your existing styles */
</style>
