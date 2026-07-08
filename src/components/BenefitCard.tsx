import type { LucideIcon } from 'lucide-react';

interface BenefitCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function BenefitCard({ icon: Icon, title, description }: BenefitCardProps) {
  return (
    <article className="rounded-[22px] border border-brand-blue/15 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-hero">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-brand-yellow text-ink"><Icon size={23} /></div>
      <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}
