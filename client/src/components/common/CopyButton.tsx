import { Check, Copy } from 'lucide-react';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { Button, type ButtonSize, type ButtonVariant } from './Button';

interface CopyButtonProps {
  value: string;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  compact?: boolean;
  disabled?: boolean;
}

export function CopyButton({ value, label = 'Copia', variant = 'secondary', size, compact = false, disabled }: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();
  const icon = copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />;

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={() => copy(value)}
      icon={icon}
      aria-label={compact ? `${label}: ${value}` : undefined}
      className={compact ? 'w-10 px-0' : undefined}
    >
      {!compact && <span aria-live="polite">{copied ? 'Copiato' : label}</span>}
    </Button>
  );
}
