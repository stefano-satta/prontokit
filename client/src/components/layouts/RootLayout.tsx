import { Suspense } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';
import { Footer } from '../common/Footer';
import { Navbar } from '../common/Navbar';
import { Spinner } from '../common/Spinner';

function PageFallback() {
  return (
    <div className="grid min-h-[40vh] place-items-center text-fg-muted">
      <Spinner label="Caricamento pagina" />
    </div>
  );
}

export function RootLayout() {
  return (
    <div className="isolate flex min-h-dvh flex-col overflow-x-clip">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-30 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2"
      >
        Vai al contenuto
      </a>
      <Navbar />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
