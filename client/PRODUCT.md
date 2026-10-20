# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
React + TypeScript + React Router + Tailwind CSS (Vite), solo frontend: nessun backend (il server Express + MongoDB dello short URL è archiviato fuori dal progetto). Test e2e con Playwright. Scelta dell'utente.

## Users
Pubblico generico: chiunque visiti il sito e abbia bisogno di un'operazione rapida su un link (generare un QR code, convertire un PDF o un foglio Excel, unire PDF, ...). Nessun account, nessun login.

## Product Purpose
ProntoKit è una raccolta di piccole utility web. Tutte lavorano nel browser (elenco in `src/config/utilities.ts`). Successo = l'utente arriva, incolla un link, ottiene il risultato e lo scarica/copia in pochi secondi.

## Capabilities and Constraints
- QR code: generato lato client da un URL, scaricabile in PNG e SVG. Nessuna opzione di colore/dimensione.
- Short URL: implementato ma disattivato (`enabled: false`) finché non torna un backend. Alias personalizzato opzionale, cronologia degli ultimi 5 link nel browser, contatore globale "Servizio utilizzato N volte", nessuna scadenza.
- L'elenco delle utility crescerà: home e navigazione devono scalare aggiungendo una voce.
- Interfaccia in italiano. Tema chiaro + scuro (scelta dell'utente).

## Brand Commitments
Nome: **ProntoKit**. Nessun logo o asset esistente.

## Evidence on Hand
Nessuna testimonianza, metrica o dato d'uso: non inventarne.

## Product Principles
- Il compito prima di tutto: input → risultato → copia/scarica, senza passaggi superflui.
- Una sola fonte di verità per l'elenco delle utility.
- Errori chiari e in italiano, mai bloccanti senza spiegazione.

## Accessibility & Inclusion
Pubblico generico: WCAG 2.2 AA, navigazione da tastiera completa, contrasto sufficiente in entrambi i temi.
