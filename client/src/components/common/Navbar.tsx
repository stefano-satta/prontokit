import { NavLink } from 'react-router';
import { cn } from '../../lib/cn';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { ToolsMenu } from './ToolsMenu';

/** Navbar "a isola": una pillola di vetro sospesa sopra il contenuto, centrata e più stretta della pagina. */
export function Navbar() {
  return (
    <header className="sticky top-0 z-20 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="relative mx-auto flex h-14 max-w-2xl items-center gap-2 pr-1.5 pl-3 sm:pr-2 sm:pl-5">
        {/* Il vetro sta su un livello a parte: un backdrop-filter sull'antenato impedirebbe la sfocatura della tendina */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full border border-glass-border bg-glass shadow-island backdrop-blur-xl backdrop-saturate-150"
        />
        <Logo />
        <nav aria-label="Principale" className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn(
                'flex h-10 items-center rounded-full px-3 text-sm sm:px-4 font-medium transition-colors',
                isActive ? 'bg-primary-soft text-primary-text' : 'text-fg-muted hover:bg-fg/6 hover:text-fg',
              )
            }
          >
            Home
          </NavLink>
          <ToolsMenu />
          <span aria-hidden className="mx-1 hidden h-5 w-px bg-glass-border sm:block" />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
