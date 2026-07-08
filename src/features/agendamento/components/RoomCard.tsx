import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import type { RoomId, Sala } from '../../../types';
import { cn } from '../../../utils/cn';

interface RoomCardProps {
  sala: Sala;
  selected: boolean;
  onSelect: (id: RoomId) => void;
  offset?: boolean;
}

export function RoomCard({ sala, selected, onSelect, offset = false }: RoomCardProps) {
  const [index, setIndex] = useState(0);
  const maxIndex = sala.imagens.length - 1;

  return (
    <article className={cn('group relative overflow-hidden rounded-[28px] bg-ink shadow-hero transition duration-300 hover:-translate-y-1 hover:scale-[1.015]', offset && 'lg:mt-10')}>
      <div className="relative aspect-[4/4.6] overflow-hidden">
        <div className="flex h-full transition-transform duration-700 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
          {sala.imagens.map((image) => <img key={image.src} src={image.src} alt={image.alt} className="h-full w-full shrink-0 object-cover transition duration-700 group-hover:scale-105" loading="lazy" />)}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-room-card" />
        <div className="pointer-events-none absolute right-4 top-0 font-display text-7xl font-bold leading-none text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.55)] md:text-8xl">{sala.numero.replace('Sala ', '')}</div>
        <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/35 bg-white/15 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white backdrop-blur">{sala.numero} · {sala.categoria}</div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 text-white">
          <h3 className="font-display text-3xl font-semibold">{sala.titulo}</h3>
          <p className="max-w-md text-sm leading-6 text-white/85">{sala.descricao}</p>
          <div className="flex flex-wrap gap-2">{sala.recursos.map((recurso) => <span key={recurso} className="rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur">{recurso}</span>)}</div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="pointer-events-auto flex items-center gap-2">
              <button className="grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-white/15 backdrop-blur transition hover:bg-white/30" onClick={() => setIndex((value) => Math.max(0, value - 1))} aria-label="Foto anterior"><ArrowLeft size={17} /></button>
              <button className="grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-white/15 backdrop-blur transition hover:bg-white/30" onClick={() => setIndex((value) => Math.min(maxIndex, value + 1))} aria-label="Próxima foto"><ArrowRight size={17} /></button>
              <span className="ml-1 text-xs font-bold tracking-wider text-white/75">{index + 1} / {sala.imagens.length}</span>
            </div>
            <button className={cn('pointer-events-auto rounded-full border px-5 py-3 text-sm font-extrabold backdrop-blur transition hover:-translate-y-0.5', selected ? 'border-brand-yellow bg-brand-yellow text-ink' : 'border-white/35 bg-white/15 text-white')} onClick={() => onSelect(sala.id)}>{selected ? 'Selecionada' : 'Selecionar esta sala'}</button>
          </div>
        </div>
      </div>
    </article>
  );
}
