import { BadgeCheck, CalendarCheck, CheckCircle2, CreditCard, DoorOpen, SearchCheck, UserRoundPlus } from 'lucide-react';
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
    icon: CheckCircle2,
    title: 'Consulta confirmada',
    description: 'Após o pagamento, sua consulta é confirmada automaticamente — sem precisar acessar nenhum painel.',
  },
  {
    icon: CalendarCheck,
    title: 'Verifique no calendário',
    description: 'A reserva fica registrada e pode ser conferida diretamente no calendário de horários.',
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
            <article key={step.title} className={index === steps.length - 1 ? 'flex items-start gap-4 rounded-[22px] border border-brand-yellow/80 bg-brand-navy p-5 text-white shadow-hero md:block md:p-6 lg:col-span-2' : 'flex items-start gap-4 rounded-[22px] border border-brand-blue/15 bg-white p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-hero md:block md:p-6'}>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-yellow text-ink md:h-12 md:w-12">
                <Icon size={22} />
              </div>
              <div>
                <div className={index === steps.length - 1 ? 'text-xs font-extrabold uppercase tracking-[0.14em] text-brand-yellow md:mt-5' : 'text-xs font-extrabold uppercase tracking-[0.14em] text-brand-blue md:mt-5'}>Passo {index + 1}</div>
                <h3 className="mt-1 font-display text-xl font-semibold md:mt-2 md:text-2xl">{step.title}</h3>
                <p className={index === steps.length - 1 ? 'mt-2 text-sm leading-6 text-white/80 md:mt-3 md:leading-7' : 'mt-2 text-sm leading-6 text-slate-600 md:mt-3 md:leading-7'}>{step.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
