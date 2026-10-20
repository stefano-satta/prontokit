import type { Plugin } from 'vite';

/**
 * CSP restrittiva per la build di produzione: nessuno script o connessione verso origini esterne,
 * quindi i documenti caricati non possono essere esfiltrati da codice di terze parti.
 * In sviluppo non si applica perché Vite inietta script inline per l'HMR.
 */
const POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

export const contentSecurityPolicy = (): Plugin => ({
  name: 'content-security-policy',
  apply: 'build',
  transformIndexHtml: () => [
    { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: POLICY }, injectTo: 'head-prepend' },
  ],
});
