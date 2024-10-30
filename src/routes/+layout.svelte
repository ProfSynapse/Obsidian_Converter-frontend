<!-- src/routes/+layout.svelte -->
<script>
  import { onMount } from 'svelte';
  import '$lib/styles/global.css';
  
  onMount(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
  });
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#00a99d">
  <link 
    rel="preload" 
    href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
    as="style"
    onload="this.onload=null;this.rel='stylesheet'"
  >
</svelte:head>

<div class="app-shell">
  <header class="header animate-slide-down">
    <div class="header-container">
      <div class="header-content">
        <h1 class="site-title">
          <span class="icon">📝</span>
          Obsidian Note Converter
        </h1>
      </div>
    </div>
    <div class="header-backdrop"></div>
  </header>

  <main class="main-container animate-fade-in">
    <div class="content-wrapper">
      <slot />
    </div>
  </main>

  <footer class="footer">
    <div class="footer-container">
      <p class="footer-text">Files will be converted to Markdown and downloaded as a ZIP file</p>
    </div>
  </footer>
</div>

<style>
  /* Make sure html and body take full height */
  :global(html), :global(body) {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  /* App Shell */
  .app-shell {
    min-height: 100vh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    background: var(--gradient-primary);
    background-size: 200% 200%;
    background-attachment: fixed;
    animation: gradient-shift 15s ease infinite;
    position: relative;
    overflow-x: hidden;
  }

  /* Main Container */
  .main-container {
    width: 100%;
    padding: var(--spacing-xl) var(--spacing-lg);
    position: relative;
    z-index: var(--z-elevate);
    display: flex;
    justify-content: center;
  }

  .content-wrapper {
    width: 100%;
    max-width: var(--content-width-lg);
    margin: 0 auto;
    position: relative;
  }

  /* Header */
  .header {
    position: relative;
    z-index: var(--z-sticky);
    padding: var(--spacing-md) 0;
    background-color: rgba(0, 169, 157, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .header-container {
    max-width: var(--content-width-xl);
    margin: 0 auto;
    padding: 0 var(--spacing-md);
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .site-title {
    margin: 0;
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-on-dark);
    text-align: center;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* Footer */
  .footer {
    padding: var(--spacing-lg) var(--spacing-md);
    text-align: center;
    position: relative;
    z-index: var(--z-elevate);
  }

  .footer-container {
    max-width: var(--content-width-lg);
    margin: 0 auto;
  }

  .footer-text {
    color: var(--color-text-on-dark);
    font-size: var(--font-size-sm);
    opacity: 0.8;
    margin: 0;
  }

  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .main-container {
      padding: var(--spacing-lg) var(--spacing-md);
    }
  }

  @media (max-width: 640px) {
    .main-container {
      padding: var(--spacing-md);
    }
  }
</style>