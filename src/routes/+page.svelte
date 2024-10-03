<script>
  import { onMount } from 'svelte';
  import ObsidianNoteConverter from '$lib/components/ObsidianNoteConverter.svelte';

  let mounted = false;

  onMount(() => {
    mounted = true;
  });
</script>

{#if mounted}
  <main>
    <h1>Obsidian Note Converter</h1>
    <ObsidianNoteConverter />
  </main>
{:else}
  <p>Loading...</p>
{/if}

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>