import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const reveal = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } };

interface HeroSectionProps {
  lampOn: boolean;
  onToggleLamp: () => void;
}

export function HeroSection({ lampOn, onToggleLamp }: HeroSectionProps) {
  const [toggleCount, setToggleCount] = useState(0);

  function handleLampClick() {
    setToggleCount((count) => count + 1);
    window.setTimeout(onToggleLamp, 180);
  }

  return (
    <section id="inicio" className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-5 md:px-8 md:pb-24 md:pt-8">
      <div className={cn('relative overflow-hidden rounded-3xl border p-5 shadow-hero transition duration-500 sm:p-6 md:rounded-[30px] md:p-14', lampOn ? 'border-brand-blue/15 bg-hero' : 'border-white/10 bg-[#111b34]')}>
        <div className="grid items-center gap-8 lg:grid-cols-[1.12fr_0.88fr]">
          <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.08 }} className="text-center md:text-left">
            <motion.span variants={reveal} className={cn('text-xs font-extrabold uppercase tracking-[0.18em]', lampOn ? 'text-brand-blue' : 'text-brand-yellow')}>
              Aluguel de salas para psicólogos
            </motion.span>
            <motion.h1 variants={reveal} className={cn('mx-auto mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-normal md:mx-0 md:text-6xl md:leading-none', lampOn ? 'text-ink' : 'text-white')}>
              Seu espaço de atendimento, <span className="rounded-md bg-title-mark px-1 text-brand-navy dark:bg-none dark:bg-brand-yellow">pronto para usar.</span>
            </motion.h1>
            <motion.p variants={reveal} className={cn('mx-auto mt-5 max-w-xl text-lg leading-8 md:mx-0', lampOn ? 'text-slate-700' : 'text-white/75')}>
              Salas equipadas por hora ou período, no centro de Uberlândia. Escolha o plano, confira a disponibilidade e só pague depois da validação.
            </motion.p>
            <motion.div variants={reveal} className="mt-7 flex flex-wrap items-center justify-center gap-4 md:justify-start">
              <a className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-7 py-4 font-extrabold text-white shadow-brand transition hover:-translate-y-0.5" href="#salas">
                Ver disponibilidade <ArrowRight size={18} />
              </a>
              <a className={cn('font-bold underline decoration-brand-blue/30 underline-offset-4 transition hover:text-brand-blue', lampOn ? 'text-slate-600' : 'text-white/75')} href="#sobre">
                Conhecer o espaço
              </a>
            </motion.div>
            <motion.div variants={reveal} className={cn('mt-6 flex items-center justify-center gap-2 text-sm font-semibold md:justify-start', lampOn ? 'text-slate-600' : 'text-white/70')}>
              <CheckCircle2 size={18} className="text-brand-blue" /> Duas salas equipadas · R. Francisco Sales, 1341 · Uberlândia - MG
            </motion.div>
          </motion.div>

          <div className="relative mx-auto grid aspect-square w-full max-w-[210px] place-items-center overflow-visible md:max-w-[430px]">
            <div className={cn('absolute inset-0 m-auto h-4/5 w-4/5 rounded-full blur-2xl transition duration-500', lampOn ? 'bg-brand-yellow/60 animate-glow-pulse' : 'bg-slate-900/30')} />
            <div className={cn('absolute inset-0 m-auto h-[82%] w-[82%] rounded-full border-8 transition duration-500 md:border-[14px]', lampOn ? 'border-brand-yellow/55 animate-spin-slow' : 'border-white/10')} />
            <motion.div
              animate={{ y: [0, -14, 0], rotate: [-4, 4, -4] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
              className="relative grid translate-y-[23px] place-items-center overflow-visible md:translate-y-[43px]"
            >
              <motion.div
                key={toggleCount}
                animate={toggleCount === 0 ? { y: 0, rotate: 0 } : { y: [0, 20, -10, 6, 0], rotate: [0, -9, 8, -4, 0] }}
                transition={{ duration: 0.78, ease: [0.22, 0.85, 0.25, 1] }}
                className="relative grid place-items-center overflow-visible"
              >
                <button
                  type="button"
                  onClick={handleLampClick}
                  aria-pressed={!lampOn}
                  aria-label={lampOn ? 'Tocar na lâmpada para ativar o modo noturno' : 'Tocar na lâmpada para voltar ao modo claro'}
                  title={lampOn ? 'Ativar modo noturno' : 'Voltar ao modo claro'}
                  className="cursor-pointer outline-none"
                >
                  <AnimatedLightbulb lampOn={lampOn} />
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface AnimatedLightbulbProps {
  lampOn: boolean;
}

function AnimatedLightbulb({ lampOn }: AnimatedLightbulbProps) {
  const rays = [
    { x1: 124, y1: 7, x2: 124, y2: 42 },
    { x1: 73, y1: 22, x2: 89, y2: 53 },
    { x1: 35, y1: 62, x2: 65, y2: 82 },
    { x1: 20, y1: 118, x2: 56, y2: 118 },
    { x1: 228, y1: 118, x2: 192, y2: 118 },
    { x1: 213, y1: 62, x2: 183, y2: 82 },
    { x1: 175, y1: 22, x2: 159, y2: 53 },
  ];

  return (
    <svg viewBox="0 0 280 350" className="h-auto w-[150px] max-w-full drop-shadow-[0_26px_34px_rgba(20,51,111,0.4)] md:w-[280px]">
      <defs>
        <radialGradient id="bulbGlass" cx="38%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#FFFDF2" />
          <stop offset="34%" stopColor="#FFDE5C" />
          <stop offset="78%" stopColor="#FFC20E" />
          <stop offset="100%" stopColor="#EDA200" />
        </radialGradient>
        <linearGradient id="bulbBase" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E5CC0" />
          <stop offset="100%" stopColor="#122F66" />
        </linearGradient>
        <linearGradient id="bulbNeck" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFCE33" />
          <stop offset="100%" stopColor="#E7A70E" />
        </linearGradient>
      </defs>
      <g transform="translate(16 2)">
        {rays.map((ray, index) => (
          <motion.line
            key={`${ray.x1}-${ray.y1}`}
            x1={ray.x1}
            y1={ray.y1}
            x2={ray.x2}
            y2={ray.y2}
            stroke={lampOn ? '#FFC20E' : '#64748B'}
            strokeWidth="7"
            strokeLinecap="round"
            animate={lampOn ? { opacity: [0.3, 1, 0.3], pathLength: [0.45, 1, 0.45] } : { opacity: 0, pathLength: 0.2 }}
            transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.11, ease: 'easeInOut' }}
          />
        ))}
        <motion.circle
          cx="124"
          cy="130"
          r="111"
          fill={lampOn ? '#FFC20E' : '#0F172A'}
          opacity="0.22"
          animate={lampOn ? { scale: [0.92, 1.08, 0.92], opacity: [0.16, 0.34, 0.16] } : { scale: 0.85, opacity: 0.08 }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <circle cx="124" cy="130" r="94" fill={lampOn ? 'url(#bulbGlass)' : '#334155'} />
        <ellipse cx="94" cy="98" rx="28" ry="38" fill={lampOn ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.12)'} transform="rotate(-22 94 98)" />
        <g fill="none" stroke="#C98A18" strokeWidth="4">
          <path d="M108 218 L112 160" />
          <path d="M140 218 L136 160" />
        </g>
        <path d="M100 162 Q112 126 124 126 Q136 126 148 162" fill="none" stroke={lampOn ? '#FFF6C0' : '#94A3B8'} strokeWidth="5.5" strokeLinecap="round" />
        <path d="M106 160 L142 160" stroke={lampOn ? '#FFF6C0' : '#94A3B8'} strokeWidth="5.5" strokeLinecap="round" />
        <path d="M92 208 Q100 224 108 228 L140 228 Q148 224 156 208 Z" fill={lampOn ? 'url(#bulbNeck)' : '#475569'} />
        <rect x="100" y="226" width="48" height="60" rx="9" fill="url(#bulbBase)" />
        <g stroke="rgba(255,255,255,.28)" strokeWidth="4">
          <path d="M102 242 H146" />
          <path d="M102 256 H146" />
          <path d="M102 270 H146" />
        </g>
        <path d="M110 286 L138 286 L130 302 L118 302 Z" fill="#0F2657" />
      </g>
    </svg>
  );
}
