import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = 'left', className }: SectionHeadingProps) {
  return (
    <div className={cn('max-w-2xl', align === 'center' ? 'mx-auto text-center' : 'mx-auto text-center md:mx-0 md:text-left', className)}>
      <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-blue dark:text-brand-sky">{eyebrow}</span>
      <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-normal text-ink dark:text-white sm:text-4xl md:text-5xl md:leading-none">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-slate-700 dark:text-slate-300">{description}</p> : null}
    </div>
  );
}
