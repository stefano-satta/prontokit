import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { NavLink, matchPath, useLocation } from 'react-router';
import { UTILITIES } from '../../config/utilities';
import { useDismiss } from '../../hooks/useDismiss';
import { cn } from '../../lib/cn';

/**
 * Voce "Tools" con l'elenco delle utility (pattern disclosure, non un menu ARIA: sono link di navigazione).
 * Pannello di vetro sotto l'isola: allineato a destra su desktop, largo quanto l'isola su mobile (con velo).
 */
export function ToolsMenu() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const onUtilityPage = UTILITIES.some(({ path }) => matchPath(path, pathname));

  // Chiude il pannello a ogni cambio pagina
  useEffect(() => setOpen(false), [pathname]);

  const dismiss = useCallback((byKeyboard: boolean) => {
    setOpen(false);
    if (byKeyboard) buttonRef.current?.focus();
  }, []);
  useDismiss(containerRef, open, dismiss);

  return (
    <div
      ref={containerRef}
      onBlur={(event) => {
        // Con Tab fuori dall'elenco il pannello si chiude
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex h-10 items-center gap-1.5 rounded-full pr-2.5 pl-3 text-sm sm:pr-3 sm:pl-4 font-medium transition-colors',
          open || onUtilityPage ? 'bg-primary-soft text-primary-text' : 'text-fg-muted hover:bg-fg/6 hover:text-fg',
        )}
      >
        Tools
        <ChevronDown className={cn('size-4 transition-transform duration-200', open && 'rotate-180')} aria-hidden />
      </button>

      {open && (
        <>
          {/* Velo sotto il pannello, solo su mobile: un tap lo chiude (Esc vale da tastiera) */}
          <div aria-hidden className="fixed inset-0 -z-20 bg-bg/60 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)} />
          <div
            id={panelId}
            className={cn(
              'absolute inset-x-0 top-full mt-2 origin-top rounded-3xl border border-glass-border bg-glass-strong p-2 shadow-island',
              'animate-[island-in_180ms_var(--ease-out-expo)] backdrop-blur-xl backdrop-saturate-150',
              'md:inset-x-auto md:right-0 md:w-80 md:origin-top-right',
            )}
          >
            <ul className="flex flex-col gap-1">
              {UTILITIES.map(({ id, path, title, icon: Icon }) => (
                <li key={id}>
                  <NavLink
                    to={path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-2xl px-2.5 py-2 text-[15px] font-medium transition-colors md:text-sm',
                        isActive ? 'bg-primary-soft text-primary-text' : 'text-fg hover:bg-fg/6',
                      )
                    }
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-fg/6 text-primary-text">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    {title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
