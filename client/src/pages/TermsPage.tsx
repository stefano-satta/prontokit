import { ScrollText } from 'lucide-react';
import { Link } from 'react-router';
import { LegalDocument, LegalList, LegalSection } from '../components/features/legal/LegalDocument';
import { SITE } from '../config/site';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const linkClass = 'font-medium text-primary-text hover:underline';

export default function TermsPage() {
  useDocumentTitle('Termini e condizioni');

  return (
    <LegalDocument
      icon={ScrollText}
      title="Termini e condizioni"
      description={`Le regole per usare ${SITE.name}. Usando il sito accetti questi termini.`}
      updatedAt="20 ottobre 2026"
    >
      <LegalSection title="Il servizio">
        <p>
          {SITE.name} è una raccolta di strumenti web gratuiti: QR code, conversione da PDF a Markdown e da Excel a
          CSV, trascrizione vocale, grafici, confronto JSON, conversione di immagini, unione di PDF e generazione di
          password. Non serve un account. Il servizio è offerto così com'è e può
          cambiare, essere sospeso o interrotto in qualsiasi momento, anche senza preavviso.
        </p>
      </LegalSection>

      <LegalSection title="Uso consentito">
        <p>Puoi usare gli strumenti per scopi personali e professionali. Non è consentito:</p>
        <LegalList>
          <li>usare gli strumenti per attività illegali, phishing, spam o per violare diritti di terzi;</li>
          <li>
            sovraccaricare il servizio con richieste automatiche o tentare di aggirarne le protezioni.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="I tuoi contenuti">
        <p>
          I file, i testi e i link che usi restano tuoi e ne sei responsabile: assicurati di avere il diritto di
          usarli. Gli strumenti lavorano nel browser e non ci inviano nulla, come descritto nella{' '}
          <Link to="/privacy" className={linkClass}>
            privacy policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Risultati e responsabilità">
        <p>
          Le conversioni e le trascrizioni sono automatiche e possono contenere errori o perdere parte della
          formattazione: controlla sempre il risultato prima di usarlo. Non garantiamo che il servizio sia sempre
          disponibile. Nei limiti consentiti dalla legge, l'autore non
          risponde di danni derivanti dall'uso del sito o dall'impossibilità di usarlo.
        </p>
      </LegalSection>

      <LegalSection title="Modifiche e legge applicabile">
        <p>
          Possiamo aggiornare questi termini: la versione valida è sempre quella pubblicata qui, con la data in alto.
          I termini sono regolati dalla legge italiana. Per domande puoi scrivere all'autore tramite il suo{' '}
          <a href={SITE.authorUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
            sito personale
          </a>
          .
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
