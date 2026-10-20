import { EyeOff, Layers } from 'lucide-react';
import { useId } from 'react';
import { cn } from '../../../lib/cn';
import { canChooseAll, type SheetChoice } from '../../../lib/excel-csv/sheetSelection';
import type { SheetCsv } from '../../../models/excel';

interface SheetPickerProps {
  sheets: readonly SheetCsv[];
  choice: SheetChoice;
  onChoice: (choice: SheetChoice) => void;
  includeHidden: boolean;
  onIncludeHidden: (include: boolean) => void;
}

const numberFormatter = new Intl.NumberFormat('it-IT');

const sizeLabel = (sheet: SheetCsv) =>
  sheet.empty
    ? 'Nessun dato'
    : `${numberFormatter.format(sheet.rows)} ${sheet.rows === 1 ? 'riga' : 'righe'} × ${numberFormatter.format(sheet.columns)} ${sheet.columns === 1 ? 'colonna' : 'colonne'}`;

function Badge({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-surface-muted px-1.5 py-0.5 text-[12px] font-medium text-fg-muted">
      {children === 'Nascosto' && <EyeOff className="size-3" aria-hidden />}
      {children}
    </span>
  );
}

interface OptionProps {
  name: string;
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
  title: string;
  detail: string;
  badges?: string[];
  testId: string;
  icon?: boolean;
}

function Option({ name, checked, disabled, onSelect, title, detail, badges = [], testId, icon }: OptionProps) {
  return (
    <label
      data-testid={testId}
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors',
        checked ? 'border-primary bg-primary-soft' : 'border-border',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-primary/60',
      )}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onSelect}
        className="mt-1 size-4 shrink-0 accent-primary disabled:cursor-not-allowed"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex flex-wrap items-center gap-2">
          {icon && <Layers className="size-4 text-primary-text" aria-hidden />}
          <span className="font-medium break-words text-fg">{title}</span>
          {badges.map((badge) => (
            <Badge key={badge}>{badge}</Badge>
          ))}
        </span>
        <span className="tabular text-[13px] text-fg-muted">{detail}</span>
      </span>
    </label>
  );
}

/** Scelta del foglio da convertire, con l'opzione "Tutti" che produce uno ZIP. */
export function SheetPicker({ sheets, choice, onChoice, includeHidden, onIncludeHidden }: SheetPickerProps) {
  const name = useId();
  const hiddenWithData = sheets.filter((sheet) => sheet.hidden && !sheet.empty).length;

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-[15px] font-semibold text-fg">Quale foglio vuoi convertire?</legend>
      {sheets.map((sheet, index) => (
        <Option
          key={`${index}-${sheet.name}`}
          name={name}
          testId="sheet-option"
          checked={choice === index}
          disabled={sheet.empty}
          onSelect={() => onChoice(index)}
          title={sheet.name}
          detail={sizeLabel(sheet)}
          badges={[...(sheet.hidden ? ['Nascosto'] : []), ...(sheet.empty ? ['Vuoto'] : [])]}
        />
      ))}
      {canChooseAll(sheets) && (
        <Option
          name={name}
          testId="sheet-option-all"
          checked={choice === 'all'}
          onSelect={() => onChoice('all')}
          title="Tutti i fogli"
          detail="Un file ZIP con un CSV per ogni foglio con dati"
          icon
        />
      )}
      {choice === 'all' && hiddenWithData > 0 && (
        <label className="mt-1 flex cursor-pointer items-center gap-3 px-1 text-sm text-fg">
          <input
            type="checkbox"
            checked={includeHidden}
            onChange={(event) => onIncludeHidden(event.target.checked)}
            className="size-4 accent-primary"
          />
          Includi {hiddenWithData === 1 ? 'il foglio nascosto' : `i ${hiddenWithData} fogli nascosti`}
        </label>
      )}
    </fieldset>
  );
}
