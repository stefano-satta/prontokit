import type { Page } from '@playwright/test';

/** Apre l'elenco "Tools" della navigazione principale (stesso comportamento su desktop e mobile). */
export async function openTools(page: Page) {
  const tools = page.getByRole('navigation').getByRole('button', { name: 'Tools' });
  if ((await tools.getAttribute('aria-expanded')) !== 'true') await tools.click();
}
