import { Eraser, Minimize2, Undo2, WandSparkles } from 'lucide-react';
import { Button } from '../../common/Button';

export type JsonAction = 'beautify' | 'minify' | 'clear';

interface JsonToolbarProps {
  /** Formatta e Minifica lavorano sul JSON di destra: senza testo lì non servono */
  transformDisabled: boolean;
  clearDisabled: boolean;
  onAction: (action: JsonAction) => void;
  /** Esito dell'ultima azione, con "Annulla" se ha cambiato il testo */
  notice: { message: string; canUndo: boolean } | null;
  onUndo: () => void;
}

const ICON = 'size-4';

/** Azioni sopra gli editor: Formatta e Minifica sul JSON di destra, Svuota su entrambi. */
export function JsonToolbar({ transformDisabled, clearDisabled, onAction, notice, onUndo }: JsonToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" role="toolbar" aria-label="Azioni sui JSON">
        <Button disabled={transformDisabled} onClick={() => onAction('beautify')} icon={<WandSparkles className={ICON} aria-hidden />} className="max-sm:h-11">
          Formatta
        </Button>
        <Button variant="secondary" disabled={transformDisabled} onClick={() => onAction('minify')} icon={<Minimize2 className={ICON} aria-hidden />} className="max-sm:h-11">
          Minifica
        </Button>
        <Button variant="ghost" disabled={clearDisabled} onClick={() => onAction('clear')} icon={<Eraser className={ICON} aria-hidden />} className="col-span-2 max-sm:h-11 sm:ml-auto">
          Svuota
        </Button>
      </div>
      <div className="flex min-h-6 flex-wrap items-center gap-x-3 gap-y-1 text-[13px]" role="status" data-testid="action-notice">
        {notice ? (
          <>
            <span className="text-fg">{notice.message}</span>
            {notice.canUndo && (
              <button type="button" onClick={onUndo} className="inline-flex items-center gap-1 rounded font-semibold text-primary-text underline-offset-2 hover:underline">
                <Undo2 className="size-3.5" aria-hidden />
                Annulla
              </button>
            )}
          </>
        ) : (
          <span className="text-fg-muted">Formatta (2 spazi di rientro) e Minifica (tutto su una riga) agiscono sul JSON di destra.</span>
        )}
      </div>
    </div>
  );
}
