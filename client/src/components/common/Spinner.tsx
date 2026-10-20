import { LoaderCircle } from 'lucide-react';

export function Spinner({ label = 'Caricamento' }: { label?: string }) {
  return <LoaderCircle className="size-4 animate-spin" aria-label={label} />;
}
