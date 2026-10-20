import { Bug, Lightbulb } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { buttonClasses } from '../components/common/Button';
import { Panel } from '../components/common/Panel';
import { SITE } from '../config/site';
import { UTILITIES } from '../config/utilities';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { mailtoHref } from '../lib/mailto';

const linkClass = 'font-medium text-primary-text hover:underline';

const BUG_MAIL = mailtoHref(SITE.contactEmail, {
  subject: `[${SITE.name}] Segnalazione bug`,
  body: 'Strumento:\nCosa stavo facendo:\nCosa ho inserito (link, file, testo):\nCosa mi aspettavo:\nCosa è successo invece:\nBrowser e dispositivo:\n',
});

const IDEA_MAIL = mailtoHref(SITE.contactEmail, {
  subject: `[${SITE.name}] Proposta di nuova utility`,
  body: 'Il problema che voglio risolvere:\nCome lo risolvo oggi:\nCosa dovrebbe fare lo strumento:\n',
});

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-[-0.015em] text-balance text-fg">{title}</h2>
      {children}
    </section>
  );
}

export default function AboutPage() {
  useDocumentTitle('About');

  return (
    <article className="mx-auto flex max-w-[68ch] flex-col gap-12 text-[16px] leading-relaxed text-fg-muted text-pretty">
      <header className="flex flex-col gap-5">
        <p className="text-sm font-medium tracking-wide text-primary-text uppercase">About ProntoKit</p>
        <h1 className="text-[32px] leading-tight font-semibold tracking-[-0.025em] text-balance text-fg sm:text-[40px]">
          Piccoli strumenti, fatti bene, che non chiedono niente in cambio.
        </h1>
        <p className="text-[18px] text-fg">
          {SITE.name} raccoglie le utility che servono per cinque minuti e poi si dimenticano: un QR code da stampare,
          un link troppo lungo, un PDF da dare in pasto a un'intelligenza artificiale. Sono gratis, non chiedono un
          account e non mostrano pubblicità.
        </p>
      </header>

      <Section title="Come è nato">
        <p>
          {SITE.name} è cominciato come un esperimento: volevo capire fin dove si arriva costruendo un'applicazione
          vera, dal primo file alla messa online, insieme a Claude Code, l'assistente di programmazione di Anthropic.
          La divisione dei compiti è semplice. Io decido cosa serve, come deve comportarsi e quando è pronto;
          Claude Code mi aiuta a scriverlo, a provarlo e a trovare i casi a cui non avevo pensato.
        </p>
        <p>
          Strada facendo l'esperimento è diventato qualcosa che uso davvero. Ogni volta che mi serviva una
          conversione al volo finivo su siti pieni di banner, finestre per i cookie e inviti a registrarsi, senza
          sapere dove finissero i file che caricavo. Allora ho provato a fare il contrario.
        </p>
      </Section>

      <Section title="Le regole che mi sono dato">
        <p>
          <strong className="font-semibold text-fg">Quello che si può fare nel browser resta nel browser.</strong> PDF,
          fogli Excel, immagini, grafici e QR code vengono elaborati sul tuo dispositivo: non c'è un server che li
          riceve, quindi non c'è niente da conservare o da perdere. I dettagli sono nella{' '}
          <Link to="/privacy" className={linkClass}>
            privacy policy
          </Link>
          .
        </p>
        <p>
          <strong className="font-semibold text-fg">Niente account, niente pubblicità, niente tracciamento.</strong>{' '}
          Apri la pagina e usi lo strumento. Non ci sono cookie di profilazione né statistiche su quello che fai.
        </p>
        <p>
          <strong className="font-semibold text-fg">Uno strumento, un compito.</strong> Ogni pagina fa una cosa sola e
          la fa per intero: funziona dal telefono, si usa anche solo con la tastiera, ha il tema chiaro e quello scuro,
          e quando qualcosa va storto ti dice cosa è successo e come rimediare.
        </p>
      </Section>

      <Section title="A che punto sono">
        <p>
          Oggi gli strumenti sono {UTILITIES.length}, dal{' '}
          <Link to="/qr-code" className={linkClass}>
            generatore di QR code
          </Link>{' '}
          alla trascrizione vocale. Preferisco aggiungerne pochi e curarli che riempire il sito di pagine tutte uguali:
          per questo i prossimi li sceglierò partendo da chi li usa.
        </p>
      </Section>

      <Panel aria-labelledby="feedback-title" className="flex flex-col gap-6 p-6 text-[15px] sm:p-8">
        <div className="flex flex-col gap-3">
          <h2 id="feedback-title" className="text-xl font-semibold tracking-[-0.015em] text-balance text-fg">
            Hai trovato un bug o ti manca uno strumento?
          </h2>
          <p>
            Scrivimi. Se qualcosa non funziona, raccontami cosa stavi facendo, cosa hai inserito e con quale browser:
            vale più di mille "non va". Se ti serve una nuova utility, descrivimi il problema che vuoi risolvere, non
            solo il nome dello strumento. Molte delle idee migliori arrivano così.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href={BUG_MAIL} className={buttonClasses('primary', 'lg')}>
            <Bug className="size-[18px]" aria-hidden />
            Segnala un bug
          </a>
          <a href={IDEA_MAIL} className={buttonClasses('secondary', 'lg')}>
            <Lightbulb className="size-[18px]" aria-hidden />
            Proponi un'utility
          </a>
        </div>
        <p className="text-sm">
          I pulsanti aprono il tuo programma di posta con un modello già pronto. Puoi anche scrivere direttamente a{' '}
          <a href={mailtoHref(SITE.contactEmail)} className={linkClass}>
            {SITE.contactEmail}
          </a>
          .
        </p>
      </Panel>
    </article>
  );
}
