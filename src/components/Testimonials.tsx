import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { SectionHeading } from './SectionHeading';

const testimonials = [
  { quote: 'Comecei a atender no IDEIA logo depois de formada. Não precisei investir nada em estrutura. Chego, atendo e vou embora tranquila.', initials: 'MC', name: 'Mariana C.', role: 'Psicóloga clínica · TCC' },
  { quote: 'Meus pacientes sempre comentam como o espaço é acolhedor. O isolamento acústico faz toda a diferença no setting terapêutico.', initials: 'RA', name: 'Rafael A.', role: 'Psicanalista' },
  { quote: 'A flexibilidade de reservar por hora me permitiu montar minha agenda aos poucos, sem o peso de um aluguel fixo.', initials: 'JS', name: 'Juliana S.', role: 'Psicóloga infantil' },
  { quote: 'O sistema de escolha por plano deixou minha rotina muito mais previsível. Consigo organizar a semana sem contratar uma sala fixa.', initials: 'TB', name: 'Tatiane B.', role: 'Psicóloga clínica' },
  { quote: 'A localização facilita para mim e para os pacientes. É central, fácil de explicar e passa uma imagem profissional.', initials: 'LG', name: 'Lucas G.', role: 'Terapeuta familiar' },
  { quote: 'Gosto de saber que a disponibilidade é conferida antes do pagamento. Evita ruído e deixa tudo mais seguro.', initials: 'AP', name: 'Amanda P.', role: 'Psicóloga · ACT' },
  { quote: 'O ambiente tem uma energia tranquila. Para atendimento clínico, isso aparece no detalhe e os pacientes percebem.', initials: 'FC', name: 'Felipe C.', role: 'Psicólogo clínico' },
  { quote: 'Não precisei comprar móveis, decorar sala ou resolver limpeza. Foi literalmente chegar e atender.', initials: 'NC', name: 'Natalia C.', role: 'Psicóloga infantil' },
  { quote: 'A possibilidade de começar com poucas horas foi decisiva. Meu consultório cresceu sem eu assumir custo fixo alto.', initials: 'VM', name: 'Victor M.', role: 'Psicólogo · TCC' },
  { quote: 'A sala é confortável, silenciosa e bem cuidada. Isso ajuda muito a manter o setting estável.', initials: 'BI', name: 'Bruna I.', role: 'Psicanalista' },
  { quote: 'A equipe orienta o processo com clareza. Escolho plano, vejo disponibilidade e sigo sem confusão.', initials: 'HG', name: 'Helena G.', role: 'Psicóloga clínica' },
  { quote: 'Uso para horários pontuais e funciona muito bem. Não fico presa a contrato longo nem mensalidade pesada.', initials: 'DR', name: 'Diego R.', role: 'Neuropsicólogo' },
  { quote: 'O espaço dá uma impressão de consultório consolidado, mesmo para quem está começando agora.', initials: 'LS', name: 'Larissa S.', role: 'Psicóloga · Gestalt' },
  { quote: 'A previsibilidade dos planos ajuda a calcular custo por atendimento e organizar minha agenda com antecedência.', initials: 'PR', name: 'Paula R.', role: 'Psicóloga clínica' },
  { quote: 'Me sinto segura indicando o endereço aos pacientes. O local é acolhedor e profissional.', initials: 'CM', name: 'Carolina M.', role: 'Psicóloga perinatal' },
  { quote: 'Ter Wi-Fi, café, recepção e limpeza inclusos simplifica demais. Eu foco no atendimento.', initials: 'MS', name: 'Marcelo S.', role: 'Psicólogo clínico' },
  { quote: 'A sala para casal me atendeu muito bem. Espaço amplo, boa iluminação e clima reservado.', initials: 'EF', name: 'Eduarda F.', role: 'Terapeuta de casais' },
  { quote: 'O modelo por horas é justo para quem está montando agenda. Pago pelo uso real.', initials: 'RO', name: 'Renan O.', role: 'Psicólogo comportamental' },
  { quote: 'A primeira impressão dos pacientes melhorou. O ambiente comunica cuidado antes mesmo da sessão começar.', initials: 'IS', name: 'Isabela S.', role: 'Psicóloga clínica' },
  { quote: 'A checagem de disponibilidade antes do pagamento trouxe confiança. O processo ficou mais profissional.', initials: 'MA', name: 'Miguel A.', role: 'Psicólogo · DBT' },
  { quote: 'Consigo testar novos horários sem risco. Quando uma faixa funciona, aumento meu plano.', initials: 'AD', name: 'Ana D.', role: 'Psicóloga clínica' },
  { quote: 'O espaço é bem mantido e silencioso. Para atendimento online entre sessões presenciais também ajuda bastante.', initials: 'JP', name: 'João P.', role: 'Psicólogo clínico' },
  { quote: 'Fiquei surpresa com a praticidade. Não precisei negociar condomínio, internet, energia ou decoração.', initials: 'ML', name: 'Mirela L.', role: 'Psicóloga infantil' },
  { quote: 'A organização por planos deixa a escolha simples. Sei exatamente qual faixa combina com minha demanda.', initials: 'RS', name: 'Rita S.', role: 'Psicopedagoga' },
  { quote: 'A sala individual é aconchegante sem parecer informal. Tem o equilíbrio que eu procurava.', initials: 'GB', name: 'Gustavo B.', role: 'Psicólogo clínico' },
  { quote: 'Atendo em dias alternados e o modelo encaixa perfeitamente. Não faz sentido eu manter sala exclusiva.', initials: 'AL', name: 'Aline L.', role: 'Psicóloga · EMDR' },
  { quote: 'O cadastro antes do pagamento deixa o processo mais sério e evita aquela sensação de improviso.', initials: 'TR', name: 'Thiago R.', role: 'Psicólogo clínico' },
  { quote: 'Meus atendimentos ficaram mais organizados desde que passei a reservar com antecedência.', initials: 'SO', name: 'Sofia O.', role: 'Psicóloga clínica' },
  { quote: 'O ambiente tem boa acústica e os pacientes relatam privacidade. Isso é essencial.', initials: 'CA', name: 'Caio A.', role: 'Psicanalista' },
  { quote: 'Para quem atende poucos horários presenciais, o plano Light resolve muito bem.', initials: 'KL', name: 'Karina L.', role: 'Psicóloga clínica' },
  { quote: 'Quando minha agenda aumentou, migrei para mais horas sem precisar mudar de endereço.', initials: 'FH', name: 'Fernanda H.', role: 'Psicóloga · TCC' },
  { quote: 'A recepção faz diferença na experiência do paciente. O atendimento já começa mais organizado.', initials: 'BB', name: 'Bianca B.', role: 'Psicóloga clínica' },
  { quote: 'Não ter burocracia de contrato longo me deu liberdade para crescer no meu ritmo.', initials: 'GD', name: 'Gabriel D.', role: 'Psicólogo clínico' },
  { quote: 'O custo por hora é fácil de encaixar no planejamento financeiro. Isso me trouxe clareza.', initials: 'LV', name: 'Letícia V.', role: 'Psicóloga organizacional' },
  { quote: 'Uso o espaço para supervisões e atendimentos pontuais. Funciona com muita praticidade.', initials: 'OS', name: 'Otávio S.', role: 'Supervisor clínico' },
  { quote: 'A estética do espaço ajuda sem roubar a cena. É bonito, mas continua clínico e reservado.', initials: 'MN', name: 'Manuela N.', role: 'Psicóloga clínica' },
  { quote: 'A etapa de confirmar disponibilidade antes do pagamento é indispensável. Achei muito correto.', initials: 'CP', name: 'Clara P.', role: 'Psicóloga · ABA' },
  { quote: 'O Premium faz sentido para quem já tem agenda cheia. O valor por hora fica bem competitivo.', initials: 'AR', name: 'André R.', role: 'Psicoterapeuta' },
  { quote: 'É um modelo que reduz risco. Comecei pequeno e fui aumentando conforme os pacientes fixaram.', initials: 'EL', name: 'Elaine L.', role: 'Psicóloga clínica' },
  { quote: 'A comunicação pelo WhatsApp é objetiva. Mando o pedido e recebo orientação do próximo passo.', initials: 'FT', name: 'Fabiana T.', role: 'Psicóloga clínica' },
  { quote: 'A sala estava pronta, limpa e organizada no horário. Isso parece simples, mas muda tudo.', initials: 'RR', name: 'Rodrigo R.', role: 'Psicólogo clínico' },
  { quote: 'O modelo me ajudou a sair do online e testar presencial com segurança financeira.', initials: 'LD', name: 'Lívia D.', role: 'Psicóloga · Terapia breve' },
  { quote: 'A organização automática de reserva é o tipo de detalhe que economiza energia mental.', initials: 'SV', name: 'Sérgio V.', role: 'Psicólogo clínico' },
  { quote: 'Consigo atender em um espaço profissional sem assumir todos os custos de uma clínica própria.', initials: 'RP', name: 'Raquel P.', role: 'Psicóloga clínica' },
  { quote: 'A sala de grupos pequenos funciona bem para atendimentos familiares. O espaço não fica apertado.', initials: 'JU', name: 'Júlia U.', role: 'Terapeuta familiar' },
  { quote: 'A rotina ficou simples: escolho plano, peço disponibilidade, cadastro e confirmo. Sem enrolação.', initials: 'DN', name: 'Daniel N.', role: 'Psicólogo clínico' },
  { quote: 'A previsibilidade de horários me permite abrir agenda com mais confiança para os pacientes.', initials: 'YA', name: 'Yasmin A.', role: 'Psicóloga clínica' },
  { quote: 'O espaço transmite cuidado. Isso fortalece minha marca profissional sem eu precisar montar uma clínica.', initials: 'MO', name: 'Murilo O.', role: 'Psicólogo clínico' },
  { quote: 'Gostei de poder escolher plano no site e já enviar a solicitação com tudo preenchido.', initials: 'BE', name: 'Beatriz E.', role: 'Psicóloga · TCC' },
  { quote: 'Para mim, o maior benefício é a tranquilidade: chego, atendo, finalizo e sigo minha agenda.', initials: 'IC', name: 'Igor C.', role: 'Psicólogo clínico' },
];

