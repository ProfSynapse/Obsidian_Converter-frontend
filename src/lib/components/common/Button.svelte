<!-- src/lib/components/common/Button.svelte -->
<!-- Reusable button component -->

<script>
    export let type = 'button';
    export let disabled = false;
  </script>
  
  <button {type} {disabled} on:click>
    <slot></slot>
  </button>
  
  <style>
    button {
      padding: 0.5em 1em;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
    }
  
    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  </style>