import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const pkg = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), 'utf-8')
);

export default defineConfig({
  plugins: [react()],
  base: '/trading-copilot/',
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(
      process.env.VITE_APP_VERSION ?? pkg.version
    ),
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
