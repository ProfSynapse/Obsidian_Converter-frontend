<!-- src/lib/components/ApiKeyInput.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { uploadStore } from '../../stores/uploadStore';
  import { validateApiKey } from '../../utils/validators.js'; // Ensure correct path

  const dispatch = createEventDispatcher();
  let apiKey = '';
  let showApiKey = false; // To toggle visibility
  let errorMessage = '';

  function handleInput(event) {
      apiKey = event.target.value;
      // Clear previous error message on input
      errorMessage = '';
  }

  function handleSubmit() {
      try {
          validateApiKey(apiKey);
          dispatch('submitApiKey', { apiKey });
          // Clear input after submission if desired
          uploadStore.setApiKey(apiKey);
      } catch (error) {
          errorMessage = error.message;
      }
  }

  function toggleShowApiKey() {
      showApiKey = !showApiKey;
  }
</script>

<div class="api-key-input-section">
  <div class="input-container">
      <input
          type={showApiKey ? 'text' : 'password'}
          class="api-key-input"
          placeholder="Enter your API Key"
          value={apiKey}
          on:input={handleInput}
          on:keypress={(e) => e.key === 'Enter' && handleSubmit()}
          aria-describedby="api-key-error"
      />

      <button 
          type="button"
          class="toggle-button"
          on:click={toggleShowApiKey}
          aria-label={showApiKey ? 'Hide API Key' : 'Show API Key'}
      >
          {#if showApiKey}
              👁️
          {:else}
              🙈
          {/if}
      </button>

      <button 
          class="submit-button"
          on:click={handleSubmit}
          disabled={!apiKey.trim()}
          title="Submit API Key"
      >
          <span class="icon">✔️</span>
      </button>
  </div>

  {#if errorMessage}
      <div id="api-key-error" class="error-message">
          {errorMessage}
      </div>
  {/if}

  <div class="api-key-indicator">
      Securely store your API key to access conversion services.
  </div>
</div>

<style>
  .api-key-input-section {
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

  .api-key-input {
      flex: 1;
      border: none;
      background: transparent;
      padding: var(--spacing-sm);
      font-size: var(--font-size-base);
      color: var(--color-text);
      min-width: 0;
  }

  .api-key-input:focus {
      outline: none;
  }

  .toggle-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: var(--spacing-sm);
      font-size: var(--font-size-lg);
      margin-right: var(--spacing-sm);
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

  .error-message {
      color: var(--color-error);
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-xs);
  }

  .api-key-indicator {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      padding-left: var(--spacing-md);
  }

  @media (prefers-color-scheme: dark) {
      .input-container {
          background: var(--color-background);
      }

      .api-key-input {
          color: var(--color-text-on-dark);
      }
  }

  @media (max-width: 640px) {
      .api-key-input {
          font-size: var(--font-size-sm);
      }

      .submit-button {
          width: 32px;
          height: 32px;
      }
  }
</style>
