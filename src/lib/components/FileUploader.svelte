<!-- src/lib/components/FileUploader.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { files } from '$lib/stores/files.js';
  import { uploadStore } from '$lib/stores/uploadStore';
  import { fade } from 'svelte/transition';
  
  // Import common components
  import Container from './common/Container.svelte';
  import TabNavigation from './common/TabNavigation.svelte';
  import UrlInput from './common/UrlInput.svelte';
  import DropZone from './common/DropZone.svelte';
  import ErrorMessage from './common/ErrorMessage.svelte';
  import FileList from './FileList.svelte';

  const dispatch = createEventDispatcher();

  // File type configuration
  const SUPPORTED_FILES = {
    documents: ['txt', 'rtf', 'pdf', 'docx', 'odt', 'epub'],
    data: ['csv', 'json', 'yaml', 'yml', 'xlsx', 'pptx'],
    web: ['html', 'htm', 'xml'],
    multimedia: ['mp3', 'wav', 'ogg', 'mp4', 'mov', 'avi', 'webm', 'youtube']
  };

  const SUPPORTED_EXTENSIONS = Object.values(SUPPORTED_FILES).flat();

  /**
   * Shows feedback messages to the user with auto-dismiss
   * @param {string} message - The message to display
   * @param {string} type - Type of message ('success' or 'error')
   */
  function showFeedback(message, type = 'info') {
    uploadStore.setError(message);
    const timeout = setTimeout(() => uploadStore.clearError(), 5000);
    return () => clearTimeout(timeout);
  }

  /**
   * Validates file before adding
   * @param {File} file - The file to validate
   * @returns {boolean} - Whether the file is valid
   */
  function validateFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    return SUPPORTED_EXTENSIONS.includes(extension);
  }

  /**
   * Adds files to the store after validation
   * @param {File[]} newFiles - Array of File objects to add
   */
  function handleFilesAdded(newFiles) {
    newFiles.forEach(file => {
      if (validateFile(file)) {
        const extension = file.name.split('.').pop().toLowerCase();
        const newFile = {
          id: crypto.randomUUID(),
          file: file,
          name: file.name,
          type: getFileType(extension),
          status: 'pending',
          progress: 0
        };
        
        try {
          files.addFile(newFile);
          showFeedback(`Added: ${file.name}`, 'success');
          dispatch('fileAdded', { file: newFile });
        } catch (error) {
          showFeedback(`Failed to add ${file.name}: ${error.message}`, 'error');
        }
      } else {
        showFeedback(`Unsupported file type: ${file.name}`, 'error');
      }
    });
  }

  /**
   * Determines the file type category based on extension
   * @param {string} extension - The file extension
   * @returns {string} The file type category
   */
  function getFileType(extension) {
    for (const [category, extensions] of Object.entries(SUPPORTED_FILES)) {
      if (extensions.includes(extension)) {
        return category;
      }
    }
    return 'others';
  }

  /**
   * Handles URL submission from UrlInput component
   * @param {CustomEvent} event - Event containing URL data
   */
  async function handleUrlSubmit(event) {
    try {
      const { url, type = 'url' } = event.detail;
      const newFile = {
        id: crypto.randomUUID(),
        url: url,
        name: type === 'youtube' ? extractYouTubeVideoId(url) : new URL(url).hostname,
        type: type,
        status: 'pending'
      };

      const result = files.addFile(newFile);
      
      if (result.success) {
        showFeedback(`${type.toUpperCase()} added successfully`, 'success');
        dispatch('filesAdded', { files: [newFile] });
      } else {
        showFeedback(result.message, 'error');
      }

    } catch (error) {
      console.error('Error adding URL:', error);
      showFeedback(error.message, 'error');
    }
  }

  /**
   * Extracts YouTube Video ID from URL
   * @param {string} url - The YouTube URL
   * @returns {string} The video ID or 'unknown'
   */
  function extractYouTubeVideoId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^\s&]+)/;
    const match = url.match(regex);
    return match ? match[1] : 'unknown';
  }

  /**
   * Handles file removal
   * @param {string} id - The ID of the file to remove
   */
  function handleFileRemove(id) {
    try {
      files.removeFile(id);
      showFeedback('File removed successfully', 'success');
    } catch (error) {
      showFeedback('Failed to remove file', 'error');
    }
  }
</script>

<div class="file-uploader" in:fade={{ duration: 200 }}>
  <!-- URL Input Section -->
  <Container 
    title="Add from URL" 
    subtitle="Convert web content or YouTube videos">
    <div class="upload-section">
      <TabNavigation />
      <UrlInput 
        on:submitUrl={handleUrlSubmit}
        on:submitYoutube={handleUrlSubmit}
      />
    </div>
  </Container>

  <!-- File Upload Section -->
  <Container 
    title="Upload Files" 
    subtitle="Drag and drop files or click to select">
    <DropZone
      acceptedTypes={SUPPORTED_EXTENSIONS}
      on:filesDropped={(e) => handleFilesAdded(e.detail.files)}
      on:filesSelected={(e) => handleFilesAdded(e.detail.files)}
    />

    {#if $uploadStore.errorMessage}
      <div class="error-container" transition:fade>
        <ErrorMessage />
      </div>
    {/if}
  </Container>

  <!-- File List Section -->
  {#if $files.length > 0}
    <Container 
      title="Items to Convert"
      subtitle="Files ready for processing">
      <FileList
        files={$files}
        onRemove={handleFileRemove}
      />
    </Container>
  {/if}
</div>

<style>
  .file-uploader {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    width: 100%;
    max-width: var(--content-width-md);
    margin: 0 auto;
    padding: 0 var(--spacing-md);
  }

  .upload-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .error-container {
    margin-top: var(--spacing-md);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .file-uploader {
      gap: var(--spacing-md);
      padding: 0 var(--spacing-sm);
    }
  }

  @media (max-width: 640px) {
    .upload-section {
      gap: var(--spacing-sm);
    }

    .error-container {
      margin-top: var(--spacing-sm);
    }
  }

  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    .file-uploader {
      gap: var(--spacing-xl);
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .file-uploader {
      transition: none;
    }
  }
</style>