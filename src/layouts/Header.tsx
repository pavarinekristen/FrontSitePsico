import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../assets/images/logo-ideia.png';

const navItems = [
  { href: '/#inicio', label: 'Início' },
  { href: '/#sobre', label: 'Sobre o IDEIA' },
  { href: '/#fluxo', label: 'Fluxo' },
  { href: '/#planos', label: 'Planos' },
  { href: '/#salas', label: 'Salas' },
  { href: '/artigos', label: 'Artigos' },
  { href: '/#contato', label: 'Contato' },
];

const WHATSAPP_URL = 'https://wa.me/553499710952';

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23a8.2 8.2 0 0 1-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.25 8.25-8.25Zm-3.53 3.6c-.16 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.39 1.01 2.56.12.16 1.75 2.67 4.23 3.74 2.06.89 2.48.71 2.93.67.45-.04 1.44-.59 1.64-1.16.2-.57.2-1.05.14-1.16-.06-.1-.22-.16-.47-.28-.25-.12-1.44-.71-1.67-.79-.22-.08-.39-.12-.55.12-.16.25-.63.79-.77.95-.14.16-.28.18-.53.06a6.7 6.7 0 0 1-1.97-1.21 7.38 7.38 0 0 1-1.36-1.7c-.14-.24-.01-.37.11-.5.11-.11.25-.28.37-.43.12-.14.16-.24.24-.41.08-.16.04-.31-.02-.43-.06-.12-.55-1.35-.77-1.84-.2-.48-.4-.42-.55-.43h-.48Z" />
    </svg>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-3 z-50 mx-auto mt-3 w-[calc(100%-1.5rem)] max-w-6xl rounded-[18px] border border-brand-blue/15 bg-white/75 px-4 py-3 shadow-nav backdrop-blur transition-colors duration-500 dark:border-white/10 dark:bg-night-card/85 sm:w-[calc(100%-2rem)] md:px-5">
      <div className="flex items-center justify-between gap-3">
        <a href="/#inicio" aria-label="Instituto Ideia" className="shrink-0"><img src={logo} alt="Instituto Ideia" className="h-10 w-auto rounded-lg bg-white px-2 py-1 shadow-sm md:h-11" /></a>
        <nav className="hidden items-center gap-4 text-sm font-bold text-slate-600 dark:text-slate-300 md:flex">{navItems.map((item) => <a key={item.href} href={item.href} className="transition hover:text-brand-blue dark:hover:text-brand-yellow">{item.label}</a>)}</nav>
        <div className="flex items-center gap-2">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Falar no WhatsApp"
            title="Falar no WhatsApp"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#25D366] text-white shadow-whatsapp transition hover:-translate-y-0.5"
          >
            <WhatsAppIcon size={19} />
          </a>
          <a href="/#salas" className="rounded-full bg-brand-yellow px-4 py-3 text-sm font-extrabold text-ink shadow-yellow transition hover:-translate-y-0.5">Ver horários</a>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brand-blue/15 bg-brand-soft text-brand-blue transition hover:bg-brand-bg dark:border-white/10 dark:bg-night-soft dark:text-brand-sky dark:hover:bg-night-bg md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="mt-3 flex flex-col gap-1 border-t border-brand-blue/10 pt-3 dark:border-white/10 md:hidden">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-bold text-slate-600 transition hover:bg-brand-soft hover:text-brand-blue dark:text-slate-300 dark:hover:bg-night-soft dark:hover:text-brand-yellow"
            >
              {item.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
