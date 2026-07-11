import { CheckCircle2 } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import type { PlanoAgendamento } from '../types';

const plans = [
  {
    id: 'Light - Hora avulsa',
    name: 'Light',
    range: 'Hora avulsa',
    price: 'R$ 35,00',
    note: 'por hora',
  },
  {
    id: 'Standard - 2 a 4 horas',
    name: 'Standard',
    range: 'De 2 a 4 horas',
    price: 'R$ 30,00',
    note: 'por hora',
  },
  {
    id: 'Full - 5 a 8 horas',
    name: 'Full',
    range: 'De 5 a 8 horas',
    price: 'R$ 25,00',
    note: 'por hora',
  },
  {
    id: 'Premium - acima de 9 horas',
    name: 'Premium',
    range: 'Acima de 9 horas',
    price: 'R$ 20,00',
    note: 'por hora',
  },
] satisfies Array<{ id: PlanoAgendamento; name: string; range: string; price: string; note: string }>;

interface PlansSectionProps {
  selectedPlan: PlanoAgendamento;
  onSelectPlan: (plan: PlanoAgendamento) => void;
}

export function PlansSection({ selectedPlan, onSelectPlan }: PlansSectionProps) {
  function choosePlan(plan: PlanoAgendamento) {
    onSelectPlan(plan);
    window.setTimeout(() => document.getElementById('cadastro')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }

  return (
    <section id="planos" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 md:px-8">
        <SectionHeading
          eyebrow="Planos e valores"
          title={<>Escolha o plano antes de <span className="rounded-md bg-title-mark px-1 text-brand-navy">verificar a agenda</span></>}
          description="Os valores são organizados por faixa de uso. A confirmação do pagamento só acontece depois da checagem de disponibilidade e do cadastro."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <article key={plan.name} className={selectedPlan === plan.id ? 'rounded-[22px] border-2 border-brand-yellow bg-white p-6 shadow-hero transition duration-300 hover:-translate-y-1' : 'rounded-[22px] border border-brand-blue/15 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-hero'}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-2xl font-semibold text-ink">{plan.name}</h3>
                <CheckCircle2 size={20} className={selectedPlan === plan.id ? 'text-brand-yellow' : 'text-brand-blue'} />
              </div>
              <p className="mt-3 text-sm font-extrabold uppercase tracking-[0.12em] text-brand-blue">{plan.range}</p>
              <div className="mt-6">
                <span className="font-display text-4xl font-semibold text-ink">{plan.price}</span>
                <span className="ml-1 text-sm font-bold text-slate-500">{plan.note}</span>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-600">Disponibilidade conferida antes do cadastro e do pagamento. Cancelamentos ou remarcações com no mínimo 48h de antecedência.</p>
              <button type="button" onClick={() => choosePlan(plan.id)} className={selectedPlan === plan.id ? 'mt-6 w-full rounded-xl bg-brand-blue px-4 py-3 text-sm font-extrabold text-white shadow-brand transition hover:-translate-y-0.5' : 'mt-6 w-full rounded-xl bg-brand-yellow px-4 py-3 text-sm font-extrabold text-ink shadow-yellow transition hover:-translate-y-0.5'}>
                {selectedPlan === plan.id ? 'Plano selecionado' : 'Escolher plano'}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
