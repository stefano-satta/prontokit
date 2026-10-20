import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { buttonClasses } from '../components/common/Button';
import { Logo } from '../components/common/Logo';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Pagina non trovata');

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-10 px-4 py-16 text-center">
      <Logo />
      <div className="flex flex-col items-center gap-4">
        <p className="tabular font-mono text-[88px] leading-none font-semibold tracking-[-0.04em] text-primary-text sm:text-[120px]">
          404
        </p>
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-balance sm:text-[32px]">Pagina non trovata</h1>
        <p className="max-w-[48ch] text-[15px] text-fg-muted text-pretty">
          Il link che hai seguito non esiste o è stato spostato. Controlla di averlo copiato per intero.
        </p>
      </div>
      <Link to="/" className={buttonClasses('primary', 'lg')}>
        <ArrowLeft className="size-[18px]" aria-hidden />
        Torna alla home
      </Link>
    </main>
  );
}
