<!-- src/lib/components/FileUploader.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  let dragover = false;

  function handleFilesSelected(event) {
    const selectedFiles = Array.from(event.target.files || event.dataTransfer.files || []);
    dispatch('filesAdded', selectedFiles);
  }

  function handleDragOver(event) {
    event.preventDefault();
    dragover = true;
  }

  function handleDragLeave() {
    dragover = false;
  }

  function handleDrop(event) {
    event.preventDefault();
    dragover = false;
    handleFilesSelected(event);
  }
</script>

<div 
  class="file-uploader"
  class:dragover
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  role="region"
  aria-label="File upload area"
  tabindex="0"
>
  <label for="file-input" class="file-input-label">
    <input 
      id="file-input"
      type="file" 
      multiple 
      on:change={handleFilesSelected}
    />
    Drag and drop files here or click to select
  </label>
</div>

<style>
  .file-uploader {
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    transition: all 0.3s ease;
  }

  .file-uploader:focus-within {
    outline: 2px solid #00A99D;
    outline-offset: 2px;
  }

  .dragover {
    border-color: #00A99D;
    background-color: #f8f9fa;
  }

  .file-input-label {
    display: block;
    cursor: pointer;
    padding: 10px;
    background-color: #00A99D;
    color: white;
    border-radius: 4px;
  }

  input[type="file"] {
    display: none;
  }
</style>