const carouselTestimonials = [...testimonials, ...testimonials];

export function Testimonials() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const resetTimerRef = useRef<number | null>(null);

  function getStepSize() {
    const viewport = viewportRef.current;
    const firstCard = viewport?.querySelector('figure');
    if (!viewport || !firstCard) return 0;

    const track = firstCard.parentElement;
    const gap = track ? Number.parseFloat(window.getComputedStyle(track).columnGap || '0') : 0;
    return firstCard.getBoundingClientRect().width + gap;
  }

  function normalizeScroll() {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const loopWidth = viewport.scrollWidth / 2;
    if (viewport.scrollLeft >= loopWidth) {
      viewport.scrollLeft -= loopWidth;
    } else if (viewport.scrollLeft <= 0) {
      viewport.scrollLeft += loopWidth;
    }
  }

  function moveCarousel(direction: 1 | -1) {
    const viewport = viewportRef.current;
    const stepSize = getStepSize();
    if (!viewport || !stepSize) return;

    if (direction < 0 && viewport.scrollLeft <= stepSize) {
      viewport.scrollLeft += viewport.scrollWidth / 2;
    }

    viewport.scrollBy({ left: direction * stepSize, behavior: 'smooth' });

    if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(normalizeScroll, 650);
  }

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      viewport.scrollLeft = Math.min(140, getStepSize() / 2 || 140);
    });

    const intervalId = window.setInterval(() => {
      moveCarousel(1);
    }, 3600);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearInterval(intervalId);
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    };
  }, []);

  function goPrevious() {
    moveCarousel(-1);
  }

  function goNext() {
    moveCarousel(1);
  }

  return (
    <section id="depoimentos" className="mx-auto max-w-6xl px-4 pt-16 sm:px-5 md:px-8 md:pt-24">
      <div className="flex flex-col items-center gap-5 md:flex-row md:items-end md:justify-between">
        <SectionHeading eyebrow="Quem atende aqui" title={<>O que os psicólogos <span className="rounded-md bg-title-mark px-1 text-brand-navy dark:text-white">dizem</span></>} />
        <div className="flex gap-2">
          <button type="button" onClick={goPrevious} aria-label="Feedbacks anteriores" className="grid h-11 w-11 place-items-center rounded-full border border-brand-blue/15 bg-white text-brand-blue shadow-sm transition hover:-translate-y-0.5 hover:shadow-card dark:border-white/10 dark:bg-night-card dark:text-brand-sky">
            <ChevronLeft size={19} />
          </button>
          <button type="button" onClick={goNext} aria-label="Próximos feedbacks" className="grid h-11 w-11 place-items-center rounded-full border border-brand-blue/15 bg-white text-brand-blue shadow-sm transition hover:-translate-y-0.5 hover:shadow-card dark:border-white/10 dark:bg-night-card dark:text-brand-sky">
            <ChevronRight size={19} />
          </button>
        </div>
      </div>

      <div className="relative left-1/2 mt-10 w-screen -translate-x-1/2 overflow-hidden pb-5">
        <div ref={viewportRef} className="feedback-carousel-viewport overflow-x-auto scroll-smooth">
          <div className="flex w-max gap-5">
            {carouselTestimonials.map((item, index) => (
              <figure key={`${item.name}-${index}`} className="m-0 flex min-h-[260px] w-[clamp(280px,31vw,380px)] flex-none flex-col gap-3 rounded-[22px] border border-brand-blue/15 bg-white p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-hero dark:border-white/10 dark:bg-night-card sm:p-6 md:gap-4 md:p-7">
            <div className="mt-2 font-display text-5xl leading-[0.5] text-brand-yellow">“</div>
            <blockquote className="m-0 text-sm leading-7 text-slate-700 dark:text-slate-300">{item.quote}</blockquote>
            <figcaption className="mt-auto flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-blue font-display font-bold text-white">{item.initials}</span>
              <span><span className="block text-sm font-extrabold text-ink dark:text-white">{item.name}</span><span className="block text-xs text-slate-500 dark:text-slate-400">{item.role}</span></span>
            </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
