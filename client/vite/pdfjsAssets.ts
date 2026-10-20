import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import type { Plugin } from 'vite';

const PUBLIC_PATH = '/pdfjs/cmaps/';
const require = createRequire(import.meta.url);
const cmapsDir = join(dirname(require.resolve('pdfjs-dist/package.json')), 'cmaps');

/**
 * Serve (in dev) ed emette (in build) le CMap di PDF.js dalla nostra origine,
 * così l'estrazione del testo non dipende da CDN esterni.
 */
export const pdfjsAssets = (): Plugin => ({
  name: 'pdfjs-assets',
  configureServer(server) {
    server.middlewares.use(PUBLIC_PATH, (req, res, next) => {
      const name = decodeURIComponent((req.url ?? '').split('?')[0]!.replace(/^\//, ''));
      if (!/^[\w.-]+\.bcmap$/.test(name)) return next();
      try {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.end(readFileSync(join(cmapsDir, name)));
      } catch {
        next();
      }
    });
  },
  generateBundle() {
    for (const name of readdirSync(cmapsDir).filter((file) => file.endsWith('.bcmap'))) {
      this.emitFile({ type: 'asset', fileName: `pdfjs/cmaps/${name}`, source: readFileSync(join(cmapsDir, name)) });
    }
  },
});
