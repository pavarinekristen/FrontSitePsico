import { BadgeCheck, CalendarCheck, CreditCard, DoorOpen, IdCard, SearchCheck, UserRoundPlus } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

const steps = [
  {
    icon: DoorOpen,
    title: 'Conheça o espaço',
    description: 'Veja as salas, estrutura, localização e tudo que está incluso para atendimento.',
  },
  {
    icon: BadgeCheck,
    title: 'Escolha o plano',
    description: 'Selecione a faixa de horas que combina com sua agenda antes de pedir a reserva.',
  },
  {
    icon: SearchCheck,
    title: 'Confira a disponibilidade',
    description: 'A disponibilidade da sala e do horário é verificada antes de qualquer cobrança.',
  },
  {
    icon: UserRoundPlus,
    title: 'Faça o cadastro',
    description: 'Com o horário livre, o cadastro é feito para deixar a reserva vinculada ao profissional.',
  },
  {
    icon: CreditCard,
    title: 'Realize o pagamento',
    description: 'O pagamento só entra depois da sala livre e do cadastro concluído.',
  },
  {
    icon: IdCard,
    title: 'Acesse sua área',
    description: 'Depois da confirmação, o cliente ganha acesso à área logada do sistema.',
  },
  {
    icon: CalendarCheck,
    title: 'Reserva registrada',
    description: 'A reserva é confirmada e registrada automaticamente no sistema.',
  },
];

export function FlowSection() {
  return (
    <section id="fluxo" className="mx-auto max-w-6xl px-4 py-16 sm:px-5 md:px-8 md:py-24">
      <SectionHeading
        eyebrow="Como funciona"
        title={<>Uma jornada pensada para <span className="rounded-md bg-title-mark px-1 text-brand-navy">evitar falhas</span></>}
        description="A disponibilidade e o cadastro acontecem antes do pagamento. Assim ninguém paga por um horário que já está ocupado."
      />
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <article key={step.title} className={index === steps.length - 1 ? 'rounded-[22px] border border-brand-yellow/80 bg-brand-navy p-6 text-white shadow-hero lg:col-span-2' : 'rounded-[22px] border border-brand-blue/15 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-hero'}>
              <div className={index === steps.length - 1 ? 'grid h-12 w-12 place-items-center rounded-2xl bg-brand-yellow text-ink' : 'grid h-12 w-12 place-items-center rounded-2xl bg-brand-yellow text-ink'}>
                <Icon size={23} />
              </div>
              <div className={index === steps.length - 1 ? 'mt-5 text-xs font-extrabold uppercase tracking-[0.14em] text-brand-yellow' : 'mt-5 text-xs font-extrabold uppercase tracking-[0.14em] text-brand-blue'}>Passo {index + 1}</div>
              <h3 className="mt-2 font-display text-2xl font-semibold">{step.title}</h3>
              <p className={index === steps.length - 1 ? 'mt-3 text-sm leading-7 text-white/80' : 'mt-3 text-sm leading-7 text-slate-600'}>{step.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
