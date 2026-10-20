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
  optimizeDeps: {
    // Importate solo dal worker Excel, che lo scanner di Vite non esplora: senza questa riga in sviluppo
    // vengono scoperte al primo uso e Vite ricarica la pagina, interrompendo la conversione (e gli e2e)
    include: ['xlsx', 'fflate'],
  },
});
