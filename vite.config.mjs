import { cp } from 'node:fs/promises';
import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: false,
  plugins: [{
    name: 'copy-stylo-media',
    apply: 'build',
    closeBundle: async () => cp('media', 'dist/media', { recursive: true }),
  }],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
