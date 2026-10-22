import { describe, expect, it } from 'vitest';
import { EMPTY_META_TAGS } from '../src/lib/meta-tags/emptyMetaTags';
import { buildMetaTags, normalizeKeywords } from '../src/lib/meta-tags/buildMetaTags';
import { LENGTH_LIMITS, lengthStatus } from '../src/lib/meta-tags/lengthLimits';
import { twitterHandle, validateMetaTags } from '../src/lib/meta-tags/validateMetaTags';
import type { MetaTagsInput } from '../src/models/metaTags';

const input = (values: Partial<MetaTagsInput>): MetaTagsInput => ({ ...EMPTY_META_TAGS, ...values });

describe('lengthStatus', () => {
  it('è ok solo dentro l\'intervallo, estremi inclusi', () => {
    const { title, description } = LENGTH_LIMITS;
    expect(lengthStatus('   ', title)).toBe('empty');
    expect(lengthStatus('a'.repeat(49), title)).toBe('short');
    expect(lengthStatus('a'.repeat(50), title)).toBe('ok');
    expect(lengthStatus('a'.repeat(60), title)).toBe('ok');
    expect(lengthStatus('a'.repeat(61), title)).toBe('long');
    expect(lengthStatus('a'.repeat(144), description)).toBe('short');
    expect(lengthStatus('a'.repeat(145), description)).toBe('ok');
    expect(lengthStatus('a'.repeat(160), description)).toBe('ok');
    expect(lengthStatus('a'.repeat(161), description)).toBe('long');
  });

  it('conta gli spazi ripetuti una volta sola', () => {
    expect(lengthStatus(`${'a'.repeat(30)}    ${'a'.repeat(29)}`, LENGTH_LIMITS.title)).toBe('ok');
  });
});

describe('normalizeKeywords', () => {
  it('toglie vuoti e doppioni', () => {
    expect(normalizeKeywords(' seo, SEO ,, meta tag,  google ')).toBe('seo, meta tag, google');
  });
});

describe('validateMetaTags', () => {
  it('accetta i campi vuoti e segnala solo i formati sbagliati', () => {
    expect(validateMetaTags(input({ ogLocale: '' }))).toEqual({});
    const errors = validateMetaTags(
      input({ canonicalUrl: 'ftp://x.it', ogImage: 'not a url', ogLocale: 'italiano', twitterSite: '@nome con spazi' }),
    );
    expect(Object.keys(errors).sort()).toEqual(['canonicalUrl', 'ogImage', 'ogLocale', 'twitterSite']);
  });

  it('normalizza i nomi utente di X', () => {
    expect(twitterHandle('prontokit')).toBe('@prontokit');
    expect(twitterHandle('@prontokit')).toBe('@prontokit');
    expect(twitterHandle('@troppo_lungo_per_x')).toBeNull();
  });
});

describe('buildMetaTags', () => {
  it('senza dati non genera niente', () => {
    expect(buildMetaTags(EMPTY_META_TAGS)).toBe('');
  });

  it('genera i tag della pagina e riprende titolo, descrizione e URL in Open Graph e X', () => {
    const html = buildMetaTags(
      input({
        title: 'Scarpe & stivali',
        description: 'Le "migliori" scarpe',
        keywords: 'scarpe, stivali',
        author: 'Mario Rossi',
        canonicalUrl: 'esempio.it/scarpe',
        ogImage: 'https://esempio.it/a.jpg',
        twitterSite: 'negozio',
      }),
    );
    expect(html).toContain('<title>Scarpe &amp; stivali</title>');
    expect(html).toContain('<meta name="description" content="Le &quot;migliori&quot; scarpe">');
    expect(html).toContain('<meta name="keywords" content="scarpe, stivali">');
    expect(html).toContain('<meta name="author" content="Mario Rossi">');
    expect(html).toContain('<link rel="canonical" href="https://esempio.it/scarpe">');
    expect(html).toContain('<meta property="og:title" content="Scarpe &amp; stivali">');
    expect(html).toContain('<meta property="og:url" content="https://esempio.it/scarpe">');
    expect(html).toContain('<meta property="og:locale" content="it_IT">');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
    expect(html).toContain('<meta name="twitter:site" content="@negozio">');
    expect(html).toContain('<meta name="twitter:image" content="https://esempio.it/a.jpg">');
  });

  it('usa i valori di Open Graph se compilati e scarta i campi non validi', () => {
    const html = buildMetaTags(input({ title: 'Pagina', ogTitle: 'Titolo social', canonicalUrl: 'non valido', ogImageAlt: 'Alt' }));
    expect(html).toContain('<meta property="og:title" content="Titolo social">');
    expect(html).toContain('<meta name="twitter:title" content="Titolo social">');
    expect(html).not.toContain('canonical');
    expect(html).not.toContain('og:url');
    // Il testo alternativo senza immagine non serve
    expect(html).not.toContain('image:alt');
  });
});
