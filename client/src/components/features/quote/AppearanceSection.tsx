import { Check, ImagePlus, X } from 'lucide-react';
import { useRef } from 'react';
import { cn } from '../../../lib/cn';
import { IMAGE_ACCEPT } from '../../../lib/image-converter/imageFormats';
import { ACCENT_COLORS } from '../../../lib/quote/accentColors';
import type { AccentColorId, QuoteLogo } from '../../../models/quote';
import { Button } from '../../common/Button';
import { Spinner } from '../../common/Spinner';
import { QuoteSection } from './QuoteSection';

interface AppearanceSectionProps {
  logo: QuoteLogo | null;
  logoError: string | null;
  logoLoading: boolean;
  onLogo: (file: File) => void;
  onRemoveLogo: () => void;
  accentColor: AccentColorId;
  onAccentColor: (id: AccentColorId) => void;
}

/** Logo in alto a sinistra e colore di titolo, tabella e totale. */
export function AppearanceSection({ logo, logoError, logoLoading, onLogo, onRemoveLogo, accentColor, onAccentColor }: AppearanceSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <QuoteSection title="Aspetto">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-fg">
          Logo <span className="font-normal text-fg-muted">(facoltativo)</span>
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {logo && (
            <span className="grid h-14 w-28 place-items-center rounded-lg border border-border bg-white p-1.5">
              <img src={logo.url} alt="Logo scelto" className="max-h-full max-w-full object-contain" data-testid="logo-preview" />
            </span>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            data-testid="logo-input"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) onLogo(file);
            }}
          />
          <Button
            variant="secondary"
            onClick={() => inputRef.current?.click()}
            disabled={logoLoading}
            icon={logoLoading ? <Spinner label="Caricamento del logo" /> : <ImagePlus className="size-4" aria-hidden />}
          >
            {logo ? 'Cambia logo' : 'Scegli logo'}
          </Button>
          {logo && (
            <Button variant="ghost" onClick={onRemoveLogo} icon={<X className="size-4" aria-hidden />}>
              Rimuovi
            </Button>
          )}
        </div>
        {logoError ? (
          <p role="alert" className="text-[13px] font-medium text-danger">
            {logoError}
          </p>
        ) : (
          <p className="text-[13px] text-fg-muted">PNG, JPG, WebP, AVIF o BMP fino a 5 MB. Meglio un'immagine larga e su fondo trasparente o bianco.</p>
        )}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-fg">Colore</legend>
        <div className="flex flex-wrap gap-2.5">
          {ACCENT_COLORS.map((color) => {
            const checked = color.id === accentColor;
            return (
              <label
                key={color.id}
                title={color.label}
                className={cn(
                  'relative grid size-10 cursor-pointer place-items-center rounded-full border-2 transition-transform hover:scale-105',
                  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
                  checked ? 'border-fg' : 'border-transparent',
                )}
              >
                <input type="radio" name="quote-accent" value={color.id} checked={checked} onChange={() => onAccentColor(color.id)} className="sr-only" />
                {/* Colore del PDF, che è sempre su fondo bianco: viene dai dati, non dai token del tema */}
                <span className="size-7 rounded-full" style={{ backgroundColor: color.hex }} aria-hidden />
                {checked && <Check className="absolute size-4 text-white" aria-hidden />}
                <span className="sr-only">{color.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </QuoteSection>
  );
}
