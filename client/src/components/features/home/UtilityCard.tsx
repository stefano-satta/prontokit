import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import type { Utility } from '../../../models/utility';

export function UtilityCard({ utility }: { utility: Utility }) {
  const { path, title, description, icon: Icon, preview: Preview } = utility;

  return (
    <Link
      to={path}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,box-shadow,translate] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_2px_4px_rgb(15_23_42/0.04),0_16px_32px_-16px_rgb(37_99_235/0.35)]"
    >
      <div className="relative grid h-48 place-items-center border-b border-border bg-surface-muted px-10">
        <div className="flex w-full max-w-72 items-center justify-center text-fg">
          <Preview />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-6">
        <div className="flex items-center gap-2.5">
          <Icon className="size-5 text-primary-text" aria-hidden />
          <h2 className="text-lg font-semibold tracking-[-0.01em]">{title}</h2>
        </div>
        <p className="text-[15px] text-fg-muted text-pretty">{description}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-medium text-primary-text">
          Apri lo strumento
          <ArrowRight className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
