import { useEffect, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/images/logo-ideia.png';
import { Footer } from './Footer';

interface LegalLayoutProps {
  title: string;
  updatedAt: string;
  children: ReactNode;
}

export function LegalLayout({ title, updatedAt, children }: LegalLayoutProps) {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-brand-bg text-ink antialiased">
      <header className="sticky top-3 z-50 mx-auto mt-3 flex w-[calc(100%-1.5rem)] max-w-3xl items-center justify-between gap-3 rounded-[18px] border border-brand-blue/15 bg-white/75 px-4 py-3 shadow-nav backdrop-blur sm:w-[calc(100%-2rem)]">
        <Link to="/" aria-label="Voltar para a página inicial do Instituto Ideia" className="shrink-0">
          <img src={logo} alt="Instituto Ideia" className="h-10 w-auto rounded-lg bg-white px-2 py-1 shadow-sm" />
        </Link>
        <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-2.5 text-sm font-extrabold text-brand-blue transition hover:bg-white">
          <ArrowLeft size={16} /> Voltar ao site
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-14">
        <h1 className="font-display text-3xl font-semibold leading-tight text-ink md:text-4xl">{title}</h1>
        <p className="mt-2 text-sm font-bold text-slate-500">Última atualização: {updatedAt}</p>
        <div className="mt-8 space-y-8">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

interface LegalSectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

export function LegalSection({ id, title, children }: LegalSectionProps) {
  return (
    <section id={id} className="scroll-mt-28 rounded-3xl bg-white p-5 shadow-card sm:p-7">
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600 [&_a]:font-bold [&_a]:text-brand-blue [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">{children}</div>
    </section>
  );
}
