import type { FooterLink } from '../models/footerLink';

/**
 * Menu di destra del footer e relative route, fuori dalla navbar.
 * Per aggiungere una pagina basta una voce con `loadPage`.
 */
export const FOOTER_LINKS: readonly FooterLink[] = [
  { label: 'About', path: '/about', loadPage: () => import('../pages/AboutPage') },
  { label: 'Privacy', path: '/privacy', loadPage: () => import('../pages/PrivacyPage') },
  { label: 'Termini e condizioni', path: '/termini', loadPage: () => import('../pages/TermsPage') },
];
