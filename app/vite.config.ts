import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/trading-copilot/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
