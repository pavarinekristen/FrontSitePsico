import { Check } from 'lucide-react';

const services = ['Recepção', 'Wi-Fi', 'Café e água', 'Limpeza', 'Energia e ar-condicionado', 'Sem contrato longo'];

export function IncludedServices() {
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-8">
      <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 rounded-full bg-ink px-7 py-5 shadow-brand">
        <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-yellow">Tudo incluso</span>
        {services.map((service) => (
          <span key={service} className="inline-flex items-center gap-2 text-sm font-bold text-white"><Check size={15} className="text-brand-yellow" /> {service}</span>
        ))}
      </div>
    </section>
  );
}
