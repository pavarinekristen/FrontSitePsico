import { useEffect, useState, type ReactNode } from 'react';
import { AtSign, MapPin, Phone, Star } from 'lucide-react';
import { BenefitsSection } from '../components/BenefitsSection';
import { EconomySimulator } from '../components/EconomySimulator';
import { FaqSection } from '../components/FaqSection';
import { FlowSection } from '../components/FlowSection';
import { HeroSection } from '../components/HeroSection';
import { IncludedServices } from '../components/IncludedServices';
import { PlansSection } from '../components/PlansSection';
import { SectionHeading } from '../components/SectionHeading';
import { Testimonials } from '../components/Testimonials';
import { ArticlesPreview } from '../features/artigos/components/ArticlesPreview';
import { BookingSection } from '../features/agendamento/components/BookingSection';
import { useClipboard } from '../hooks/useClipboard';
import { MainLayout } from '../layouts/MainLayout';
import { getContactWhatsAppNumber } from '../services/whatsappService';
import type { PlanoAgendamento } from '../types';
import { cn } from '../utils/cn';

const mapsUrl = 'https://www.google.com/maps?q=R.%20Francisco%20Sales%2C%201341%2C%20Osvaldo%20Rezende%2C%20Uberl%C3%A2ndia%20-%20MG&output=embed';

