<!-- src/routes/+page.svelte -->
<script>
  import FileUploader from '$lib/components/FileUploader.svelte';
  import ConversionStatus from '$lib/components/ConversionStatus.svelte';
  import ResultDisplay from '$lib/components/ResultDisplay.svelte';
  import { files } from '$lib/stores/files.js';
  import { apiKey } from '$lib/stores/apiKey.js';
  import { conversionStatus } from '$lib/stores/conversionStatus.js';
  import ConversionClient from '$lib/utils/api/client.js';
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { get } from 'svelte/store';

  const dispatch = createEventDispatcher();

  // UI state
  let isConverting = false;
  let error = null;

  // Reactive variables
  $: hasMediaFiles = $files.some(file => ['mp3', 'wav', 'ogg', 'mp4', 'mov', 'avi', 'webm'].includes(file.type));
  $: hasYouTubeFiles = $files.some(file => file.type === 'youtube');
  $: apiKeyRequired = hasMediaFiles || hasYouTubeFiles;
  $: canStartConversion = (!apiKeyRequired || $apiKey) && $files.length > 0 && !isConverting;

  /**
   * Prepares items for batch conversion, including YouTube
   */
  async function prepareBatchItems() {
    return await Promise.all($files.map(async file => {
      try {
        if (file.file) {
          // Handle uploaded files
          const base64Content = await readFileAsBase64(file.file);
          return {
            type: 'file',
            name: file.name,
            content: base64Content,
            fileType: file.type
          };
        } else if (file.type === 'youtube') {
          // Handle YouTube URLs - no API key needed
          const videoId = extractYoutubeId(file.url);
          if (!videoId) {
            throw new Error('Invalid YouTube URL');
          }

          return {
            type: 'youtube',
            name: videoId,
            content: file.url,
            fileType: 'youtube'
          };
        } else {
          // Handle other URLs
          return {
            type: file.type,
            name: file.name,
            content: file.url,
            fileType: file.type
          };
        }
      } catch (error) {
        console.error(`Error preparing item ${file.name}:`, error);
        throw error;
      }
    }));
  }

  /**
   * Extracts YouTube video ID from URL
   */
  function extractYoutubeId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^\s&]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Handles starting the conversion process
   */
  async function handleStartConversion() {
    if (!canStartConversion) return;

    try {
      isConverting = true;
      error = null;
      conversionStatus.reset();
      conversionStatus.setStatus('converting');

      // Prepare items for batch conversion
      const batchItems = await prepareBatchItems();

      // Start conversion
      const results = await ConversionClient.convertFiles(batchItems, $apiKey);

      // Update conversion status based on results
      // Assuming `convertFiles` updates the `conversionStatus` store
      console.log('✅ Batch conversion completed successfully');
      conversionStatus.setStatus('completed');
      showFeedback('Batch conversion completed successfully', 'success');
      
    } catch (err) {
      console.error('Conversion error:', err);
      
      let errorMessage;
      if (err instanceof ConversionError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else {
        errorMessage = 'An unexpected error occurred during conversion';
      }
      
      conversionStatus.setError(errorMessage);
      showFeedback(errorMessage, 'error');
      
    } finally {
      isConverting = false;
    }
  }

  /**
   * Shows feedback message
   */
  function showFeedback(message, type = 'info') {
    // Implement a method to show feedback to the user
    // For simplicity, you might use a toast library or set a local variable
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  /**
   * Utility function to read a file as base64
   */
  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]); // Remove the data URL part
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Handles filesAdded event from FileUploader
   */
  function handleFilesAdded(event) {
    // You can implement additional logic if needed
    console.log('Files added:', event.detail.files);
  }
</script>

<!-- Floating Containers for Each Section -->
<FileUploader on:filesAdded={handleFilesAdded} />

<ConversionStatus />

<ResultDisplay />

<style>
  /* Remove any container-specific styles here */
  /* The layout and spacing are handled in layout.svelte and individual components */
</style>
