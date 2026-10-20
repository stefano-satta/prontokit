import { Scissors } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '../../common/Button';
import { Spinner } from '../../common/Spinner';
import { TextField } from '../../common/TextField';
import { HttpError } from '../../../lib/http';
import { validateUrl } from '../../../lib/validateUrl';
import { validateAlias } from '../../../lib/aliasRules';
import type { CreateShortUrlInput, ShortUrl } from '../../../models/shortUrl';

interface ShortUrlFormProps {
  onCreate: (input: CreateShortUrlInput) => Promise<ShortUrl>;
}

interface FieldErrors {
  url?: string | null;
  alias?: string | null;
  form?: string | null;
}

/** Etichetta mostrata davanti al campo alias */
const ALIAS_PREFIX = 'pronto.kit/';

export function ShortUrlForm({ onCreate }: ShortUrlFormProps) {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const urlCheck = validateUrl(url);
    const aliasError = validateAlias(alias.trim());
    if (!urlCheck.ok || aliasError) {
      setErrors({ url: urlCheck.ok ? null : urlCheck.error, alias: aliasError });
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await onCreate({ url: urlCheck.url, alias: alias.trim() || undefined });
      setUrl('');
      setAlias('');
    } catch (error) {
      const message = (error as Error).message;
      setErrors(error instanceof HttpError && error.status === 409 ? { alias: message } : { form: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <TextField
        label="URL da accorciare"
        type="url"
        inputMode="url"
        autoComplete="url"
        placeholder="https://www.esempio.it/una/pagina/molto/lunga"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        error={errors.url}
        autoFocus
      />
      <TextField
        label="Alias personalizzato"
        optional
        prefix={ALIAS_PREFIX}
        placeholder="promo-estate"
        value={alias}
        onChange={(event) => setAlias(event.target.value)}
        error={errors.alias}
        hint="Lascia vuoto per un codice casuale di 7 caratteri."
        autoCapitalize="none"
        spellCheck={false}
      />
      {errors.form && (
        <p role="alert" className="rounded-lg bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          {errors.form}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="self-start"
        icon={submitting ? <Spinner label="Creazione in corso" /> : <Scissors className="size-[18px]" aria-hidden />}
      >
        {submitting ? 'Creazione…' : 'Accorcia URL'}
      </Button>
    </form>
  );
}
