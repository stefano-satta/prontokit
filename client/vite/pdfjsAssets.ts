import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import type { Plugin } from 'vite';

const require = createRequire(import.meta.url);
const pdfjsDir = dirname(require.resolve('pdfjs-dist/package.json'));

/**
 * Cartelle di PDF.js da servire: CMap per estrarre il testo delle lingue non latine,
 * font standard per disegnare i PDF che usano Helvetica senza incorporarla (anteprima del preventivo).
 */
const ASSETS = [
  { publicPath: '/pdfjs/cmaps/', dir: join(pdfjsDir, 'cmaps'), file: /^[\w.-]+\.bcmap$/ },
  { publicPath: '/pdfjs/standard_fonts/', dir: join(pdfjsDir, 'standard_fonts'), file: /^[\w.-]+\.(pfb|ttf)$/ },
];

/**
 * Serve (in dev) ed emette (in build) gli asset di PDF.js dalla nostra origine,
 * così estrazione del testo e anteprime non dipendono da CDN esterni.
 */
export const pdfjsAssets = (): Plugin => ({
  name: 'pdfjs-assets',
  configureServer(server) {
    for (const { publicPath, dir, file } of ASSETS) {
      server.middlewares.use(publicPath, (req, res, next) => {
        const name = decodeURIComponent((req.url ?? '').split('?')[0]!.replace(/^\//, ''));
        if (!file.test(name)) return next();
        try {
          res.setHeader('Content-Type', 'application/octet-stream');
          res.end(readFileSync(join(dir, name)));
        } catch {
          next();
        }
      });
    }
  },
  generateBundle() {
    for (const { publicPath, dir, file } of ASSETS) {
      for (const name of readdirSync(dir).filter((entry) => file.test(entry))) {
        this.emitFile({ type: 'asset', fileName: `${publicPath.slice(1)}${name}`, source: readFileSync(join(dir, name)) });
      }
    }
  },
});
