import { Outlet, ScrollRestoration, useNavigation } from 'react-router';
import { Footer } from '../common/Footer';
import { Navbar } from '../common/Navbar';
import { Spinner } from '../common/Spinner';

/**
 * Le route `lazy` non sospendono il render: il router scarica la pagina e intanto tiene quella attuale.
 * Questa barra segnala l'attesa, utile con una connessione lenta.
 */
function NavigationProgress() {
  const loading = useNavigation().state === 'loading';
  return (
    <div role="status" aria-live="polite" className="fixed inset-x-0 top-0 z-40 h-0.5 overflow-hidden">
      {loading && (
        <>
          <div className="h-full w-1/3 animate-[indeterminate_1.2s_ease-in-out_infinite] bg-primary" aria-hidden />
          <span className="sr-only">Caricamento pagina</span>
        </>
      )}
    </div>
  );
}

/** Primo caricamento su una route lazy: il router aspetta il modulo della pagina prima di disegnare il layout. */
export function RootHydrateFallback() {
  return (
    <div className="grid min-h-dvh place-items-center text-fg-muted">
      <Spinner label="Caricamento pagina" />
    </div>
  );
}

export function RootLayout() {
  return (
    <div className="isolate flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-30 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2"
      >
        Vai al contenuto
      </a>
      <NavigationProgress />
      <Navbar />
      {/* Il taglio orizzontale (sfondi decorativi più larghi della pagina) sta qui e non sul contenitore della navbar:
          in WebKit (iOS) uno sticky dentro un antenato con overflow non è mosso dal compositor e sobbalza durante lo scroll */}
      <div className="flex flex-1 flex-col overflow-x-clip">
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
          <Outlet />
        </main>
        <Footer />
      </div>
      <ScrollRestoration />
    </div>
  );
}
