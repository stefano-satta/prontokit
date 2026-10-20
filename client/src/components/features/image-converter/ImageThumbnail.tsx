import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../../lib/cn';

interface ImageThumbnailProps {
  src?: string;
  className?: string;
}

/** Miniatura quadrata; se il browser non sa mostrare l'immagine (es. AVIF) compare un'icona. */
export function ImageThumbnail({ src, className }: ImageThumbnailProps) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={cn(
        'grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-[repeating-conic-gradient(var(--color-surface-muted)_0_25%,var(--color-surface)_0_50%)] bg-[length:12px_12px]',
        className,
      )}
    >
      {src && !failed ? (
        <img src={src} alt="" className="size-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <ImageOff className="size-5 text-fg-muted" aria-hidden />
      )}
    </span>
  );
}
