import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.svelte']
  },
  optimizeDeps: {
    include: ['@smui/button', '@smui/textfield', '@smui/linear-progress', 'file-saver']
  },
  build: {
    commonjsOptions: {
      include: [/file-saver/, /node_modules/]
    }
  }
});
