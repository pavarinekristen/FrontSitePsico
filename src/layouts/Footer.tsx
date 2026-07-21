import { Link } from 'react-router-dom';
import logo from '../assets/images/logo-ideia.png';
import { openCookiePreferences } from '../utils/cookieConsent';

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <div className="flex flex-col items-center gap-4 md:flex-row md:flex-wrap md:justify-between">
        <div className="flex flex-col items-center gap-3 text-center md:flex-row md:text-left"><img src={logo} alt="Instituto Ideia" className="h-9 w-auto rounded-lg bg-white px-2 py-1 shadow-sm" /><span className="text-xs text-slate-500 dark:text-slate-400">© Instituto Ideia · R. Francisco Sales, 1341 · Uberlândia - MG</span></div>
        <div className="flex flex-wrap justify-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><a href="/#inicio" className="rounded-lg px-2 py-2.5 hover:text-brand-blue dark:hover:text-brand-yellow">Início</a><a href="/#sobre" className="rounded-lg px-2 py-2.5 hover:text-brand-blue dark:hover:text-brand-yellow">Sobre</a><a href="/#salas" className="rounded-lg px-2 py-2.5 hover:text-brand-blue dark:hover:text-brand-yellow">Salas</a><Link to="/artigos" className="rounded-lg px-2 py-2.5 hover:text-brand-blue dark:hover:text-brand-yellow">Artigos</Link><a href="/#contato" className="rounded-lg px-2 py-2.5 hover:text-brand-blue dark:hover:text-brand-yellow">Contato</a></div>
      </div>
      <nav aria-label="Links legais" className="mt-4 flex flex-wrap justify-center gap-2 border-t border-brand-blue/10 pt-4 text-xs font-bold text-slate-600 dark:border-white/10 dark:text-slate-300 md:justify-start">
        <Link to="/termos-de-uso" className="rounded-lg px-2 py-2.5 underline hover:text-brand-blue dark:hover:text-brand-yellow">Termos de Uso</Link>
        <Link to="/politica-de-privacidade" className="rounded-lg px-2 py-2.5 underline hover:text-brand-blue dark:hover:text-brand-yellow">Política de Privacidade</Link>
        <Link to="/politica-de-cookies" className="rounded-lg px-2 py-2.5 underline hover:text-brand-blue dark:hover:text-brand-yellow">Política de Cookies</Link>
        <button type="button" onClick={openCookiePreferences} className="rounded-lg px-2 py-2.5 font-bold underline hover:text-brand-blue dark:hover:text-brand-yellow">Preferências de cookies</button>
      </nav>
      <p className="mt-4 border-t border-brand-blue/10 pt-4 text-center text-xs font-bold text-slate-500 dark:border-white/10 dark:text-slate-400 md:text-left">
        Feito com ❤️ pela <a href="https://www.instagram.com/sparkware_tech/" target="_blank" rel="noreferrer" className="underline hover:text-brand-blue dark:hover:text-brand-yellow">Sparkware</a>
      </p>
    </footer>
  );
}
