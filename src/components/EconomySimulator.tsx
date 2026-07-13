import { useState } from 'react';
import { ArrowRight, PiggyBank, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PlanoAgendamento } from '../types';
import { SectionHeading } from './SectionHeading';
import { cn } from '../utils/cn';

const SEMANAS_POR_MES = 4;
const HORAS_RAPIDAS = [2, 4, 6, 8, 12];

const custosConsultorio = [
  { label: 'aluguel da sala', value: 1200 },
  { label: 'condomínio e IPTU', value: 350 },
  { label: 'energia e água', value: 180 },
  { label: 'internet', value: 100 },
  { label: 'limpeza', value: 250 },
];
const CUSTO_CONSULTORIO = custosConsultorio.reduce((total, item) => total + item.value, 0);

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

interface PlanoSimulado {
  id: PlanoAgendamento;
  name: string;
  faixa: string;
  rate: number;
}

function getPlanoRecomendado(horasSemana: number): PlanoSimulado {
  if (horasSemana <= 1) return { id: 'Light - Hora avulsa', name: 'Light', faixa: 'Hora avulsa', rate: 35 };
  if (horasSemana <= 4) return { id: 'Standard - 2 a 4 horas', name: 'Standard', faixa: 'De 2 a 4 horas', rate: 30 };
  if (horasSemana <= 8) return { id: 'Full - 5 a 8 horas', name: 'Full', faixa: 'De 5 a 8 horas', rate: 25 };
  return { id: 'Premium - acima de 9 horas', name: 'Premium', faixa: 'Acima de 9 horas', rate: 20 };
}

interface EconomySimulatorProps {
  onSelectPlan: (plan: PlanoAgendamento) => void;
}

export function EconomySimulator({ onSelectPlan }: EconomySimulatorProps) {
  const [horasSemana, setHorasSemana] = useState(6);
  const plano = getPlanoRecomendado(horasSemana);
  const horasMes = horasSemana * SEMANAS_POR_MES;
  const custoIdeia = horasMes * plano.rate;
  const economia = CUSTO_CONSULTORIO - custoIdeia;
  const economiaAno = economia * 12;
  const maxScale = Math.max(custoIdeia, CUSTO_CONSULTORIO);

  function continuarComPlano() {
    onSelectPlan(plano.id);
    window.setTimeout(() => document.getElementById('cadastro')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }

  return (
    <section id="simulador" className="mx-auto max-w-6xl px-4 pb-16 sm:px-5 md:px-8 md:pb-24">
      <SectionHeading
        eyebrow="Simule sua economia"
        title={<>Atender no IDEIA <span className="rounded-md bg-title-mark px-1 text-brand-navy dark:text-white">custa menos</span></>}
        description="Arraste o controle e compare: quanto custa atender aqui, pagando só pelas horas que usar, contra manter um consultório próprio com custo fixo todo mês."
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="mt-12 grid overflow-hidden rounded-3xl border border-brand-blue/15 bg-white shadow-hero dark:border-white/10 dark:bg-night-card lg:grid-cols-[1.05fr_0.95fr]"
      >
        <div className="p-5 sm:p-6 md:p-8">
          <label htmlFor="horas-semana" className="text-xs font-extrabold uppercase tracking-[0.1em] text-brand-blue dark:text-brand-sky">
            Quantas horas você atende por semana?
          </label>
          <div className="mt-3 flex items-end gap-3">
            <span className="font-display text-6xl font-semibold leading-none text-ink dark:text-white">{horasSemana}h</span>
            <span className="pb-1 text-sm font-bold text-slate-500 dark:text-slate-400">por semana · até {horasMes} sessões no mês</span>
          </div>
          <input
            id="horas-semana"
            type="range"
            min={1}
            max={20}
            step={1}
            value={horasSemana}
            onChange={(event) => setHorasSemana(Number(event.target.value))}
            className="mt-6 h-2 w-full cursor-pointer accent-brand-blue dark:accent-brand-yellow"
          />
          <div className="mt-1 flex justify-between text-xs font-bold text-slate-400 dark:text-slate-500">
            <span>1h</span>
            <span>20h</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {HORAS_RAPIDAS.map((horas) => (
              <button
                key={horas}
                type="button"
                onClick={() => setHorasSemana(horas)}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-bold transition',
                  horasSemana === horas
                    ? 'border-brand-blue bg-brand-blue text-white'
                    : 'border-brand-blue/20 bg-brand-soft text-brand-blue hover:border-brand-blue dark:border-white/15 dark:bg-night-soft dark:text-brand-sky dark:hover:border-brand-sky',
                )}
              >
                {horas}h
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-brand-yellow/70 bg-brand-yellow/10 p-4 sm:p-5">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-brand-blue dark:text-brand-yellow">
              <Sparkles size={15} /> Plano recomendado
            </div>
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="font-display text-3xl font-semibold text-ink dark:text-white">{plano.name}</span>
                <span className="ml-2 text-sm font-bold text-slate-500 dark:text-slate-400">{plano.faixa}</span>
              </div>
              <span className="font-display text-2xl font-semibold text-brand-blue dark:text-brand-sky">R$ {plano.rate},00<span className="text-sm font-bold text-slate-500 dark:text-slate-400">/hora</span></span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 border-t border-brand-blue/10 bg-brand-soft p-5 dark:border-white/10 dark:bg-night-soft sm:p-6 md:p-8 lg:border-l lg:border-t-0">
          <CostBar
            label={`No IDEIA · ${horasMes}h no mês`}
            value={custoIdeia}
            percent={Math.max((custoIdeia / maxScale) * 100, 5)}
            barClassName="bg-gradient-to-r from-brand-blue to-[#2456C7]"
          />
          <CostBar
            label="Consultório próprio · custo fixo"
            value={CUSTO_CONSULTORIO}
            percent={Math.max((CUSTO_CONSULTORIO / maxScale) * 100, 5)}
            barClassName="bg-slate-400 dark:bg-slate-500"
          />
          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            Estimativa média para uma sala comercial em Uberlândia: {custosConsultorio.map((item) => `${item.label} ${brl.format(item.value)}`).join(' · ')}. Os valores variam conforme região e imóvel.
          </p>
          <div className="flex items-center gap-4 rounded-2xl bg-brand-navy p-4 text-white sm:p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-yellow text-ink">
              <PiggyBank size={24} />
            </span>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-brand-yellow">Sua economia</div>
              <div className="font-display text-3xl font-semibold leading-tight">{brl.format(economia)} <span className="text-base font-bold text-white/75">por mês</span></div>
              <div className="text-sm text-white/80">≈ {brl.format(economiaAno)} em um ano, já com recepção, Wi-Fi, café e limpeza inclusos.</div>
            </div>
          </div>
          <button
            type="button"
            onClick={continuarComPlano}
            className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-yellow px-5 py-4 font-extrabold text-ink shadow-yellow transition hover:-translate-y-0.5"
          >
            Continuar com o plano {plano.name} <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    </section>
  );
}

interface CostBarProps {
  label: string;
  value: number;
  percent: number;
  barClassName: string;
}

function CostBar({ label, value, percent, barClassName }: CostBarProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-extrabold text-ink dark:text-white">{label}</span>
        <span className="font-display text-xl font-semibold text-ink dark:text-white">{brl.format(value)}</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-white shadow-inner dark:bg-white/10">
        <div className={cn('h-full rounded-full transition-all duration-500 ease-out', barClassName)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
