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
  return (
    <header className="sticky top-3 z-50 mx-auto mt-3 flex max-w-6xl items-center justify-between gap-4 rounded-[18px] border border-brand-blue/15 bg-white/75 px-4 py-3 shadow-nav backdrop-blur md:px-5">
      <a href="#inicio" aria-label="Instituto Ideia" className="shrink-0"><img src={logo} alt="Instituto Ideia" className="h-10 w-auto rounded-lg bg-white px-2 py-1 shadow-sm md:h-11" /></a>
      <nav className="hidden items-center gap-4 text-sm font-bold text-slate-600 md:flex">{navItems.map((item) => <a key={item.href} href={item.href} className="transition hover:text-brand-blue">{item.label}</a>)}</nav>
      <a href="#salas" className="rounded-full bg-brand-yellow px-4 py-2.5 text-sm font-extrabold text-ink shadow-yellow transition hover:-translate-y-0.5">Ver horários</a>
    </header>
  );
}
