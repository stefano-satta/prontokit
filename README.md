# ProntoKit

Raccolta di utility web, solo frontend: tutto gira nel browser e non c'è un backend. Oggi include:

- **Generatore di preventivi** (`/quote-generator`): fornitore, cliente, voci illimitate (descrizione, quantità, unità, prezzo, sconto), sconto globale, imponibile + IVA da aggiungere + totale da pagare, validità, condizioni, firma per accettazione, logo, valuta e colore; anteprima fedele e download del PDF A4, tutto nel browser.
- **Generatore di QR code** (`/qr-code`): da un URL a un QR code scaricabile in PNG o SVG (generato nel browser).
- **PDF in Markdown** (`/pdf-markdown`): da un PDF (max 25 MB) a un file Markdown ottimizzato per gli LLM, convertito interamente nel browser.
- **Excel in CSV** (`/excel-csv`): da un file .xlsx/.xlsm/.xlsb/.xls/.ods (max 25 MB) a un CSV per foglio, o a uno ZIP con tutti i fogli, convertito interamente nel browser.
- **Trascrizione vocale** (`/speech-to-text`): dettatura in italiano (predefinito), inglese, francese o spagnolo; il testo compare mentre si parla in un'area modificabile, con tasti per inserire la punteggiatura, e si scarica in `.txt`.
- **Confronto JSON** (`/json-diff`): due riquadri affiancati (impilati su mobile) con righe diverse evidenziate, errori di sintassi spiegati con riga e colonna, Formatta (2 spazi) e Minifica del JSON di destra; il JSON di destra si scarica in `.json` o si copia solo quando è valido. Tutto nel browser.
- **Generatore di grafici** (`/chart-generator`): grafici a barre (verticali o orizzontali), a torta/ciambella o a linee da righe `etichetta;valore`, con tabella dei dati; grafico e tabella si scaricano in PNG o si copiano in SVG, tutto nel browser.
- **Convertitore di immagini** (`/image-converter`): fino a 5 immagini JPG, PNG, WebP, AVIF o BMP convertite in PNG, JPG o WebP, con tabella dei risultati (miniatura, nome, formato, peso) e download singolo o in ZIP, tutto nel browser.
- **Unisci PDF** (`/pdf-merge`): da 2 a 5 PDF (max 25 MB ciascuno) uniti in un unico file nell'ordine scelto, tutto nel browser; i PDF protetti vengono scartati.
- **Generatore di password** (`/password-generator`): password casuali da 10 a 30 caratteri con maiuscole, minuscole, numeri e caratteri speciali a scelta, indicatore di sicurezza (debole, accettabile, forte) con legenda e copia negli appunti, tutto nel browser.

La utility **Short URL** (`/short-url`) è implementata nel client ma disattivata (`enabled: false` in `client/src/config/utilities.ts`): ha bisogno di un backend. Il server Express + MongoDB è archiviato fuori dal progetto, in `../utility-hub-backend-backup`, con le istruzioni per ripristinarlo in `RESTORE.md`.

## Stack

| Parte    | Tecnologie                                                     |
| -------- | -------------------------------------------------------------- |
| Client   | React 19, TypeScript, React Router, Tailwind CSS v4, Vite      |
| PDF      | PDF.js (Mozilla, Apache-2.0) in Web Worker, pdf-lib (unione, preventivi) |
| Excel    | SheetJS CE 0.20.3 (Apache-2.0) in Web Worker, fflate (ZIP)     |
| Voce     | Web Speech API del browser (nessuna libreria)                  |
| Grafici  | Chart.js 4 con react-chartjs-2                                 |
| Test     | Vitest (unitari), Playwright (e2e)                             |

## Requisiti

- Node.js 20+ (testato con Node 24)

## Avvio rapido

```bash
npm install
npm run dev            # client su :5173
```

Apri http://localhost:5173. Non servono variabili d'ambiente.

## Script

| Comando             | Cosa fa                                              |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Avvia il client in watch                             |
| `npm run build`     | Compila il client in `client/dist`                   |
| `npm run typecheck` | Controllo dei tipi                                   |
| `npm test`          | Test unitari (convertitori, parser, logica delle utility) |
| `npm run test:e2e`  | Test Playwright desktop + mobile                     |

## Deploy (Netlify)

