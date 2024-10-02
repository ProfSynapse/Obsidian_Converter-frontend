<!-- src/lib/components/FileUploader.svelte -->
<!-- Component for handling file uploads with improved accessibility -->

<script>
    import { files } from '$lib/stores';
    import { createEventDispatcher } from 'svelte';
  
    const dispatch = createEventDispatcher();
    let dragover = false;
  
    function handleFilesSelected(event) {
      const selectedFiles = Array.from(event.target.files || event.dataTransfer.files);
      $files = [...$files, ...selectedFiles];
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
  
    function removeFile(index) {
      $files = $files.filter((_, i) => i !== index);
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
  
    {#if $files.length > 0}
      <ul class="file-list">
        {#each $files as file, index}
          <li>
            {file.name}
            <button on:click={() => removeFile(index)} aria-label={`Remove ${file.name}`}>Remove</button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
  
  <style>
    .file-uploader {
      border: 2px dashed #ccc;
      border-radius: 4px;
      padding: 20px;
      text-align: center;
      transition: all 0.3s ease;
    }
  
    .dragover {
      border-color: #007bff;
      background-color: #f8f9fa;
    }
  
    .file-input-label {
      display: block;
      cursor: pointer;
      padding: 10px;
      background-color: #007bff;
      color: white;
      border-radius: 4px;
    }
  
    input[type="file"] {
      display: none;
    }
  
    .file-list {
      list-style-type: none;
      padding: 0;
      margin-top: 20px;
    }
  
    .file-list li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background-color: #f8f9fa;
      margin-bottom: 5px;
      border-radius: 4px;
    }
  
    .file-list button {
      background-color: #dc3545;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>