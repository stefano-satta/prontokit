import { useEffect } from 'react';
import { SITE } from '../config/site';

export const useDocumentTitle = (title?: string) => {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE.name}` : SITE.name;
  }, [title]);
};
