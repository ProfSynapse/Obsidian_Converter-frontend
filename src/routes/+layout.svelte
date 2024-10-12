<!-- src/routes/+layout.svelte -->
<svelte:head>
  <!-- Import Montserrat font and apply gradient background -->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap');

    :root {
      --color-prime: #00a99d;
      --color-second: #93278f;
      --color-text: #333333;
      --color-background: #ffffff;
      --rounded-corners: 8px;
      --transition-speed: 0.3s;
    }

    body {
        margin: 0;
        font-family: 'Montserrat', sans-serif;
        background: linear-gradient(135deg, var(--color-prime), var(--color-second)) no-repeat;
        background-size: cover;
        color: var(--color-text);
        }

  </style>
</svelte:head>

<!-- Header Section -->
<header class="header">
  <div class="header-container">
    <h1>Obsidian Note Converter</h1>
  </div>
</header>

<!-- Main Content -->
<main class="main-container">
  <slot />
</main>

<style>
  .header {
    background-color: var(--color-prime);
    padding: 20px 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .header-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .header h1 {
    margin: 0;
    color: white;
    text-align: center;
    font-family: 'Montserrat', sans-serif;
    font-weight: 600;
  }

  .main-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
</style>
