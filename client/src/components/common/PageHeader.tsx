import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PageHeader({ title, description, icon: Icon }: PageHeaderProps) {
  return (
    <header className="flex items-start gap-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-text">
        <Icon className="size-6" aria-hidden />
      </span>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em] text-balance sm:text-[32px]">
          {title}
        </h1>
        <p className="max-w-[60ch] text-[15px] text-fg-muted text-pretty">{description}</p>
      </div>
    </header>
  );
}
