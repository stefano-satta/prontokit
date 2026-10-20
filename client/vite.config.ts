import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { contentSecurityPolicy } from './vite/contentSecurityPolicy.ts';
import { pdfjsAssets } from './vite/pdfjsAssets.ts';

export default defineConfig({
  plugins: [react(), tailwindcss(), pdfjsAssets(), contentSecurityPolicy()],
  server: {
    port: 5173,
    strictPort: true,
  },
});
