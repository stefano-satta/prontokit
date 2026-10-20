import { twMerge } from 'tailwind-merge';

/** Concatena classi CSS ignorando i valori falsy e risolvendo i conflitti Tailwind (es. px-4 + px-0). */
export const cn = (...classes: Array<string | false | null | undefined>): string => twMerge(classes.filter(Boolean).join(' '));
