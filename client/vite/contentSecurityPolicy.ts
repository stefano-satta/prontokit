import type { Plugin } from 'vite';

/**
 * Badge "Powered by Netlify": sul piano gratuito Netlify aggiunge a ogni pagina `/.netlify/scripts/hud`
 * (stessa origine), che disegna il badge in un iframe `srcdoc` con uno script inline. L'iframe eredita
 * questa CSP, quindi lo script inline va consentito con il suo hash (mai 'unsafe-inline').
 * Se Netlify cambia lo script, la console mostra l'errore CSP con il nuovo hash da copiare qui.
 */
const NETLIFY_BADGE_SCRIPT_HASH = "'sha256-BkKP2XO6WOEc3kXOiLr2ZoY83hamalKjPY9xBcbXVuw='";
/** Il modulo "build your own" del badge apre app.netlify.com in una nuova scheda */
const NETLIFY_APP = 'https://app.netlify.com';

/**
 * CSP restrittiva per la build di produzione: nessuno script o connessione verso origini esterne,
 * quindi i documenti caricati non possono essere esfiltrati da codice di terze parti.
 * In sviluppo non si applica perché Vite inietta script inline per l'HMR.
 */
const POLICY = [
  "default-src 'self'",
  `script-src 'self' ${NETLIFY_BADGE_SCRIPT_HASH}`,
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self' ${NETLIFY_APP}`,
].join('; ');

export const contentSecurityPolicy = (): Plugin => ({
  name: 'content-security-policy',
  apply: 'build',
  transformIndexHtml: () => [
    { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: POLICY }, injectTo: 'head-prepend' },
  ],
});
