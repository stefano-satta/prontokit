# UtilityApp: guida per Claude Code

Raccolta di utility web pubbliche, senza account. Interfaccia e copy in **italiano**; rispondi all'utente in italiano.
**Solo frontend**: nessun backend nel progetto (vedi "Short URL disattivato" sotto).
Utility attuali (route): `/qr-code` (QR da URL, PNG/SVG, generato nel client), `/pdf-markdown` (PDF → Markdown per LLM, **solo nel browser**),
`/excel-csv` (Excel/ODS → CSV per foglio o ZIP, **solo nel browser**), `/speech-to-text` (dettatura con la
Web Speech API del browser, tasti di punteggiatura, download `.txt` e copia del testo), `/chart-generator` (grafici a barre, torta
o linee da righe `etichetta;valore`, tabella dei dati, PNG e copia SVG, solo nel browser), `/json-diff` (confronto di due JSON
riga per riga, errori di sintassi con riga e colonna, Formatta/Minifica, download `.json` e copia del lato destro, solo nel browser), `/image-converter` (fino a 5 immagini JPG/PNG/WebP/AVIF/BMP in PNG, JPG o WebP,
tabella dei risultati e ZIP, solo nel browser), `/pdf-merge` (da 2 a 5 PDF uniti in uno, nell'ordine scelto, PDF protetti scartati, solo nel browser),
`/password-generator` (password casuali da 10 a 30 caratteri, tipi di caratteri a scelta, indicatore debole/accettabile/forte, copia; solo nel browser).
Il README ha il dettaglio su funzionamento e privacy; `client/PRODUCT.md` ha il contesto di prodotto.

## Stack
- npm workspaces con il solo `client/` (la root tiene Playwright e gli script). Node 24 (README: 20+). Moduli ESM ovunque.
- **Client:** React 19, TypeScript strict, React Router 8 (`createBrowserRouter`, route lazy), Vite 8,
  Tailwind CSS v4 (`@tailwindcss/vite`, nessun `tailwind.config`), lucide-react, tailwind-merge, qrcode,
  chart.js + react-chartjs-2, pdfjs-dist (worker), pdf-lib (unione PDF), xlsx (SheetJS CE dal tarball cdn.sheetjs.com, in worker), fflate (ZIP), font Inter Variable.
- **Test:** Vitest (client), Playwright (e2e, progetti `desktop` e `mobile` Pixel 7).

## Comandi (dalla root)
| Comando | Uso |
|---|---|
| `npm run dev` | Client Vite su :5173 |
| `npm run typecheck` | `tsc --noEmit` sul client |
| `npm test` | Vitest del client |
| `npm run test:e2e` | Playwright; riusa un dev server già attivo |
| `npm run build` | `client/dist` (esegue anche `tsc`) |

**Non esistono lint né formatter** (niente ESLint/Prettier): non citarli e non aggiungerli senza chiedere.

## Struttura client (`client/src`)
- `pages/`: una pagina per route con `export default` (lazy). `NotFoundPage` è fuori da `RootLayout` (pagina intera).
- `components/common/`: UI riusabile e generica (Button, TextField, Panel, Navbar, ToolsMenu, Footer, FileDropzone, PrivacyNote, ...).
  Navbar "a isola": pillola di vetro centrata (`max-w-2xl`, token `glass*` e `shadow-island`) con Logo, Home (etichetta testuale),
  "Tools" (disclosure con l'elenco di `UTILITIES`: pannello di vetro allineato a destra su desktop, largo quanto l'isola
  con velo su mobile; si chiude con Esc, click fuori o cambio pagina), cambio tema. Il vetro è un livello separato:
  un `backdrop-filter` sull'antenato impedirebbe la sfocatura della tendina.
- `components/features/<area>/`: componenti di una singola utility (`home`, `qr`, `short-url`, `pdf-markdown`, `excel-csv`, `speech-to-text`, `chart-generator`, `json-diff`, `image-converter`, `pdf-merge`, `password-generator`).
- `components/layouts/`: `RootLayout` (skip link, Navbar, `<main>`, Footer).
- `config/utilities.ts`: **unica fonte** delle utility; navbar, card della home e router leggono da qui.
  `config/site.ts`: nome app, link autore ed email di contatto (`contactEmail`, usata dai mailto della pagina About) (non ripetere la stringa "UtilityApp").
  `config/footerLinks.ts`: menu del footer (About `/about`, Privacy `/privacy`, Termini `/termini`), fuori dalla navbar; il router
  registra solo le voci con `loadPage`. Se torna lo short URL, i loro path vanno tra i codici riservati (`RESERVED_CODES` del server, `aliasRules.ts`).
  Una voce di `UTILITIES` con `enabled: false` resta nel codice ma non compare in navbar e home e non ha route (oggi: `short-url`).
- `hooks/`: tutti gli hook React. `models/`: tutti i tipi e le interfacce condivisi.
- `lib/`: funzioni pure senza React (validazioni, `cn`, http, download, `fileName` per nomi sicuri,
  `pdf-markdown/` e `excel-csv/` per la logica di conversione, `speech-to-text/` per lingue, unione dei frammenti e inserimento della punteggiatura,
  `chart-generator/` per parsing dei dati, palette, configurazione Chart.js e SVG della tabella, `json-diff/` per analisi, formattazione e diff riga per riga, `image-converter/` per firme dei formati, nomi dei file e avvisi di selezione, `pdf-merge/` per avvisi, ordinamento, nome del file e ricerca di `/Encrypt`, `password-generator/` per gruppi di caratteri, generazione e forza).
- `services/`: accesso ad API e librerie esterne (`shortUrlApi`, `qrGenerator`, `pdf/`, `excel/`: SheetJS nel worker
  `excelToCsv.worker.ts`, ZIP con fflate, `speechRecognition` per Web Speech API e permesso microfono, `chart/` per registrazione di Chart.js,
  export PNG fuori schermo e conversione SVG → PNG, `image/` per conversione via canvas e ZIP delle immagini, `pdf-merge/` per lettura e unione con pdf-lib).
- `styles/index.css`: token di design, regole cursor, keyframes. `client/vite/`: plugin Vite (CSP, asset PDF.js).

## Convenzioni di codice
- SOLID e DRY come scelte di base: un compito per modulo, dipendenze su interfacce (DIP), estensione via config (OCP).
- Export **nominati** ovunque; `export default` solo per le pagine.
- Import senza estensione, tranne `client/vite/*` (`.ts`).
- Classi con `cn()` (clsx-like + tailwind-merge), così i `className` passati sovrascrivono quelli di base.
- Nomi file: componenti PascalCase `.tsx`, hook `useX.ts`.
- Commenti brevi in italiano, solo dove spiegano il perché.
- Messaggi di errore all'utente in italiano, che dicono il problema e come risolverlo.

## UI/UX e accessibilità
- Usa solo i token semantici (`bg-surface`, `text-fg-muted`, `border-border`, `text-primary-text`, `accent`/`accent-soft` viola, `success`/`warning`/`danger` con le varianti `-soft`, ...), mai colori
  esadecimali nei componenti. Tema scuro tramite classe `.dark` (`@custom-variant dark`), con stato in `useTheme`.
- Tutti i bottoni hanno `cursor: pointer`, i disabilitati `not-allowed` (regola globale). Per l'hover usa `not-disabled:hover:`.
- Obiettivo WCAG 2.2 AA:
  - tutto usabile da tastiera, con focus visibile;
  - contrasto sufficiente in entrambi i temi;
  - icone decorative con `aria-hidden`;
  - `useDocumentTitle` su ogni pagina.
- Mobile-first: verifica a 375px senza scroll orizzontale (anche gli e2e girano su mobile).
- Icone solo da lucide-react.
- Flusso del prodotto: input → risultato → copia o scarica, senza passaggi superflui.
- Link esterni con `target="_blank" rel="noopener noreferrer"`.

## Vincoli e decisioni da rispettare
- **Privacy PDF:** il documento non deve mai lasciare il browser.
  - Niente upload, niente endpoint, niente `localStorage`, niente log dei contenuti.
  - Un e2e verifica che durante la conversione non partano richieste con dati: non romperlo.
  - Validazione tramite firma `%PDF-` e limite di 25 MB.
  - XFA disattivato; CMap servite in locale, mai da CDN.
- **Excel → CSV** (stesse regole di privacy del PDF; dettagli nel README):
  - CSV con `;`, decimali italiani come mostrati in cella, UTF-8 con BOM, CRLF; date ISO `2026-10-16`.
  - Valori calcolati, mai formule; testo che inizia con `= + - @` neutralizzato con un apostrofo (CSV injection).
  - Fogli nascosti marcati ed esclusi di default da "Tutti"; il riepilogo dice sempre cosa è incluso.
  - Firma ZIP/OLE, 25 MB, controllo zip bomb, massimo 3 milioni di celle. SheetJS solo nel worker.
  - Non installare `xlsx` dal registro npm (0.18.5, vulnerabile): si usa il tarball ufficiale.
- **Trascrizione vocale** (dettagli nel README):
  - Web Speech API del browser, nessuna libreria né endpoint; Firefox non supportato (messaggio in pagina).
  - La nota in pagina dice che su Chrome/Edge/Safari l'audio può passare dai server del fornitore: tienila onesta.
  - Lingue in `lib/speech-to-text/languages.ts` (italiano predefinito). Niente punteggiatura dettata a voce
    (rimossa su richiesta dell'utente): si inserisce con i tasti di `PunctuationBar`, nella posizione del cursore.
  - Textarea in sola lettura, tasti di punteggiatura, download e "Copia testo" disattivati mentre si registra. Gli e2e usano un `SpeechRecognition` finto.
- **Generatore di grafici** (dettagli nel README):
  - Separatore etichetta/valore: solo `;` (scelta dell'utente); virgola decimale italiana.
  - SVG del grafico = PNG incapsulato (scelta dell'utente, niente SVG vettoriale per il grafico); la tabella è SVG vettoriale.
  - Export sempre in tema chiaro e a dimensione fissa; anteprima in pagina segue il tema.
  - Opzioni formato (valore/percentuale, 1–2 decimali) solo per la torta; barre e linee mostrano i valori come inseriti.
  - Colori in ordine fisso da `lib/chart-generator/palette.ts`: non generare colori nuovi, non cambiarne l'ordine senza rivalidare.
- **Confronto JSON** (dettagli nel README):
  - Validazione con il parser di `lib/json-diff/analyzeJson.ts` (messaggi in italiano con riga e colonna), non con `JSON.parse`.
  - Formatta (2 spazi) e Minifica solo sul riquadro di destra (scelta dell'utente; niente tasto Scambia); lavorano sui token e non alterano stringhe e numeri.
  - Errori di sintassi solo sotto il riquadro; sopra gli editor solo una riga di esito, niente box né elenco delle differenze (scelta dell'utente).
  - Messaggi d'errore: suggerire la correzione solo se la causa è certa, altrimenti «Carattere inatteso ...» (scelta dell'utente). Le parentesi mancanti si individuano provando la correzione sul testo (`diagnose` in `analyzeJson.ts`): si segnala solo quella che rende il JSON valido. Righe diverse verdi da entrambi i lati, rosso solo per la riga con l'errore.
  - Download e copia solo del riquadro di destra, abilitati solo quando è JSON valido.
  - L'editor allinea numeri di riga ed evidenziazioni alla textarea con `EDITOR_LINE_HEIGHT`/`EDITOR_PADDING_Y` (`lib/json-diff/editorScroll.ts`): se cambi `leading-6` o `py-3` aggiorna le costanti.
- **Convertitore di immagini** (stesse regole di privacy del PDF; dettagli nel README):
  - Massimo 5 file da 25 MB, formato riconosciuto dalla firma (`detectImageFormat`), mai da estensione o MIME type.
  - Conversione via canvas, una immagine alla volta; il browser che non sa codificare un formato restituisce un PNG: `convertImage` lo controlla e dà errore.
  - Le immagini già nel formato scelto non si convertono; se lo sono tutte la conversione non parte e lo si segnala.
  - Un solo file convertito si scarica diretto, da due in su ZIP. `FileDropzone` ha la modalità `multiple` con `onFiles`.
- **Unisci PDF** (stesse regole di privacy del PDF; dettagli nel README):
  - Da 2 a 5 file da 25 MB, firma `%PDF-`; ogni file si legge con pdf-lib appena aggiunto (pagine, errori).
  - Un PDF con `/Encrypt` (password o sole restrizioni) va scartato con un avviso: pdf-lib non decifra, unirlo darebbe pagine illeggibili.
  - Ordine con le frecce su/giù; download con "Scarica PDF unito" (`pdf_unito_<sito>.pdf`), nessun download automatico.
- **Generatore di password** (dettagli nel README):
  - Solo `crypto.getRandomValues` con scarto dei valori in eccesso (niente `Math.random`, niente bias del modulo); almeno un carattere per gruppo scelto, poi rimescolamento Fisher-Yates.
  - Lunghezza da 10 a 30 (predefinita 16), tutti i gruppi attivi all'inizio; l'ultimo gruppo selezionato non si può togliere. Ogni cambio di opzione rigenera la password.
  - Simboli senza spazi, virgolette e backslash. Cifre e simboli colorati nella password solo per leggibilità.
  - Forza = entropia (lunghezza × log2 dei caratteri possibili): sotto 60 bit Debole (rosso), da 60 a 79 Accettabile (ambra), da 80 Forte (verde); soglie in `passwordStrength.ts`. Il livello è sempre scritto, mai solo colore, e c'è la legenda.
  - Password mai salvata (niente `localStorage`) né inviata.
- **CSP in produzione** (`client/vite/contentSecurityPolicy.ts`): script e connessioni solo `'self'`.
  - Niente script inline: per questo il tema iniziale è in `public/theme-init.js`.
  - Una nuova dipendenza esterna (API, font, CDN) richiede di aggiornare la CSP e di valutarne l'impatto sulla privacy.
- **Nuova utility:**
  - crea `pages/XPage.tsx`, i componenti in `components/features/<x>/` e una voce in `UTILITIES`;
  - non toccare a mano navbar, home o router;
  - la `description` in `UTILITIES` (box della home) dice solo cosa fa l'utility: niente frasi sulla privacy
    («Tutto avviene nel browser…», «non lascia il dispositivo»), che stanno già nella `PrivacyNote` della pagina (scelta dell'utente).
- **Short URL disattivato** (scelta dell'utente, 20 ottobre 2026): il sito è solo frontend.
  - Il backend Express + MongoDB, `docker-compose.yml`, `.env.example` e l'e2e `short-url.spec.ts` sono archiviati in
    `../utility-hub-backend-backup` (fuori dal repository) (`RESTORE.md` spiega API e come ripristinarli).
  - Il codice client (pagina, `features/short-url`, `useShortUrls`, `shortUrlApi`, `lib/short-url`, `aliasRules`) resta, con `enabled: false` in `UTILITIES`: non cancellarlo e non riattivarlo senza indicazioni.
  - Privacy, Termini, About e 404 non citano più lo short URL: se torna, vanno aggiornati.
  - Regole se torna: alias `/^[a-zA-Z0-9_-]{3,32}$/`, codici generati di 7 caratteri; niente click per link né storico globale;
    cronologia degli ultimi 5 link nel `localStorage` (`short-url-history`); il contatore "Servizio utilizzato N volte" deve partire da zero in produzione.
- In sospeso, da non implementare senza indicazioni dell'utente:
  - **Riassunto PDF via AI:** il piano gratuito di Gemini non si può usare per utenti nel SEE (EEA).
  - **Deploy e CI su Netlify** (frontend statico; un futuro backend potrebbe andare su Firebase, solo con piani gratuiti: scelta dell'utente).
- Repository git su GitHub: fai commit e push solo se l'utente lo chiede.

## Prima di chiudere un'attività
1. `npm run typecheck` (obbligatorio).
2. `npm test` se tocchi `lib/` o `services/`. Aggiungi o aggiorna i test unitari per la logica pura.
3. `npm run test:e2e` se cambia il comportamento visibile. Salta questo passo se l'utente
   ha chiesto di non eseguire i test.
4. Per le modifiche di UI, controlla nel browser pane (config `utility-hub` in `.claude/launch.json`):
   tema chiaro e scuro, 375px, console senza errori.
5. Se cambi script, struttura o API, aggiorna README e questo file.
