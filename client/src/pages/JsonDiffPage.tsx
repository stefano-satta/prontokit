import { Download } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { Button } from '../components/common/Button';
import { CopyButton } from '../components/common/CopyButton';
import { UtilityPageHeader } from '../components/common/UtilityPageHeader';
import { Panel } from '../components/common/Panel';
import { PrivacyNote } from '../components/common/PrivacyNote';
import { DiffSummary, SIDE_LABELS } from '../components/features/json-diff/DiffSummary';
import { JsonEditor } from '../components/features/json-diff/JsonEditor';
import { SideBadge } from '../components/features/json-diff/SideBadge';
import { JsonToolbar, type JsonAction } from '../components/features/json-diff/JsonToolbar';
import { useJsonDiff } from '../hooks/useJsonDiff';
import { downloadText } from '../lib/downloadFile';
import { scrollEditorToLine } from '../lib/json-diff/editorScroll';
import { jsonDiffFilename } from '../lib/json-diff/jsonDiffFilename';
import { transformJson } from '../lib/json-diff/transformJson';
import { splitLines } from '../lib/json-diff/lineDiff';
import type { JsonSide } from '../models/jsonDiff';

type Texts = Record<JsonSide, string>;

const EMPTY: Texts = { left: '', right: '' };

const EXAMPLE: Texts = {
  left: `{
  "nome": "ProntoKit",
  "versione": "1.4.0",
  "attivo": true,
  "utility": ["qr-code", "short-url", "grafici"],
  "limiti": {
    "fileMb": 25,
    "righe": 200
  }
}`,
  right: `{
  "nome": "ProntoKit",
  "versione": "1.5.0",
  "attivo": true,
  "utility": ["qr-code", "short-url", "grafici", "json-diff"],
  "limiti": {
    "fileMb": 50
    "righe": 200
  }
}`,
};

const SIDES: JsonSide[] = ['left', 'right'];

interface Notice {
  message: string;
  /** Testi da ripristinare con "Annulla" */
  previous: Texts | null;
}

