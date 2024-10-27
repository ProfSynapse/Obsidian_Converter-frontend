<script>
  import { onMount } from 'svelte';
  import '$lib/styles/global.css';
  
  // Add smooth scroll behavior
  onMount(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
  });
</script>

<svelte:head>
  <!-- Meta tags for better SEO and mobile display -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#00a99d">
  
  <!-- Preload critical fonts -->
  <link 
    rel="preload" 
    href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
    as="style"
    onload="this.onload=null;this.rel='stylesheet'"
  >
</svelte:head>

<!-- App Shell -->
<div class="app-shell">
  <!-- Enhanced Header Section -->
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

  <!-- Main Content Section -->
  <main class="main-container animate-fade-in">
    <div class="content-wrapper">
      <slot />
    </div>
  </main>

  <!-- Footer - Optional but adds completeness -->
  <footer class="footer">
    <div class="footer-container">
      <p class="footer-text">Files will be converted to Markdown and downloaded as a ZIP file</p>
    </div>
  </footer>
</div>

<style>
  /* App Shell */
  .app-shell {
    min-height: 100vh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    background: var(--gradient-primary);
    background-size: 200% 200%;
    animation: gradient-shift 15s ease infinite;
  }

  /* Enhanced Header Styles */
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

  .icon {
    font-size: 1.2em;
    display: inline-block;
    transform-origin: center;
    animation: bounce 2s infinite var(--transition-timing-bounce);
  }

  .header-backdrop {
    position: absolute;
    inset: 0;
    background: var(--gradient-primary);
    opacity: 0.1;
    z-index: -1;
  }

  /* Main Content Styles */
  .main-container {
    width: 100%;
    margin: 0 auto;
    padding: var(--spacing-xl) var(--spacing-md);
    position: relative;
    z-index: var(--z-elevate);
  }

  .content-wrapper {
    max-width: var(--content-width-lg);
    margin: 0 auto;
    position: relative;
  }

  /* Footer Styles */
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

  /* Gradient Animation */
  @keyframes gradient-shift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  /* Responsive Styles */
  @media (max-width: 1024px) {
    .site-title {
      font-size: var(--font-size-xl);
    }
  }

  @media (max-width: 768px) {
    .header {
      padding: var(--spacing-sm) 0;
    }

    .main-container {
      padding: var(--spacing-lg) var(--spacing-sm);
    }

    .site-title {
      font-size: var(--font-size-lg);
    }
  }

  @media (max-width: 640px) {
    .site-title {
      flex-direction: column;
      gap: var(--spacing-2xs);
    }

    .main-container {
      padding: var(--spacing-md) var(--spacing-xs);
    }
  }

  /* Print Styles */
  @media print {
    .app-shell {
      background: none;
    }

    .header {
      background: none;
      border-bottom: 1px solid #ddd;
    }

    .site-title {
      color: var(--color-text-primary);
    }
  }
</style>