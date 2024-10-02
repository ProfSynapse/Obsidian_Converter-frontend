<!-- src/routes/+page.svelte -->
<script>
    import ObsidianNoteConverter from '$lib/components/ObsidianNoteConverter.svelte';
    import logo from '../assets/logo.png';
    import { fly } from 'svelte/transition';
  
    let showInstructions = false;
  
    function toggleInstructions() {
      showInstructions = !showInstructions;
    }
  </script>
  
  <svelte:head>
    <title>Obsidian Note Converter</title>
  </svelte:head>
  
  <main>
    <header>
      <img src={logo} alt="Obsidian Note Converter Logo" class="logo" />
      <h1>Obsidian Note Converter</h1>
    </header>
  
    <button class="instructions-toggle" on:click={toggleInstructions}>
      {showInstructions ? 'Hide' : 'Show'} Instructions
    </button>
  
    {#if showInstructions}
      <div class="instructions" transition:fly="{{ y: -20, duration: 300 }}">
        <h2>How to Use:</h2>
        <ol>
          <li>Enter your OpenAI API key in the designated field.</li>
          <li>Upload one or more files you want to convert by dragging and dropping them into the upload area or clicking to select files.</li>
          <li>Click the "Convert Notes" button to start the conversion process.</li>
          <li>Once conversion is complete, you can download your converted Obsidian-compatible notes individually or as a batch.</li>
        </ol>
        <p>Note: Ensure your API key is kept private and not shared with others.</p>
      </div>
    {/if}
  
    <ObsidianNoteConverter />
  </main>
  
  <style>
    main {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      font-family: 'Montserrat', sans-serif;
    }
  
    header {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2rem;
    }
  
    .logo {
      width: 50px;
      height: auto;
      margin-right: 1rem;
    }
  
    h1 {
      color: var(--primary-color);
      font-size: 2rem;
    }
  
    .instructions-toggle {
      background-color: var(--primary-color);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      margin-bottom: 1rem;
    }
  
    .instructions {
      background-color: #f0f0f0;
      border-radius: 4px;
      padding: 1rem;
      margin-bottom: 2rem;
    }
  
    .instructions h2 {
      color: var(--primary-color);
      margin-top: 0;
    }
  
    .instructions ol {
      padding-left: 1.5rem;
    }
  
    .instructions li {
      margin-bottom: 0.5rem;
    }
  
    .instructions p {
      font-style: italic;
      margin-top: 1rem;
    }
  </style>