import { ShieldCheck } from 'lucide-react';
import { LegalDocument, LegalSection } from '../components/features/legal/LegalDocument';
import { SITE } from '../config/site';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const linkClass = 'font-medium text-primary-text hover:underline';

export default function PrivacyPage() {
  useDocumentTitle('Privacy policy');

  return (
    <LegalDocument
      icon={ShieldCheck}
      title="Privacy policy"
      description={`Quali dati tratta ${SITE.name}, perché e per quanto tempo. In breve: nessun account, nessun cookie di profilazione e quello che inserisci resta nel tuo browser.`}
      updatedAt="20 ottobre 2026"
    >
      <LegalSection title="Titolare del trattamento">
        <p>
          Il titolare è l'autore di {SITE.name}. Per qualsiasi richiesta sulla privacy puoi scrivergli tramite il suo{' '}
          <a href={SITE.authorUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
            sito personale
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Strumenti che funzionano solo nel browser">
        <p>
          QR code, PDF in Markdown, Excel in CSV, Generatore di grafici, Confronto JSON, Convertitore di immagini,
          Unisci PDF e Generatore di password elaborano tutto sul tuo dispositivo. File, testi e dati che inserisci
          non ci vengono inviati e non vengono salvati: spariscono quando chiudi la pagina.
        </p>
      </LegalSection>

      <LegalSection title="Trascrizione vocale">
        <p>
          La dettatura usa il riconoscimento vocale integrato nel browser. {SITE.name} non riceve né salva l'audio o il
          testo, ma il browser può inviare l'audio ai server del suo produttore per elaborarlo: Google per Chrome,
          Microsoft per Edge, Apple per Safari. In quel caso vale l'informativa privacy del produttore del browser.
          L'accesso al microfono parte solo quando premi il pulsante e puoi revocarlo dalle impostazioni del browser.
        </p>
      </LegalSection>

      <LegalSection title="Dati salvati nel tuo browser">
        <p>
          Non usiamo cookie né strumenti di analisi o pubblicità. Usiamo il <strong className="font-semibold">localStorage</strong> del browser
          solo per ricordare il tema chiaro o scuro che hai scelto.
        </p>
        <p>
          Questo dato resta sul tuo dispositivo, non ci viene inviato e puoi cancellarlo in qualsiasi momento
          svuotando i dati del sito dalle impostazioni del browser.
        </p>
      </LegalSection>

      <LegalSection title="Log tecnici">
        <p>
          Come ogni sito, il servizio di hosting può registrare in modo automatico dati tecnici delle richieste (ad
          esempio indirizzo IP, data e browser) per sicurezza e diagnosi dei problemi. Questi log non vengono usati per
          identificarti o profilarti.
        </p>
      </LegalSection>

      <LegalSection title="Hosting e badge di Netlify">
        <p>
          Il sito è ospitato da Netlify, che sul piano gratuito aggiunge in basso a destra il badge «Powered by
          Netlify». Il codice del badge è di Netlify ed è servito dal nostro stesso indirizzo: mostra il badge e i suoi
          link, non legge quello che inserisci negli strumenti e non invia dati. Se apri i suoi link o usi il suo modulo
          arrivi sul sito di Netlify, dove vale la{' '}
          <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer" className={linkClass}>
            privacy policy di Netlify
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Base giuridica e diritti">
        <p>
          Gli strumenti non raccolgono dati personali. I log tecnici dell'hosting sono trattati per il legittimo
          interesse a mantenere il sito sicuro e funzionante. In base al GDPR hai diritto di chiedere accesso, rettifica
          o cancellazione dei dati che ti riguardano e di presentare reclamo al Garante per la protezione dei dati
          personali.
        </p>
      </LegalSection>

      <LegalSection title="Modifiche">
        <p>
          Se cambiano gli strumenti o i dati trattati aggiorneremo questa pagina e la data in alto. Ti consigliamo di
          ricontrollarla di tanto in tanto.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
