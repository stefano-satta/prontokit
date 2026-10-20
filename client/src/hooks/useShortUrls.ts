import { useCallback, useEffect, useState } from 'react';
import { shortUrlApi } from '../services/shortUrlApi';
import type { CreateShortUrlInput } from '../models/shortUrl';
import { useShortUrlHistory } from './useShortUrlHistory';

/** Creazione di short URL, cronologia locale e contatore globale del servizio. */
export const useShortUrls = () => {
  const { history, add } = useShortUrlHistory();
  // null finché il server non risponde: il contatore è un dettaglio, se manca non si mostra
  const [totalCreated, setTotalCreated] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    shortUrlApi
      .stats()
      .then(({ totalCreated }) => active && setTotalCreated(totalCreated))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const create = useCallback(
    async (input: CreateShortUrlInput) => {
      const created = await shortUrlApi.create(input);
      add(created);
      setTotalCreated((current) => (current === null ? current : current + 1));
      return created;
    },
    [add],
  );

  return { history, totalCreated, create };
};
