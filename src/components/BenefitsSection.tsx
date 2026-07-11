import { Award, Ban, CloudCog, TrendingUp } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

const benefits = [
  {
    icon: Award,
    title: 'Profissionalismo elevado',
    description: 'Transforme sua prática clínica em uma operação de alto nível, com ambiente dedicado e gestão de excelência.',
  },
  {
    icon: CloudCog,
    title: 'Gestão 100% automática',
    description: 'Reservas e horários registrados automaticamente, sem controles manuais ou planilhas.',
  },
  {
    icon: TrendingUp,
    title: 'Previsibilidade financeira',
    description: 'Clareza sobre custos e disponibilidade de horários para organizar sua agenda com antecedência.',
  },
  {
    icon: Ban,
    title: 'Zero burocracia',
    description: 'Menos mensagens para marcar salas e mais autonomia para resolver tudo em poucos passos.',
  },
];

export function BenefitsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-5 md:px-8 md:py-20">
      <SectionHeading
        align="center"
        eyebrow="Benefícios de fazer parte"
        title={<>Coworking psicológico com <span className="rounded-md bg-title-mark px-1 text-brand-navy">profissionalismo e praticidade</span></>}
        description="Uma estrutura pensada para psicólogos que querem atender com qualidade, controle de agenda e menos burocracia operacional."
      />
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <article key={benefit.title} className="rounded-[22px] border border-brand-blue/15 bg-white p-6 text-center shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-hero">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-brand-blue/15 bg-brand-soft text-brand-blue shadow-sm">
                <Icon size={29} />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-ink">{benefit.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{benefit.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
