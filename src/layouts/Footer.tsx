import logo from '../assets/images/logo-ideia.png';

export function Footer() {
  return (
    <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-10 md:px-8">
      <div className="flex items-center gap-3"><img src={logo} alt="Instituto Ideia" className="h-9 w-auto rounded-lg bg-white px-2 py-1 shadow-sm" /><span className="text-xs text-slate-500">© Instituto Ideia · R. Francisco Sales, 1341 · Uberlândia - MG</span></div>
      <div className="flex gap-5 text-xs font-bold text-slate-600"><a href="#inicio" className="hover:text-brand-blue">Início</a><a href="#sobre" className="hover:text-brand-blue">Sobre</a><a href="#salas" className="hover:text-brand-blue">Salas</a><a href="#contato" className="hover:text-brand-blue">Contato</a></div>
    </footer>
  );
}
