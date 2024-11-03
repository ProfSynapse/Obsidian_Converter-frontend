<!-- src/lib/components/common/UrlInput.svelte -->
<script>
    import { createEventDispatcher } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { uploadStore } from '../../stores/uploadStore';
  
    const dispatch = createEventDispatcher();
    let inputValue = '';
  
    // Update input value when store changes
    $: {
      inputValue = $uploadStore.activeTab === 'youtube' 
        ? $uploadStore.youtubeUrlInput 
        : $uploadStore.urlInput;
    }
  
    // Update store when input changes
    function handleInput(event) {
      const value = event.target.value;
      if ($uploadStore.activeTab === 'youtube') {
        uploadStore.setYoutubeInput(value);
      } else {
        uploadStore.setUrlInput(value);
      }
    }
  
    function handleSubmit() {
      const event = $uploadStore.activeTab === 'youtube' ? 'submitYoutube' : 'submitUrl';
      dispatch(event, { url: inputValue, type: $uploadStore.activeTab });
      
      // Clear input after submission
      if ($uploadStore.activeTab === 'youtube') {
        uploadStore.setYoutubeInput('');
      } else {
        uploadStore.setUrlInput('');
      }
    }
  
    $: isYoutube = $uploadStore.activeTab === 'youtube';
    $: placeholder = isYoutube 
      ? 'Enter YouTube URL to convert'
      : `Enter a ${$uploadStore.activeTab === 'parent' ? 'Parent URL' : 'URL'} to convert`;
  </script>
  
  <div class="url-input-section" in:fade={{ duration: 200 }}>
    <div class="input-container">
      <div class="input-icon" aria-hidden="true">
        {#if isYoutube}
          🎥
        {:else if $uploadStore.activeTab === 'parent'}
          🗺️
        {:else}
          🔗
        {/if}
      </div>
  
      <input
        type="url"
        class="url-input"
        {placeholder}
        value={inputValue}
        on:input={handleInput}
        on:keypress={(e) => e.key === 'Enter' && handleSubmit()}
      />
  
      <button 
        class="submit-button"
        on:click={handleSubmit}
        disabled={!inputValue.trim()}
        title="Add URL"
      >
        <span class="icon">➕</span>
      </button>
    </div>
  
    <!-- URL Type Indicator -->
    <div class="url-type-indicator" in:fly={{ y: 10, duration: 200 }}>
      {#if isYoutube}
        Convert YouTube video to Markdown notes
      {:else if $uploadStore.activeTab === 'parent'}
        Convert all pages linked from this URL
      {:else}
        Convert single webpage to Markdown
      {/if}
    </div>
  </div>
  
  <style>
    .url-input-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }
  
    .input-container {
      display: flex;
      align-items: center;
      background: var(--color-surface);
      border: 2px solid var(--color-border);
      border-radius: var(--rounded-lg);
      padding: var(--spacing-xs);
      transition: all var(--transition-duration-normal);
    }
  
    .input-container:focus-within {
      border-color: var(--color-prime);
      box-shadow: var(--shadow-sm);
    }
  
    .input-icon {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--font-size-lg);
    }
  
    .url-input {
      flex: 1;
      border: none;
      background: transparent;
      padding: var(--spacing-sm);
      font-size: var(--font-size-base);
      color: var(--color-text);
      min-width: 0;
    }
  
    .url-input:focus {
      outline: none;
    }
  
    .submit-button {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-prime);
      color: var(--color-text-on-dark);
      border: none;
      border-radius: var(--rounded-md);
      width: 36px;
      height: 36px;
      cursor: pointer;
      transition: all var(--transition-duration-normal);
    }
  
    .submit-button:hover:not(:disabled) {
      transform: scale(1.05);
      background: var(--color-second);
    }
  
    .submit-button:disabled {
      background: var(--color-disabled);
      cursor: not-allowed;
    }
  
    .url-type-indicator {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      padding-left: var(--spacing-md);
    }
  
    @media (prefers-color-scheme: dark) {
      .input-container {
        background: var(--color-background);
      }
  
      .url-input {
        color: var(--color-text-on-dark);
      }
    }
  
    @media (max-width: 640px) {
      .url-input {
        font-size: var(--font-size-sm);
      }
  
      .submit-button {
        width: 32px;
        height: 32px;
      }
    }
  </style>