Il sito è statico e si pubblica su Netlify dal repository GitHub `stefano-satta/prontokit`: ogni push su `main` fa un nuovo deploy, ogni pull request un'anteprima. La configurazione è tutta in `netlify.toml`:

- **Build**: `npm run build` dalla root (Node 24), pubblica `client/dist`. Nessuna variabile d'ambiente.
- **SPA**: ogni percorso che non è un file reale va a `index.html` con stato 200, così React Router gestisce le route e la pagina 404.
- **Badge di Netlify**: sul piano gratuito Netlify inietta `/.netlify/scripts/hud`, che disegna il badge in un iframe `srcdoc` con uno script inline. La CSP lo consente tramite hash (`NETLIFY_BADGE_SCRIPT_HASH` in `client/vite/contentSecurityPolicy.ts`): se Netlify cambia lo script, la console del sito mostra un errore CSP con il nuovo hash da copiare lì.
- **Header**: `frame-ancestors 'none'` (il resto della CSP è nel `<meta>` generato dal build), `nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy` con il solo microfono (per la trascrizione vocale), `Cross-Origin-Opener-Policy`. Gli asset con hash in `/assets/` sono in cache per un anno.

Per provare la build di produzione in locale: `npm run build`, poi `npm run preview -w client` (porta 4173).

## PDF in Markdown: privacy e sicurezza

- **Il documento non lascia mai il dispositivo.** Il PDF viene letto in memoria e analizzato con PDF.js in un Web Worker; non esiste alcun endpoint di upload. Un test e2e verifica che durante la conversione non parta nessuna richiesta di rete con dati.
- **Niente persistenza.** Il file e il Markdown vivono solo nello stato React: vengono rilasciati a fine conversione, con "Converti un altro file" o chiudendo la pagina. Nessun `localStorage`, nessun log. La crittografia non serve perché non c'è né trasmissione né archiviazione.
- **Validazione reale del file.** Si controlla la firma `%PDF-` nei primi byte (estensione e MIME type si possono falsificare) e il limite di 25 MB.
- **PDF.js configurato in modo restrittivo.** Form XFA disattivati, nessun caricamento di font remoti; le CMap per le lingue non latine sono servite dalla nostra origine (plugin `client/vite/pdfjsAssets.ts`), mai da CDN.
- **Content Security Policy in produzione** (`client/vite/contentSecurityPolicy.ts`): script e connessioni solo verso la stessa origine, così nessun codice di terze parti può esfiltrare i contenuti. Unica eccezione: lo script inline del badge «Powered by Netlify» (piano gratuito), consentito solo con il suo hash SHA-256, più `app.netlify.com` in `form-action` per il modulo del badge; nessuna connessione esterna è permessa. Lo script del tema è un file esterno (`public/theme-init.js`) proprio per non dover consentire script inline.
- **PDF protetti da password.** La password serve solo ad aprire il file nel browser e non viene salvata.
- **Nome del file scaricato ripulito** da percorsi e caratteri riservati.

Cosa produce il convertitore: front matter YAML (titolo, sorgente, pagine), titoli `#`/`##`/`###` dedotti dalla dimensione del carattere, paragrafi ricomposti con le parole sillabate riunite, elenchi normalizzati, legature tipografiche sciolte, intestazioni/piè di pagina/numeri di pagina ripetuti rimossi e marcatori `<!-- page N -->` per citare la fonte. Limiti: niente OCR per i PDF scansionati (viene mostrato un messaggio) e le tabelle sono rese come testo.

## Excel in CSV: regole di conversione e sicurezza

