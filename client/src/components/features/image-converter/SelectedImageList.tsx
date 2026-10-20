import { X } from 'lucide-react';
import { formatBytes } from '../../../lib/formatBytes';
import { FORMAT_INFO } from '../../../lib/image-converter/imageFormats';
import type { ImageOutputFormat, SelectedImage } from '../../../models/imageConverter';
import { Button } from '../../common/Button';
import { ImageThumbnail } from './ImageThumbnail';

interface SelectedImageListProps {
  images: readonly SelectedImage[];
  target: ImageOutputFormat;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

/** Immagini pronte per la conversione, con l'avviso su quelle già nel formato scelto. */
export function SelectedImageList({ images, target, onRemove, disabled = false }: SelectedImageListProps) {
  return (
    <ul className="flex flex-col divide-y divide-border rounded-xl border border-border" data-testid="selected-images">
      {images.map((image) => {
        const same = image.format === target;
        return (
          <li key={image.id} className="flex items-center gap-3 px-3 py-2.5" data-testid="selected-image">
            <ImageThumbnail src={image.previewUrl} className="size-10" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-fg" title={image.file.name}>
                {image.file.name}
              </p>
              <p className="tabular text-[13px] text-fg-muted">
                {FORMAT_INFO[image.format].label} · {formatBytes(image.file.size)}
                {same && <span className="text-fg"> · già {FORMAT_INFO[target].label}, non verrà convertita</span>}
              </p>
            </div>
            <Button
              variant="ghost"
              className="size-9 px-0"
              onClick={() => onRemove(image.id)}
              disabled={disabled}
              aria-label={`Rimuovi ${image.file.name}`}
              icon={<X className="size-4" aria-hidden />}
            />
          </li>
        );
      })}
    </ul>
  );
}
