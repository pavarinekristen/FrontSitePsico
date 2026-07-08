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
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
      <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-blue">{eyebrow}</span>
      <h2 className="mt-3 font-display text-4xl font-semibold leading-none tracking-normal text-ink md:text-5xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-slate-700">{description}</p> : null}
    </div>
  );
}
