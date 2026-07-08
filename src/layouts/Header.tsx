import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../assets/images/logo-ideia.png';

const navItems = [
  { href: '#inicio', label: 'Início' },
  { href: '#sobre', label: 'Sobre o IDEIA' },
  { href: '#fluxo', label: 'Fluxo' },
  { href: '#planos', label: 'Planos' },
  { href: '#salas', label: 'Salas' },
  { href: '#contato', label: 'Contato' },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-3 z-50 mx-auto mt-3 max-w-6xl rounded-[18px] border border-brand-blue/15 bg-white/75 px-4 py-3 shadow-nav backdrop-blur md:px-5">
      <div className="flex items-center justify-between gap-3">
        <a href="#inicio" aria-label="Instituto Ideia" className="shrink-0"><img src={logo} alt="Instituto Ideia" className="h-10 w-auto rounded-lg bg-white px-2 py-1 shadow-sm md:h-11" /></a>
        <nav className="hidden items-center gap-4 text-sm font-bold text-slate-600 md:flex">{navItems.map((item) => <a key={item.href} href={item.href} className="transition hover:text-brand-blue">{item.label}</a>)}</nav>
        <div className="flex items-center gap-2">
          <a href="#salas" className="rounded-full bg-brand-yellow px-4 py-2.5 text-sm font-extrabold text-ink shadow-yellow transition hover:-translate-y-0.5">Ver horários</a>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brand-blue/15 bg-brand-soft text-brand-blue transition hover:bg-brand-bg md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="mt-3 flex flex-col gap-1 border-t border-brand-blue/10 pt-3 md:hidden">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-brand-soft hover:text-brand-blue"
            >
              {item.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