export function HomePage() {
  const { copiedKey, copy } = useClipboard();
  const [lampOn, setLampOn] = useState(() => localStorage.getItem('ideia-theme') !== 'dark');
  const [selectedPlan, setSelectedPlan] = useState<PlanoAgendamento>('Light - Hora avulsa');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', !lampOn);
    localStorage.setItem('ideia-theme', lampOn ? 'light' : 'dark');
  }, [lampOn]);

  return (
    <MainLayout>
      <div className={cn('pointer-events-none fixed inset-0 z-[60] transition duration-700', lampOn ? 'bg-[#fff3ad]/20 mix-blend-screen' : 'opacity-0')} />
      <HeroSection lampOn={lampOn} onToggleLamp={() => setLampOn((current) => !current)} />
      <section id="sobre" className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-5 md:px-8 md:py-20 lg:grid-cols-2 lg:items-center">
        <div className="grid grid-cols-2 gap-4">
          {[
            'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80',
          ].map((src, index) => <img key={src} src={src} alt={`Ambiente do Instituto Ideia ${index + 1}`} className={index === 0 ? 'col-span-2 h-56 w-full rounded-[20px] border-4 border-white object-cover shadow-card transition duration-300 hover:scale-[1.02] hover:shadow-hero dark:border-white/10' : 'h-48 w-full rounded-[20px] border-4 border-white object-cover shadow-card transition duration-300 hover:scale-[1.02] hover:shadow-hero dark:border-white/10'} loading="lazy" />)}
        </div>
        <div>
          <SectionHeading eyebrow="Sobre o IDEIA" title={<>Um espaço feito para a psicologia <span className="rounded-md bg-title-mark px-1 text-brand-navy dark:text-white">acontecer.</span></>} description="O Instituto Ideia nasceu para resolver um problema real de quem atende: encontrar um espaço profissional, acolhedor e sem burocracia." />
          <blockquote className="mt-6 border-l-4 border-brand-yellow pl-5 font-display text-2xl font-medium leading-snug text-ink dark:text-white">Nossa missão é simples: cuidar da estrutura para que você cuide das pessoas.</blockquote>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm font-bold text-brand-blue dark:text-brand-sky md:justify-start">{['Mais de 10 anos de clínica', 'Região central', 'Salas equipadas', 'Reserva por hora'].map((tag) => <span key={tag} className="rounded-full border border-brand-blue/20 bg-brand-blue/10 px-4 py-2 dark:border-brand-sky/25 dark:bg-brand-sky/10">{tag}</span>)}</div>
        </div>
      </section>
      <BenefitsSection />
      <FlowSection />
      <PlansSection selectedPlan={selectedPlan} onSelectPlan={setSelectedPlan} />
      <EconomySimulator onSelectPlan={setSelectedPlan} />
      <BookingSection selectedPlan={selectedPlan} onSelectPlan={setSelectedPlan} />
      <IncludedServices />
      <Testimonials />
      <FaqSection />
      <ArticlesPreview />
      <section id="contato" className="mx-auto max-w-6xl px-4 py-16 sm:px-5 md:px-8 md:py-24">
        <div className="relative overflow-hidden rounded-[34px] text-white shadow-hero transition duration-300 hover:scale-[1.01]">
          <iframe
            title="Mapa do Instituto Ideia"
            src={mapsUrl}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            aria-hidden="true"
            tabIndex={-1}
          />
          <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(15,38,87,0.95)_0%,rgba(26,62,139,0.86)_48%,rgba(15,38,87,0.44)_100%)]" />
          <div className="relative grid gap-8 p-5 sm:p-7 md:p-11 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] backdrop-blur"><span className="h-2 w-2 rounded-full bg-[#7CF29B] shadow-[0_0_0_4px_rgba(124,242,155,0.35)]" /> Checagem pelo WhatsApp</div>
              <h2 className="mt-5 font-display text-4xl font-semibold leading-tight text-white md:text-5xl md:leading-none">Vamos<br />conversar?</h2>
              <p className="mt-4 max-w-md leading-7 text-white/90">Tire dúvidas, conheça o espaço ou solicite a checagem de disponibilidade pelo WhatsApp. Clique para copiar o contato.</p>
              <div className="mt-6 flex flex-col gap-3">
                <ContactButton icon={<Phone size={22} className="text-[#25D366]" />} label="WhatsApp" value="+55 34 9971-0952" badge={copiedKey === 'phone' ? 'Copiado' : 'Copiar'} onClick={() => void copy('phone', getContactWhatsAppNumber())} />
                <ContactButton icon={<AtSign size={22} className="text-brand-blue" />} label="Instagram" value="@institutoideia" badge={copiedKey === 'insta' ? 'Copiado' : 'Copiar'} onClick={() => void copy('insta', '@institutoideia')} />
                <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-brand-navy/45 px-4 py-3 text-sm font-semibold backdrop-blur"><Star size={19} /> Instituto Ideia · Espaço para psicólogos · Uberlândia - MG</div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/35 bg-white/20 p-4 shadow-card backdrop-blur-md transition duration-300 hover:scale-[1.015]">
              <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-white/25 bg-white/10">
                <iframe
                  title="Mapa ampliado do Instituto Ideia"
                  src={mapsUrl}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="flex items-center gap-3 px-2 pb-1 pt-4">
                <MapPin size={19} />
                <div className="flex-1"><div className="font-display font-bold">Instituto Ideia</div><div className="text-sm text-white/85">R. Francisco Sales, 1341 · Osvaldo Rezende · Uberlândia - MG</div></div>
                <button onClick={() => void copy('addr', 'R. Francisco Sales, 1341 - Osvaldo Rezende, Uberlândia - MG, 38400-440')} className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-brand-blue">{copiedKey === 'addr' ? 'Copiado' : 'Rota'}</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

interface ContactButtonProps {
  icon: ReactNode;
  label: string;
  value: string;
  badge: string;
  onClick: () => void;
}

function ContactButton({ icon, label, value, badge, onClick }: ContactButtonProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-4 rounded-[18px] border border-white/25 bg-white/20 px-4 py-4 text-left backdrop-blur transition hover:translate-x-1 hover:bg-white/30">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-sm">{icon}</span>
      <span className="flex-1"><span className="block text-xs font-extrabold uppercase tracking-[0.1em] text-white/75">{label}</span><span className="block font-display text-lg font-bold text-white">{value}</span></span>
      <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white">{badge}</span>
    </button>
  );
}
