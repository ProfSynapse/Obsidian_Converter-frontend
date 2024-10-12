<!-- src/lib/components/ApiKeyInput.svelte -->
<script>
    import { onMount } from 'svelte';
    import { apiKey } from '$lib/stores/apiKey';
  
    $: apiKeyInput = $apiKey || '';
  
    onMount(() => {
      const storedApiKey = localStorage.getItem('apiKey');
      if (storedApiKey) {
        apiKey.set(storedApiKey);
      }
    });
  
    $: if (apiKeyInput !== $apiKey) {
      apiKey.set(apiKeyInput);
      if (apiKeyInput) {
        localStorage.setItem('apiKey', apiKeyInput);
      } else {
        localStorage.removeItem('apiKey');
      }
    }
  </script>
  
  <section class="api-key-section">
    <h2>API Key</h2>
    <div class="api-key-input">
      <input
        type="password"
        bind:value={apiKeyInput}
        placeholder="Enter your API key"
        class="input"
      />
      <p class="api-key-info">
        Don't have an API key? Get one from
        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
          OpenAI API Keys
        </a>.
      </p>
    </div>
  </section>
  
  <style>
    .api-key-section {
      border: 2px solid var(--color-prime);
      padding: 20px;
      border-radius: var(--rounded-corners);
      margin-bottom: 20px;
      background-color: rgba(255, 255, 255, 0.9);
    }
  
    h2 {
      color: var(--color-prime);
      margin-bottom: 15px;
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
    }
  
    .api-key-input {
      margin-bottom: 15px;
    }
  
    .input {
      width: 100%;
      padding: 10px;
      border: 2px solid var(--color-prime);
      border-radius: var(--rounded-corners);
      font-size: 1rem;
      outline: none;
      transition: border-color var(--transition-speed);
      box-sizing: border-box;
    }
  
    .input:focus {
      border-color: var(--color-second);
    }
  
    .api-key-info {
      margin-top: 10px;
      font-size: 0.9rem;
    }
  
    .api-key-info a {
      color: var(--color-prime);
      text-decoration: underline;
    }
  
    .api-key-info a:hover {
      color: var(--color-second);
    }
  </style>
  