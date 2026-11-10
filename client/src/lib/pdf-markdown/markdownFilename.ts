import { baseNameOf } from '../fileName';

/** Nome file sicuro per il download del Markdown. */
export const toMarkdownFilename = (originalName: string): string =>
  `${baseNameOf(originalName, /\.pdf$/i, 'documento')}.md`;