- **Valori, non formule.** Nel CSV va il valore calcolato salvato nel file. Le formule senza valore salvato (file generati da programmi che non ricalcolano) restano vuote e la pagina lo segnala.
- **Formato "come in Excel italiano".** Separatore di campo `;`, decimali con la virgola e migliaia con il punto (`1.234,50`, `12,5%`), come li mostra la cella. File UTF-8 con BOM e righe CRLF, così Excel lo riapre correttamente.
- **Date** sempre in ISO: `2026-10-16`, `2026-10-16 14:30:00` o `14:30:00` per le sole ore. Le durate (`[h]:mm`) restano come in tabella.
- **Zeri iniziali** conservati: sia i codici salvati come testo sia i numeri con formato tipo `00000`.
- **Celle vuote**: le posizioni vuote in mezzo restano (campi vuoti e righe vuote); righe e colonne vuote in coda vengono tolte.
- **Più fogli**: si sceglie il foglio per nome, oppure "Tutti i fogli" per uno ZIP con un CSV per foglio. I fogli nascosti sono marcati; nello ZIP sono esclusi di default con una casella per includerli, e il riepilogo dice sempre cosa è incluso o escluso. I fogli vuoti non sono convertibili.
- **CSV injection**: le celle di testo che iniziano con `=`, `+`, `-`, `@`, tab o a-capo ricevono un apostrofo davanti; i numeri negativi restano intatti. La pagina dice quante celle sono state modificate.
- **File vuoti, corrotti o protetti** bloccano la conversione con un messaggio che spiega il problema.
- **Sicurezza dell'app**: il file non lascia il browser (un e2e lo verifica); firma reale controllata (ZIP o OLE, non l'estensione); limite di 25 MB; prima di aprire uno ZIP si leggono le dimensioni dichiarate (difesa da zip bomb); limite di 3 milioni di celle; SheetJS gira in un Web Worker dedicato, chiuso a fine conversione o all'annullamento; macro VBA non estratte; nomi di file e di voci dello ZIP ripuliti da percorsi e caratteri riservati.
- **Dipendenza**: SheetJS CE non è aggiornato sul registro npm (lì c'è la 0.18.5, con vulnerabilità note), quindi è installato dal tarball ufficiale `cdn.sheetjs.com`, con integrità bloccata nel `package-lock.json`. Per aggiornarlo: `npm install -w client https://cdn.sheetjs.com/xlsx-<versione>/xlsx-<versione>.tgz`.

## Trascrizione vocale: funzionamento e privacy

- **Motore**: la Web Speech API del browser (`SpeechRecognition`), in modalità continua con risultati provvisori. Funziona su Chrome, Edge e Safari; Firefox non la supporta e la pagina lo dice. Su Chrome/Edge l'audio può essere elaborato dai server di Google/Microsoft, su Safari da Apple: la pagina lo dichiara. L'app non riceve né salva audio o testo e non aggiunge connessioni (la CSP non cambia).
- **Permesso**: al click si chiede prima il microfono con `getUserMedia` (stream chiuso subito), così negazioni e microfono assente hanno messaggi chiari. Serve un contesto sicuro (https o localhost).
- **Sessione**: il browser chiude la sessione dopo un silenzio; finché l'utente non preme "Ferma", si riparte da soli. Lo stop usa `stop()` per non perdere l'ultimo frammento (con un timeout di 3 s).
- **Testo**: il provvisorio si vede in coda nell'area di testo, che resta in sola lettura mentre si registra; a registrazione ferma è modificabile e una nuova dettatura si accoda. Download disattivato durante la registrazione; file `trascrizione-AAAA-MM-GG-HHMM.txt` in UTF-8.
- **Punteggiatura**: le parole dettate non vengono convertite in segni. Tra l'area di testo e il download c'è una barra di tasti (virgola, punto, due punti, punto e virgola, punto esclamativo, punto di domanda, a capo, nuovo paragrafo) che inserisce il segno nella posizione del cursore; l'etichetta compare al passaggio del mouse. Logica in `client/src/lib/speech-to-text/punctuation.ts`.

## Generatore di grafici: funzionamento

- **Dati**: titolo e textarea condivisi tra i tab Barre, Torta e Linee (cambiando tab non si perde nulla). Una voce per riga, `etichetta;valore`; si divide sull'ultimo `;`, quindi l'etichetta può contenerne altri. Il valore accetta la virgola decimale (`98,5`), il punto decimale (`98.5`) e i punti delle migliaia (`1.250` = 1250). Ogni riga non valida ha un messaggio con il numero di riga; le righe valide restano nel grafico. Massimo 50 righe. Logica in `client/src/lib/chart-generator/`.
- **Opzioni**: barre verticali (predefinito) o orizzontali; torta o ciambella, spicchi in valore o in percentuale sul totale, 1 o 2 decimali. La torta non accetta valori negativi né un totale zero.
- **Grafico**: l'asse dei valori lascia un 12% di margine sopra il massimo; ogni barra (a destra se orizzontale) e ogni punto della linea riporta il suo valore, con una dimensione unica che scende fino a 9px quando le voci sono fitte; sotto quella soglia il valore resta in legenda, tooltip e tabella. L'asse delle etichette le mostra tutte, mai alternate: se manca spazio ruotano fino alla verticale, e oltre i 16 caratteri si accorciano con i puntini. Tutti i tipi hanno la legenda dei dati in colonne (colore, etichetta, dato) a fianco del grafico da tablet in su, sotto su mobile; nell'immagine esportata è sempre a destra. Per barre e linee il dato è il valore inserito, per la torta segue il formato scelto.
- **Tabella**: barre e linee hanno una terza colonna "Rispetto al massimo", con la percentuale del valore sul massimo e una barra di avanzamento nel colore della serie (sotto la percentuale su mobile). La torta mostra invece la percentuale sul totale e la riga Totale.
- **Colori**: misti per barre e spicchi, in ordine fisso da una palette categoriale controllata per il daltonismo (`lib/chart-generator/palette.ts`), con una variante per il tema scuro. La linea usa il primo colore.
- **Esportazione**: il grafico viene ridisegnato fuori schermo a 1200×750 (PNG a doppia densità) e sempre in tema chiaro. Chart.js disegna su canvas, quindi l'SVG del grafico incapsula quel PNG (scelta dell'utente: niente librerie per l'SVG vettoriale). La tabella invece è un SVG vettoriale vero, generato da `tableSvg.ts`, e il suo PNG nasce da quell'SVG. "Copia SVG" mette il codice SVG negli appunti come testo.

## Confronto JSON: funzionamento

- **Validazione**: parser proprio (`lib/json-diff/analyzeJson.ts`) invece di `JSON.parse`, così ogni errore ha riga, colonna e un messaggio in italiano che dice come correggere (virgola mancante o di troppo, virgolette singole, chiavi senza virgolette, commenti, `True`/`None`...). Il suggerimento si dà solo quando la causa è certa (es. virgola mancante solo se dopo c'è davvero una chiave `"nome":`); Se il parser si accorge dell'errore più avanti (es. manca la `[` o la `{` dopo `"chiave":`, o una `]` di chiusura) si provano le correzioni più probabili e se ne indica una solo se rende il JSON valido; altrimenti il messaggio dice soltanto il carattere inatteso e cosa serviva lì. Per un JSON incompleto l'errore è alla fine del testo. Profondità massima 1000.
- **Formatta e Minifica** riscrivono i token: stringhe e numeri restano come scritti (niente perdita di cifre nei numeri grandi, chiavi duplicate conservate). Agiscono solo sul riquadro di destra e solo se è valido, con "Annulla" per l'ultima azione (anche Svuota, che vuota entrambi).
- **Confronto**: riga per riga con l'algoritmo di Myers (`lib/json-diff/lineDiff.ts`); spazi a fine riga e a capo finale non contano. Esito in una riga di testo sopra i riquadri (niente box né elenco): identici, stessi dati (cambia solo forma o ordine delle chiavi) o diversi. Gli errori di sintassi sono spiegati solo sotto il riquadro che li contiene, con "Vai all'errore". Righe diverse in verde da entrambi i lati, riga con l'errore in rosso. Oltre 2000 modifiche la parte centrale è segnata come un unico blocco.
- **Download e copia** solo del riquadro di destra e solo se è JSON valido; file `json-AAAA-MM-GG-HHMM.json`.

## Convertitore di immagini: funzionamento e privacy

- **Ingresso**: fino a 5 file per volta (trascinati o scelti), massimo 25 MB ciascuno. Il formato si riconosce dalla firma reale del file (`lib/image-converter/imageFormats.ts`), non da estensione o MIME type; i file non supportati, vuoti, troppo grandi o oltre il quinto sono scartati con un avviso che li elenca.
- **Conversione**: nel browser, una immagine alla volta, ridisegnandola su un canvas (`services/image/convertImage.ts`); niente upload né endpoint. JPG e WebP con qualità 0,9; in JPG la trasparenza diventa bianca. I metadati (EXIF, posizione GPS) non vengono copiati. Di WebP e AVIF animati si converte solo il primo fotogramma, e la tabella lo dice. Oltre 100 megapixel l'immagine è rifiutata.
- **Stesso formato**: le immagini già nel formato scelto non si convertono (in tabella "Già PNG, non convertita"); se lo sono tutte, la conversione non parte e un messaggio chiede di scegliere un altro formato.
- **Download**: una sola immagine convertita si scarica direttamente; da due in su, "Scarica ZIP" crea `immagini_<formato>_prontokit.zip` (il nome del sito viene da `SITE.name`) con fflate (senza compressione, i formati sono già compressi). Ogni riga ha anche il suo download. I nomi sono ripuliti e resi univoci (`foto.jpg` e `foto.webp` → `foto.png`, `foto (2).png`).
- **Compatibilità**: AVIF si legge su Chrome, Edge, Firefox e Safari 16.4+; se il browser non sa leggere o creare un formato (es. WebP su Safari meno recenti), la riga mostra l'errore e come rimediare.

## Unisci PDF: funzionamento e privacy

- **Ingresso**: fino a 5 file per volta (trascinati o scelti), massimo 25 MB ciascuno, riconosciuti dalla firma `%PDF-` (`lib/validatePdf.ts`). Ogni file viene letto con pdf-lib appena aggiunto (`services/pdf-merge/pdfMerger.ts`): numero di pagine nell'elenco, file vuoti, danneggiati, non PDF o oltre il quinto scartati con un avviso.
- **PDF protetti**: un PDF con il dizionario `/Encrypt` (password di apertura o solo restrizioni) non si può unire, perché pdf-lib non decifra e le pagine copiate sarebbero illeggibili. Viene scartato subito con un messaggio che chiede di salvarne una copia senza protezione. Se il parser fallisce prima del controllo, `lib/pdf-merge/encryption.ts` cerca `/Encrypt` nei byte per distinguere "protetto" da "danneggiato".
- **Unione**: servono almeno 2 PDF; l'ordine si cambia con le frecce di ogni riga. Le pagine sono copiate in un PDF nuovo, in memoria, senza upload né endpoint. "Scarica PDF unito" salva `pdf_unito_prontokit.pdf` (il nome del sito viene da `SITE.name`).

## Generatore di password: funzionamento e sicurezza

- **Casualità**: solo il generatore crittografico del browser (`crypto.getRandomValues`), mai `Math.random`. Gli interi casuali scartano i valori oltre l'ultimo multiplo dell'intervallo, così ogni carattere ha la stessa probabilità (`lib/password-generator/generatePassword.ts`).
- **Composizione**: almeno un carattere per ogni tipo scelto, il resto pescato da tutti i tipi, poi un rimescolamento Fisher-Yates. Simboli: `!@#$%^&*()-_=+[]{};:,.?/~` (niente spazi, virgolette e backslash, che molti moduli rifiutano). Almeno un tipo resta sempre selezionato.
- **Opzioni**: lunghezza con uno slider da 10 a 30 (predefinita 16), tutti i tipi attivi all'inizio. Ogni modifica genera subito una nuova password; "Genera di nuovo" ne crea un'altra con le stesse opzioni.
- **Sicurezza**: entropia = lunghezza × log2(caratteri possibili). Meno di 60 bit **Debole** (rosso), da 60 a 79 **Accettabile** (ambra), da 80 **Forte** (verde) (`passwordStrength.ts`). La barra a tre segmenti è accompagnata dal nome del livello, dai bit e da una legenda; se la password non è forte la pagina dice quanti caratteri servono.
- **Privacy**: la password resta nello stato React; non viene salvata né inviata. Cifre e simboli sono colorati solo per distinguerli a colpo d'occhio (0/O, 1/l).

## Generatore di preventivi: calcoli, PDF e privacy

- **Preventivo, non fattura**: niente contenuto obbligatorio per legge né invio allo SdI, quindi un PDF basta. La pagina lo ricorda sotto l'intestazione. Una fattura vera richiederebbe l'XML FatturaPA (scelta dell'utente: non la facciamo).
- **Calcoli esatti** (`lib/quote/`): i numeri si leggono all'italiana come nel generatore di grafici (`1.250,50`, anche `1250.5`) e diventano interi scalati con `BigInt`, così non ci sono errori di virgola mobile. Quantità fino a 3 decimali, prezzi unitari fino a 4, sconti fino a 2. Importo di voce = quantità × prezzo × (1 − sconto), arrotondato al centesimo (metà per eccesso). Poi: totale voci → sconto globale (% o importo, mai oltre il totale) → **imponibile** → **IVA** (una sola aliquota per tutto il preventivo, 22/10/5/4/0%, calcolata una volta sull'imponibile) → **totale da pagare**. Con lo 0% si può scrivere il motivo, che va sotto il totale.
- **Validazione** (`validateQuote.ts`): servono numero, data, validità (da 1 a 365 giorni o una data non precedente), nome del fornitore e del cliente e almeno una voce; le voci compilate devono avere descrizione, quantità maggiore di zero e prezzo. L'IBAN, se c'è, si controlla con il mod 97. Finché manca qualcosa "Scarica PDF" è disattivato e l'elenco accanto dice cosa sistemare; sotto i campi compaiono solo gli errori dei valori già scritti.
- **PDF** (`services/quote/quotePdf.ts`, pdf-lib): A4, Helvetica standard (non incorporata, file leggero), testo vero e selezionabile. Intestazione con logo e dati del fornitore, titolo, numero, data e scadenza; riquadro del cliente; oggetto; tabella delle voci con l'intestazione ripetuta a ogni pagina (la colonna Sconto compare solo se serve; una descrizione più lunga di una pagina continua sulla successiva); totali e firma mai spezzati; condizioni di pagamento, consegna, IBAN e note solo se compilati; piè di pagina con "Pagina N di M". I caratteri che Helvetica non ha perdono l'accento o diventano `?` (`pdfText.ts`), invece di bloccare il PDF. File: `preventivo_<numero>.pdf`.
- **Anteprima**: è il PDF stesso, ridisegnato con PDF.js in immagini (350 ms dopo l'ultima modifica). I font standard di PDF.js sono serviti dalla nostra origine (`/pdfjs/standard_fonts/`, plugin `client/vite/pdfjsAssets.ts`), mai da CDN. Un click su una pagina la apre ingrandita in una finestra modale (Esc o «Chiudi» per tornare).
- **Logo**: PNG, JPG, WebP, AVIF o BMP fino a 5 MB, riconosciuto dalla firma; i formati che pdf-lib non legge e le immagini con un lato oltre 1200 px vengono ridisegnati su un canvas.
- **Privacy**: nessun salvataggio (scelta dell'utente: niente `localStorage`), nessuna richiesta di rete con i dati; un e2e lo verifica. Chiudendo la pagina il preventivo si perde, e la nota in pagina lo dice.

## Architettura

```
client/src
  components/
    common/             componenti comuni riusabili (Button, TextField, Panel, Logo, Navbar, ToolsMenu, Footer, ...)
    features/           componenti composti, divisi per area (home, qr, short-url, pdf-markdown, excel-csv, speech-to-text, chart-generator, json-diff, image-converter, pdf-merge, password-generator, quote)
    layouts/            layout delle pagine (RootLayout con navbar e footer)
  config/               utilities.ts (unica fonte delle utility per navbar, home e router; `enabled: false` le nasconde) e site.ts (nome app, link autore)
  hooks/                hook React (useShortUrls, useQrCode, useTheme, ...)
  lib/                  funzioni pure di supporto (validazione, http, download, cn, pdf-markdown/, excel-csv/, speech-to-text/, chart-generator/, json-diff/, image-converter/, pdf-merge/, password-generator/, quote/)
  models/               interfacce e tipi condivisi
  pages/                una pagina per route, caricata in lazy (la 404 è fuori dal layout)
  services/             accesso a API e librerie esterne (shortUrlApi, qrGenerator, pdf/, excel/, speechRecognition, chart/, image/, pdf-merge/, quote/)
  styles/               stili globali e token di design (index.css)
```

Principi applicati:

- **SRP**: pagine, componenti, hook, servizi e funzioni pure hanno un solo compito ciascuno.
- **OCP**: per aggiungere una utility basta una voce in `client/src/config/utilities.ts` più la sua pagina.
- **DIP**: le pagine usano hook e servizi, non le librerie esterne direttamente.
- **DRY**: validazione URL, token di colore e componenti UI condivisi.

### Aggiungere una nuova utility

1. Crea `client/src/pages/NuovaUtilityPage.tsx` (export default) e i suoi componenti in `components/features/<utility>/`.
2. Aggiungi una voce a `UTILITIES` in `client/src/config/utilities.ts`.

Navbar, box della home e route si aggiornano da soli.
