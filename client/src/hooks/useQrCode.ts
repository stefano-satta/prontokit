import { useEffect, useState } from 'react';
import type { QrState } from '../models/qr';
import { generateQr } from '../services/qrGenerator';

/** Genera il QR per il testo dato; ignora risultati arrivati fuori ordine. */
export const useQrCode = (text: string | null): QrState => {
  const [state, setState] = useState<QrState>({ status: 'idle' });

  useEffect(() => {
    if (!text) {
      setState({ status: 'idle' });
      return;
    }
    let cancelled = false;
    generateQr(text)
      .then((result) => !cancelled && setState({ status: 'ready', text, result }))
      .catch(() => !cancelled && setState({ status: 'error', message: 'Impossibile generare il QR code per questo URL.' }));
    return () => {
      cancelled = true;
    };
  }, [text]);

  return state;
};
