import { useState } from 'react';
import { Plus } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { cn } from '../utils/cn';

const faqs = [
  { q: 'Como funciona a reserva?', a: 'Você conhece o espaço, escolhe um plano e solicita a disponibilidade da sala no dia e horário desejados. Se estiver livre, fazemos o cadastro e só depois seguimos para pagamento e confirmação.' },
  { q: 'Preciso assinar contrato ou pagar mensalidade?', a: 'Não. A locação é avulsa, por hora ou período. Você paga apenas pelo tempo que usar. Quem atende com frequência pode combinar horários fixos semanais com condições especiais.' },
  { q: 'Quais são os planos?', a: 'Light: hora avulsa por R$ 35,00. Standard: de 2 a 4 horas por R$ 30,00/hora. Full: de 5 a 8 horas por R$ 25,00/hora. Premium: acima de 9 horas por R$ 20,00/hora.' },
  { q: 'O que está incluído no valor?', a: 'Recepção, Wi-Fi, café e água, limpeza, energia e ar-condicionado. Você não paga nenhuma taxa extra.' },
  { q: 'Posso usar o endereço como meu endereço profissional?', a: 'Sim. Psicólogos que atendem regularmente no IDEIA podem divulgar o endereço em seus materiais, redes sociais e cadastros profissionais.' },
  { q: 'Quando o pagamento acontece?', a: 'O pagamento acontece somente depois da checagem de disponibilidade e do cadastro. Isso evita cobrança por uma sala ou horário que já esteja ocupado.' },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-4xl px-4 pt-16 sm:px-5 md:px-8 md:pt-24">
      <SectionHeading align="center" eyebrow="Dúvidas frequentes" title="Antes de reservar" />
      <div className="mt-9 flex flex-col gap-3">
        {faqs.map((faq, index) => {
          const open = openIndex === index;
          return (
            <article key={faq.q} className={cn('overflow-hidden rounded-[18px] border bg-white shadow-card transition duration-300 hover:scale-[1.01] hover:shadow-hero', open ? 'border-brand-yellow/80' : 'border-brand-blue/15')}>
              <button className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left" onClick={() => setOpenIndex(open ? null : index)}>
                <span className="font-extrabold text-ink">{faq.q}</span>
                <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full transition', open ? 'rotate-45 bg-brand-yellow text-ink' : 'bg-brand-soft text-brand-blue')}><Plus size={18} /></span>
              </button>
              <div className={cn('grid transition-all duration-300', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                <div className="overflow-hidden"><p className="px-5 pb-5 text-sm leading-7 text-slate-600">{faq.a}</p></div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
