import { useCallback, useMemo, useState } from 'react';
import { buildMetaTags } from '../lib/meta-tags/buildMetaTags';
import { validateMetaTags } from '../lib/meta-tags/validateMetaTags';
import type { MetaTagsInput } from '../models/metaTags';
import { EMPTY_META_TAGS } from '../lib/meta-tags/emptyMetaTags';

/** Valori del modulo, errori di formato e tag generati, aggiornati a ogni modifica. */
export const useMetaTags = () => {
  const [input, setInput] = useState<MetaTagsInput>(EMPTY_META_TAGS);

  const setField = useCallback(
    <K extends keyof MetaTagsInput>(field: K, value: MetaTagsInput[K]) => setInput((current) => ({ ...current, [field]: value })),
    [],
  );
  const reset = useCallback(() => setInput(EMPTY_META_TAGS), []);

  const errors = useMemo(() => validateMetaTags(input), [input]);
  const html = useMemo(() => buildMetaTags(input), [input]);
  const isEmpty = input === EMPTY_META_TAGS;

  return { input, errors, html, isEmpty, setField, reset };
};
