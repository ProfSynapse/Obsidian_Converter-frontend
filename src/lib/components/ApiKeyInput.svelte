<script>
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { apiKey } from '$lib/stores/apiKey';
  
  // Component state
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
  /* Your existing styles */
</style>
