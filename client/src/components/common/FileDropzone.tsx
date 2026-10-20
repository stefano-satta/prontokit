import { FileUp } from 'lucide-react';
import { useId, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { cn } from '../../lib/cn';

interface BaseProps {
  accept: string;
  title: string;
  hint: string;
  disabled?: boolean;
  className?: string;
}

type FileDropzoneProps = BaseProps &
  ({ multiple?: false; onFile: (file: File) => void } | { multiple: true; onFiles: (files: File[]) => void });

/** Area di caricamento: trascina-e-rilascia oppure clic/Invio per scegliere uno o più file. */
export function FileDropzone({ accept, title, hint, disabled = false, className, ...mode }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const hintId = useId();

  const pick = (list: FileList | null) => {
    const files = Array.from(list ?? []);
    if (!files.length || disabled) return;
    if (mode.multiple) mode.onFiles(files);
    else mode.onFile(files[0]!);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    pick(event.dataTransfer.files);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) setDragging(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      aria-describedby={hintId}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      data-testid="dropzone"
      className={cn(
        'group relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-14 text-center',
        'transition-[border-color,background-color,scale] duration-300 ease-out-expo',
        dragging
          ? 'scale-[1.01] border-primary bg-primary-soft'
          : 'border-border-strong bg-surface-muted/50',
        !dragging && !disabled && 'hover:border-primary/60 hover:bg-primary-soft/40',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <span
        className={cn(
          'grid size-14 place-items-center rounded-2xl bg-surface text-primary-text shadow-[0_1px_2px_rgb(15_23_42/0.06),0_8px_20px_-10px_rgb(37_99_235/0.4)]',
          'transition-transform duration-300 ease-out-expo group-hover:-translate-y-1',
          dragging && '-translate-y-1',
        )}
      >
        <FileUp className="size-6" aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-[17px] font-semibold tracking-[-0.01em] text-fg">{title}</p>
        <p id={hintId} className="text-sm text-fg-muted">
          {hint}
        </p>
      </div>
      <span className="rounded-lg border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-fg transition-colors group-hover:border-primary/60">
        {mode.multiple ? 'Scegli i file' : 'Scegli un file'}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={mode.multiple}
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        data-testid="file-input"
        onChange={(event) => {
          pick(event.target.files);
          event.target.value = '';
        }}
      />
    </div>
  );
}
