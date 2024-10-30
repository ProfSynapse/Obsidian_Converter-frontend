<!-- src/lib/components/ApiKeyInput.svelte -->
<script>
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { apiKey } from '$lib/stores/apiKey';
  
  let apiKeyInput = '';
  let isVisible = false;
  let isFocused = false;
  let isValid = false;
  let isDirty = false;
  
  // Validation function
  function validateApiKey(key) {
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

<div
  class="card api-key-card animate-fade-in"
  class:is-valid={isValid}
  class:is-invalid={isDirty && !isValid}
>
  <div class="card-header">
    <h2 class="section-title">
      <span class="icon">🔑</span>
      API Key
    </h2>
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
      Need an API key? Get one from
      <a
        href="https://platform.openai.com/api-keys"
        target="_blank"
        rel="noopener noreferrer"
        class="link"
      >
        OpenAI API Keys <span class="icon">↗️</span>
      </a>
    </p>
  </div>
</div>

<style>
  /* Utilize the global .card class for consistent styling */
  .api-key-card {
    /* Remove any fixed width to align with parent container */
    width: 100%;
  }

  .input-container {
    margin-top: var(--spacing-md);
    position: relative;
  }

  .input-wrapper {
    position: relative;
    width: 100%;
  }

  .input {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    padding-right: 2.5rem; /* Space for the toggle button */
    font-size: var(--font-size-base);
    border: 1px solid var(--color-border);
    border-radius: var(--rounded-md);
    transition: all var(--transition-duration-normal) var(--transition-timing-ease);
    box-sizing: border-box; /* Ensure padding is included in width */
  }

  .input:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(147, 39, 143, 0.1);
  }

  .visibility-toggle {
    position: absolute;
    top: 50%;
    right: var(--spacing-xs);
    transform: translateY(-50%);
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-size: var(--font-size-lg);
    color: var(--color-text-secondary);
    transition: color var(--transition-duration-normal) var(--transition-timing-ease);
  }

  .visibility-toggle:hover {
    color: var(--color-prime);
  }

  /* Error Message Styling */
  .error-message {
    margin-top: var(--spacing-2xs);
    color: var(--color-error);
    font-size: var(--font-size-sm);
  }

  /* Help Text Styling */
  .help-text {
    margin-top: var(--spacing-md);
    text-align: center;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .help-text .link {
    color: var(--color-prime);
    text-decoration: none;
    transition: color var(--transition-duration-normal) var(--transition-timing-ease);
  }

  .help-text .link:hover {
    color: var(--color-second);
  }

  /* Responsive Design */
  @media (max-width: 640px) {
    .input-container {
      margin-top: var(--spacing-sm);
    }

    .input {
      padding: var(--spacing-2xs) var(--spacing-xs);
      padding-right: 2rem;
      font-size: var(--font-size-sm);
    }

    .visibility-toggle {
      right: var(--spacing-2xs);
      font-size: var(--font-size-md);
    }

    .error-message {
      font-size: var(--font-size-xs);
    }

    .help-text {
      font-size: var(--font-size-xs);
    }
  }
</style>