export default function JsonDiffPage() {
  const [texts, setTexts] = useState<Texts>(EMPTY);
  const [notice, setNotice] = useState<Notice | null>(null);
  const { comparison, pending } = useJsonDiff(texts.left, texts.right);

  const leftRef = useRef<HTMLTextAreaElement>(null);
  const rightRef = useRef<HTMLTextAreaElement>(null);
  const refs = { left: leftRef, right: rightRef };

  const bothEmpty = texts.left.trim() === '' && texts.right.trim() === '';
  const rightEmpty = texts.right.trim() === '';
  const rightAnalysis = comparison.right.analysis;
  const rightReady = !pending && rightAnalysis?.ok === true;

  const edit = (side: JsonSide, value: string) => {
    setTexts((current) => ({ ...current, [side]: value }));
    setNotice(null);
  };

  const runAction = (action: JsonAction) => {
    if (action === 'clear') {
      setTexts(EMPTY);
      setNotice({ message: 'Riquadri svuotati.', previous: texts });
      return;
    }
    // Formatta e Minifica agiscono solo sul JSON di destra, quello da correggere e scaricare
    const { next, message } = transformJson(texts.right, action);
    setTexts({ ...texts, right: next });
    setNotice({ message, previous: next === texts.right ? null : texts });
  };

  const undo = () => {
    if (!notice?.previous) return;
    setTexts(notice.previous);
    setNotice({ message: 'Modifica annullata.', previous: null });
  };

  const goToError = (side: JsonSide) => {
    const textarea = refs[side].current;
    const analysis = comparison[side].analysis;
    if (!textarea || !analysis || analysis.ok) return;
    scrollEditorToLine(textarea, analysis.error.line);
    // Il cursore sull'errore: si corregge subito, anche da tastiera
    textarea.focus({ preventScroll: true });
    textarea.setSelectionRange(analysis.error.offset, analysis.error.offset);
    textarea.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  const footerFor = (side: JsonSide): ReactNode => {
    const state = comparison[side];
    if (state.empty) return 'Incolla o scrivi qui il JSON.';
    if (state.analysis && !state.analysis.ok) {
      const { line, column, message } = state.analysis.error;
      return (
        <span className="flex flex-col items-start gap-1.5" data-testid={`error-${side}`}>
          <span className="font-medium text-danger">
            Riga {line}, colonna {column}: {message}
          </span>
          <button
            type="button"
            onClick={() => goToError(side)}
            className="inline-flex min-h-11 items-center rounded font-semibold text-primary-text underline-offset-2 hover:underline sm:min-h-0"
          >
            Vai all’errore
          </button>
        </span>
      );
    }
    const lines = splitLines(state.text).length;
    const changed = side === 'left' ? comparison.diff.leftChanged.size : comparison.diff.rightChanged.size;
    return (
      <span className="tabular">
        {lines} {lines === 1 ? 'riga' : 'righe'}
        {changed > 0 && ` · ${changed} ${changed === 1 ? 'diversa' : 'diverse'}`}
      </span>
    );
  };

  const errorLineOf = (side: JsonSide) => {
    const analysis = comparison[side].analysis;
    return analysis && !analysis.ok ? analysis.error.line : undefined;
  };

  const downloadHint = (() => {
    if (comparison.right.empty) return 'Incolla il JSON «Modificato» per poterlo scaricare o copiare.';
    if (rightAnalysis && !rightAnalysis.ok) return `Correggi l’errore alla riga ${rightAnalysis.error.line} per scaricare o copiare il JSON.`;
    return 'JSON valido: pronto da scaricare o copiare.';
  })();

  return (
    <div className="flex flex-col gap-10">
      <UtilityPageHeader
        utilityId="json-diff"
        description="Incolla due JSON: vedi subito se sono uguali o quali righe cambiano, con gli errori di sintassi spiegati riga per riga. Formatta o minifica, poi scarica o copia il JSON corretto."
      >
        <PrivacyNote
          title="I tuoi JSON non lasciano il dispositivo."
          description="Il confronto avviene interamente nel browser: niente upload, niente copie sui server, niente cronologia."
        />
      </UtilityPageHeader>
      <Panel className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <JsonToolbar transformDisabled={rightEmpty} clearDisabled={bothEmpty} onAction={runAction} notice={notice && { message: notice.message, canUndo: notice.previous !== null }} onUndo={undo} />
        <DiffSummary comparison={comparison} onExample={() => setTexts(EXAMPLE)} />

        <div className="grid gap-6 md:grid-cols-2 md:gap-4 lg:gap-6">
          {SIDES.map((side) => (
            <JsonEditor
              key={side}
              id={`json-${side}`}
              label={SIDE_LABELS[side]}
              value={texts[side]}
              onChange={(value) => edit(side, value)}
              placeholder={side === 'left' ? 'Incolla qui il JSON di partenza' : 'Incolla qui il JSON da confrontare e correggere'}
              changed={side === 'left' ? comparison.diff.leftChanged : comparison.diff.rightChanged}
              tone={side === 'left' ? 'removed' : 'added'}
              errorLine={errorLineOf(side)}
              badge={<SideBadge side={comparison[side]} />}
              footer={footerFor(side)}
              footerId={`json-${side}-footer`}
              textareaRef={refs[side]}
              testId={`json-${side}`}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3 pt-6 md:items-end">
          <p className={rightReady ? 'text-sm text-success' : 'text-sm text-fg-muted'} data-testid="download-hint">
            {downloadHint}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <Button
              size="lg"
              disabled={!rightReady}
              onClick={() => downloadText(texts.right.endsWith('\n') ? texts.right : `${texts.right}\n`, jsonDiffFilename(), 'application/json;charset=utf-8')}
              icon={<Download className="size-[18px]" aria-hidden />}
            >
              Scarica .json
            </Button>
            <CopyButton value={texts.right} label="Copia JSON" size="lg" disabled={!rightReady} />
          </div>
        </div>
      </Panel>
    </div>
  );
}
