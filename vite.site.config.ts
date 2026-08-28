import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: 'site',
  publicDir: 'public',
  build: {
    outDir: resolve(__dirname, 'dist/site'),
    emptyOutDir: true,
    target: 'es2022',
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'site/index.html'),
        privacy: resolve(__dirname, 'site/privacy/index.html'),
        terms: resolve(__dirname, 'site/terms/index.html'),
      },
    },
  },
});
