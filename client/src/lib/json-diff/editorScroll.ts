/** Misure dell'editor: devono restare allineate alle classi `leading-6` e `py-3` di JsonEditor. */
export const EDITOR_LINE_HEIGHT = 24;
export const EDITOR_PADDING_Y = 12;

/** Porta una riga (1-based) a circa un terzo dell'altezza visibile della textarea. */
export const scrollEditorToLine = (textarea: HTMLTextAreaElement, line: number): void => {
  const lineTop = EDITOR_PADDING_Y + (line - 1) * EDITOR_LINE_HEIGHT;
  textarea.scrollTop = Math.max(0, lineTop - textarea.clientHeight / 3);
  textarea.scrollLeft = 0;
};
