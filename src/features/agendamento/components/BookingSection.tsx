import { useState } from 'react';
import type { PlanoAgendamento, RoomId } from '../../../types';
import { SectionHeading } from '../../../components/SectionHeading';
import { salas } from '../data/rooms';
import { BookingForm } from './BookingForm';
import { RoomCard } from './RoomCard';

interface BookingSectionProps {
  selectedPlan: PlanoAgendamento;
  onSelectPlan: (plan: PlanoAgendamento) => void;
}

export function BookingSection({ selectedPlan, onSelectPlan }: BookingSectionProps) {
  const [selectedSalaId, setSelectedSalaId] = useState<RoomId | null>(null);

  return (
    <section id="salas" className="mx-auto max-w-6xl px-5 py-24 md:px-8">
      <SectionHeading eyebrow="Salas & disponibilidade" title={<>Verifique sua sala <span className="rounded-md bg-title-mark px-1 text-brand-navy">sem pagar antes</span></>} description="Veja as fotos, escolha plano, sala, data e horário. A disponibilidade e o cadastro são conferidos antes do pagamento." />
      <div className="mt-12 grid items-start gap-7 lg:grid-cols-2">
        {salas.map((sala, index) => <RoomCard key={sala.id} sala={sala} selected={selectedSalaId === sala.id} onSelect={setSelectedSalaId} offset={index === 1} />)}
      </div>
      <BookingForm salas={salas} selectedSalaId={selectedSalaId} selectedPlan={selectedPlan} onSelectPlan={onSelectPlan} onSelectSala={setSelectedSalaId} />
    </section>
  );
}
