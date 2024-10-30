<!-- src/lib/components/ApiKeyInput.svelte -->
<script>
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { apiKey } from '$lib/stores/apiKey';
  import { files } from '$lib/stores/files';
  
  let apiKeyInput = '';
  let isVisible = false;
  let isFocused = false;
  let isValid = false;
  let isDirty = false;
  
  // Media types that require API key
  const API_REQUIRED_TYPES = ['mp3', 'wav', 'ogg', 'mp4', 'mov', 'avi', 'webm'];
  
  // Check if there are any media files that require API key
  $: hasMediaFiles = $files.some(file => 
    API_REQUIRED_TYPES.includes(file.type)
  );

  // Compute whether API key is required
  $: apiKeyRequired = hasMediaFiles;
  
  // Validation function
  function validateApiKey(key) {
    // Only validate if API key is required
    if (!apiKeyRequired) return true;
    return key && key.length >= 32;
  }
  
  // Handle input changes
  function handleInput(event) {
    const value = event.target.value;
    isDirty = true;
    isValid = validateApiKey(value);
    
    if (value !== $apiKey) {
      apiKey.set(value);
      if (value) {
        localStorage.setItem('apiKey', value);
      } else {
        localStorage.removeItem('apiKey');
      }
    }
  }
  
  // Toggle password visibility
  function toggleVisibility() {
    isVisible = !isVisible;
  }
  
  // Initialize from localStorage
  onMount(() => {
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiKey) {
      apiKeyInput = storedApiKey;
      apiKey.set(storedApiKey);
      isValid = validateApiKey(storedApiKey);
      isDirty = true;
    }
  });
</script>

{#if apiKeyRequired}
  <div
    class="card api-key-card animate-fade-in"
    class:is-valid={isValid}
    class:is-invalid={isDirty && !isValid}
    in:fade
  >
    <div class="card-header">
      <h2 class="section-title">
        <span class="icon">🔑</span>
        OpenAI API Key Required
      </h2>
    </div>

    <div class="explanation-text">
      <p>
        An OpenAI API key is required for transcribing audio and video files.
        Text-based files do not require an API key.
      </p>
      <p class="file-types">
        Required for: <span class="highlight">Audio files (.mp3, .wav, .ogg)</span> and 
        <span class="highlight">Video files (.mp4, .mov, .avi, .webm)</span>
      </p>
    </div>

    <div class="input-container" class:is-focused={isFocused}>
      <div class="input-wrapper">
        {#if isVisible}
          <input
            type="text"
            bind:value={apiKeyInput}
            on:input={handleInput}
            on:focus={() => isFocused = true}
            on:blur={() => isFocused = false}
            placeholder="Enter your OpenAI API key"
            class="input"
            class:is-valid={isValid}
            class:is-invalid={isDirty && !isValid}
          />
        {:else}
          <input
            type="password"
            bind:value={apiKeyInput}
            on:input={handleInput}
            on:focus={() => isFocused = true}
            on:blur={() => isFocused = false}
            placeholder="Enter your OpenAI API key"
            class="input"
            class:is-valid={isValid}
            class:is-invalid={isDirty && !isValid}
          />
        {/if}
        <button
          type="button"
          class="visibility-toggle"
          on:click={toggleVisibility}
          aria-label={isVisible ? 'Hide API key' : 'Show API key'}
        >
          <span class="icon">
            {#if isVisible}
              👁️
            {:else}
              🔒
            {/if}
          </span>
        </button>
      </div>

      {#if isDirty && !isValid}
        <div class="error-message" transition:fly={{ y: -10, duration: 200 }}>
          API key should be at least 32 characters long
        </div>
      {/if}
    </div>

    <div class="help-text">
      <p class="text-muted">
        Get your API key from
        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          class="link"
        >
          OpenAI API Keys <span class="icon">↗️</span>
        </a>
        <span class="pricing-info">
          (Transcription costs approximately $0.006 per minute)
        </span>
      </p>
    </div>
  </div>
{/if}

<style>
  .api-key-card {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .section-title {
    font-size: var(--font-size-lg);
    margin: 0;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .explanation-text {
    font-size: var(--font-size-sm);
    color: var(--color-text-light);
  }

  .file-types {
    margin-top: var(--spacing-xs);
  }

  .highlight {
    color: var(--color-prime);
    font-weight: 500;
  }

  .input-container {
    width: 100%;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input {
    width: 100%;
    padding-right: 40px;
  }

  .input.is-valid {
    border-color: var(--color-success);
  }

  .input.is-invalid {
    border-color: var(--color-error);
  }

  .visibility-toggle {
    position: absolute;
    right: var(--spacing-xs);
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    padding: var(--spacing-xs);
    cursor: pointer;
    color: var(--color-text-light);
  }

  .visibility-toggle:hover {
    color: var(--color-text);
  }

  .error-message {
    margin-top: var(--spacing-xs);
    color: var(--color-error);
    font-size: var(--font-size-sm);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .help-text {
    font-size: var(--font-size-sm);
    color: var(--color-text-light);
  }

  .link {
    color: var(--color-prime);
    text-decoration: none;
  }

  .link:hover {
    text-decoration: underline;
  }

  .pricing-info {
    display: block;
    margin-top: var(--spacing-xs);
    font-size: var(--font-size-xs);
    color: var(--color-text-light);
    opacity: 0.8;
  }

  @media (max-width: 640px) {
    .api-key-card {
      gap: var(--spacing-sm);
    }

    .section-title {
      font-size: var(--font-size-base);
    }

    .file-types {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }
  }
</style>