import { Link } from 'react-router';
import { FOOTER_LINKS } from '../../config/footerLinks';
import { SITE } from '../../config/site';
import { cn } from '../../lib/cn';
import type { FooterLink } from '../../models/footerLink';

interface FooterProps {
  appName?: string;
  authorUrl?: string;
  links?: readonly FooterLink[];
  className?: string;
}

export function Footer({ appName = SITE.name, authorUrl = SITE.authorUrl, links = FOOTER_LINKS, className }: FooterProps) {
  return (
    <footer className={cn('border-t border-border', className)}>
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-[13px] text-fg-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {appName}. Realizzato con Claude Code e il suo{' '}
          <a href={authorUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-text hover:underline">
            assistente
          </a>
          .
        </p>
        {links.length > 0 && (
          <nav aria-label="Link del footer">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {links.map(({ label, path }) => (
                <li key={path}>
                  <Link to={path} className="rounded-sm hover:text-fg hover:underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </footer>
  );
}
