import { defineConfig } from 'vite';

export default defineConfig({
  root: 'site',
  publicDir: 'public',
  build: {
    outDir: '../dist/site',
    emptyOutDir: true,
    target: 'es2022',
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        home: 'index.html',
        notFound: '404.html',
        demo: 'demo/index.html',
        privacy: 'privacy/index.html',
        terms: 'terms/index.html',
      },
    },
  },
});
