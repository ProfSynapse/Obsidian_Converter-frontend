<!-- src/lib/components/common/Input.svelte -->
<!-- Reusable input component -->

<script>
    export let type = 'text';
    export let value = '';
    export let placeholder = '';
  </script>
  
  {#if type === 'text'}
    <input type="text" bind:value {placeholder} on:input>
  {:else if type === 'password'}
    <input type="password" bind:value {placeholder} on:input>
  {:else if type === 'email'}
    <input type="email" bind:value {placeholder} on:input>
  {:else if type === 'number'}
    <input type="number" bind:value {placeholder} on:input>
  {:else}
    <input type="text" bind:value {placeholder} on:input>
  {/if}
  
  <style>
    input {
      padding: 0.5em;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1em;
      width: 100%;
    }
  </style>