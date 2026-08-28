import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: 'app',
  publicDir: 'public',
  build: {
    outDir: resolve(__dirname, 'dist/app'),
    emptyOutDir: true,
    target: 'es2022',
  },
  clearScreen: false,
  server: { port: 1420, strictPort: true },
  envPrefix: ['VITE_', 'TAURI_'],
});
