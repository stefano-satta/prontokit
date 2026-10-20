import { HomeHighlights } from '../components/features/home/HomeHighlights';
import { UtilityCard } from '../components/features/home/UtilityCard';
import { UTILITIES } from '../config/utilities';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function HomePage() {
  useDocumentTitle();

  return (
    <div className="flex flex-col gap-8 sm:gap-8">
      <div className="relative py-8 sm:py-14">
        {/* Sfondo decorativo centrato sulla pagina; sotto le card grazie all'isolate di RootLayout */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -z-10 aspect-[1440/860] w-[90rem] max-w-none -translate-1/2 bg-[url('/bg-gradient.svg')] bg-contain bg-center bg-no-repeat dark:opacity-50"
        />
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h1 className="text-[36px] leading-[1.1] font-bold tracking-[-0.03em] text-balance sm:text-[60px]">
            Meno tempo perso. Più cose fatte.
          </h1>
          <p className="text-[17px] text-pretty text-fg-muted">
            Strumenti online gratuiti per file, link, dati e produttività. <br/> Tutto quello che ti serve, senza registrazione.
          </p>
        </div>
        <div className="mt-8 sm:mt-8">
          <HomeHighlights />
        </div>
      </div>
      <section aria-labelledby="utilities-title" className="flex flex-col gap-5">
        <h2 id="utilities-title" className="sr-only">
          Utility disponibili
        </h2>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {UTILITIES.map((utility) => (
            <UtilityCard key={utility.id} utility={utility} />
          ))}
        </div>
      </section>
    </div>
  );
}
