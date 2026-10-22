import { RotateCcw, Tags } from 'lucide-react';
import { Button } from '../components/common/Button';
import { PageHeader } from '../components/common/PageHeader';
import { PrivacyNote } from '../components/common/PrivacyNote';
import { SegmentedControl, type SegmentedOption } from '../components/common/SegmentedControl';
import { TextAreaField } from '../components/common/TextAreaField';
import { TextField } from '../components/common/TextField';
import { CharacterCounter } from '../components/features/meta-tags/CharacterCounter';
import { GeneratedTags } from '../components/features/meta-tags/GeneratedTags';
import { MetaTagsSection } from '../components/features/meta-tags/MetaTagsSection';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMetaTags } from '../hooks/useMetaTags';
import { LENGTH_LIMITS } from '../lib/meta-tags/lengthLimits';
import type { OgType, TwitterCardType } from '../models/metaTags';

const OG_TYPES: readonly SegmentedOption<OgType>[] = [
  { value: 'website', label: 'Sito web' },
  { value: 'article', label: 'Articolo' },
];

const TWITTER_CARDS: readonly SegmentedOption<TwitterCardType>[] = [
  { value: 'summary_large_image', label: 'Immagine grande' },
  { value: 'summary', label: 'Riepilogo' },
];

export default function MetaTagsPage() {
  useDocumentTitle('Generatore di meta tag SEO');
  const { input, errors, html, isEmpty, setField, reset } = useMetaTags();
  const ogTitleFallback = input.title.trim() || 'Uguale al titolo della pagina';
  const ogDescriptionFallback = input.description.trim() || 'Uguale alla meta description';

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <PageHeader
          icon={Tags}
          title="Generatore di meta tag SEO"
          description="Compila i dati della pagina: titolo, descrizione, Open Graph e card di X diventano tag HTML pronti da copiare nel <head>."
        />
        <PrivacyNote
          title="I dati restano nel tuo dispositivo."
          description="I tag vengono composti nel browser: niente viene salvato né inviato."
        />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex justify-end">
          <Button
            variant="ghost"
            onClick={reset}
            disabled={isEmpty}
            icon={<RotateCcw className="size-4" aria-hidden />}
          >
            Svuota il modulo
          </Button>
        </div>

        <MetaTagsSection title="Pagina" description="I tag letti da Google e dagli altri motori di ricerca.">
          <TextField
            label="Page title"
            aside={<CharacterCounter value={input.title} range={LENGTH_LIMITS.title} />}
            hint={`Consigliati da ${LENGTH_LIMITS.title.min} a ${LENGTH_LIMITS.title.max} caratteri: più lungo, Google rischia di troncarlo nei risultati.`}
            value={input.title}
            onChange={(event) => setField('title', event.target.value)}
            placeholder="Scarpe da trekking leggere | Negozio Rossi"
          />
          <TextAreaField
            label="Meta description"
            aside={<CharacterCounter value={input.description} range={LENGTH_LIMITS.description} />}
            hint={`Consigliati da ${LENGTH_LIMITS.description.min} a ${LENGTH_LIMITS.description.max} caratteri: più lunga, Google rischia di troncarla nei risultati.`}
            value={input.description}
            onChange={(event) => setField('description', event.target.value)}
            placeholder="Scopri le scarpe da trekking leggere e impermeabili, con spedizione gratuita in 24 ore."
          />
          <TextField
            label="Keywords"
            optional
            hint="Separate da virgola. Google non le usa per il posizionamento, altri motori sì."
            value={input.keywords}
            onChange={(event) => setField('keywords', event.target.value)}
            placeholder="scarpe da trekking, trekking leggero, impermeabili"
          />
          <div className="grid gap-5 @lg:grid-cols-2">
            <TextField
              label="Autore"
              optional
              value={input.author}
              onChange={(event) => setField('author', event.target.value)}
              placeholder="Mario Rossi"
            />
            <TextField
              label="Canonical URL"
              optional
              type="url"
              inputMode="url"
              error={errors.canonicalUrl}
              value={input.canonicalUrl}
              onChange={(event) => setField('canonicalUrl', event.target.value)}
              placeholder="https://esempio.it/scarpe"
            />
          </div>
        </MetaTagsSection>

        <MetaTagsSection
          title="Open Graph"
          description="L'anteprima del link su Facebook, LinkedIn, WhatsApp e simili. I campi vuoti riprendono quelli della pagina."
        >
          <SegmentedControl legend="Tipo (og:type)" options={OG_TYPES} value={input.ogType} onChange={(value) => setField('ogType', value)} />
          <TextField
            label="Titolo (og:title)"
            optional
            value={input.ogTitle}
            onChange={(event) => setField('ogTitle', event.target.value)}
            placeholder={ogTitleFallback}
          />
          <TextAreaField
            label="Descrizione (og:description)"
            optional
            value={input.ogDescription}
            onChange={(event) => setField('ogDescription', event.target.value)}
            placeholder={ogDescriptionFallback}
          />
          <div className="grid gap-5 @lg:grid-cols-2">
            <TextField
              label="URL (og:url)"
              optional
              type="url"
              inputMode="url"
              error={errors.ogUrl}
              value={input.ogUrl}
              onChange={(event) => setField('ogUrl', event.target.value)}
              placeholder={input.canonicalUrl.trim() || 'Uguale al canonical URL'}
            />
            <TextField
              label="Nome del sito (og:site_name)"
              optional
              value={input.ogSiteName}
              onChange={(event) => setField('ogSiteName', event.target.value)}
              placeholder="Negozio Rossi"
            />
          </div>
          <TextField
            label="Immagine (og:image)"
            optional
            type="url"
            inputMode="url"
            hint="URL assoluto dell'immagine; consigliata 1200 × 630 px."
            error={errors.ogImage}
            value={input.ogImage}
            onChange={(event) => setField('ogImage', event.target.value)}
            placeholder="https://esempio.it/img/scarpe.jpg"
          />
          <div className="grid gap-5 @lg:grid-cols-2">
            <TextField
              label="Testo alternativo dell'immagine"
              optional
              hint={input.ogImage.trim() ? undefined : 'Serve solo se indichi un’immagine.'}
              value={input.ogImageAlt}
              onChange={(event) => setField('ogImageAlt', event.target.value)}
              placeholder="Scarpa da trekking grigia vista di lato"
            />
            <TextField
              label="Lingua (og:locale)"
              optional
              error={errors.ogLocale}
              value={input.ogLocale}
              onChange={(event) => setField('ogLocale', event.target.value)}
              placeholder="it_IT"
            />
          </div>
        </MetaTagsSection>

        <MetaTagsSection
          title="Twitter / X card"
          description="Titolo, descrizione e immagine riprendono quelli di Open Graph."
        >
          <SegmentedControl
            legend="Tipo di card (twitter:card)"
            options={TWITTER_CARDS}
            value={input.twitterCard}
            onChange={(value) => setField('twitterCard', value)}
          />
          <div className="grid gap-5 @lg:grid-cols-2">
            <TextField
              label="Account del sito (twitter:site)"
              optional
              error={errors.twitterSite}
              value={input.twitterSite}
              onChange={(event) => setField('twitterSite', event.target.value)}
              placeholder="@negoziorossi"
            />
            <TextField
              label="Account dell'autore (twitter:creator)"
              optional
              error={errors.twitterCreator}
              value={input.twitterCreator}
              onChange={(event) => setField('twitterCreator', event.target.value)}
              placeholder="@mariorossi"
            />
          </div>
        </MetaTagsSection>

        <GeneratedTags html={html} />
      </div>
    </div>
  );
}
