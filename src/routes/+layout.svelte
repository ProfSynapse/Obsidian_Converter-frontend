<!-- src/routes/+layout.svelte -->
<script>
  import { onMount } from 'svelte';
  import { apiKey } from '$lib/stores';
  import { COLORS } from '$lib/constants.js';
  import '$lib/styles/global.css';

  onMount(() => {
      const storedApiKey = localStorage.getItem('obsidian_note_converter_api_key');
      if (storedApiKey) apiKey.set(storedApiKey);
  });
</script>

<div class="app">
  <header>
      <h1>Obsidian Note Converter</h1>
  </header>

  <main>
      <slot></slot>
  </main>

  <footer>
      <p>© {new Date().getFullYear()} Obsidian Note Converter. All rights reserved.</p>
  </footer>
</div>

<style>
  .app {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: var(--color-third);
      color: var(--color-text);
      font-family: 'Montserrat', sans-serif;
  }

  header {
      background-color: var(--color-prime);
      color: white;
      padding: 1rem;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  h1 {
      margin: 0;
      font-size: 1.5rem;
  }

  main {
      flex: 1;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
  }

  footer {
      background-color: var(--color-second);
      color: white;
      text-align: center;
      padding: 1rem;
      font-size: 0.8rem;
  }

  @media (max-width: 768px) {
      main {
          padding: 1rem;
      }
  }
</style>