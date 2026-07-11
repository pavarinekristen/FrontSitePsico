import { useEffect, useRef, useState } from 'react';
import { getCookieConsent } from '../utils/cookieConsent';
import { cn } from '../utils/cn';
import { Button } from './Button';

interface CookiePreferencesModalProps {
  onSave: (preferences: { analytics: boolean; marketing: boolean }) => void;
  onAcceptAll: () => void;
  onClose: () => void;
}

interface CategoryToggleProps {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

function CategoryToggle({ id, title, description, checked, disabled = false, onChange }: CategoryToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-brand-soft p-4 ring-1 ring-slate-200">
      <div>
        <h3 id={`${id}-titulo`} className="text-sm font-extrabold text-ink">
          {title}
          {disabled && <span className="ml-2 rounded-full bg-brand-blue/10 px-2 py-0.5 text-[11px] font-bold text-brand-blue">Sempre ativos</span>}
        </h3>
        <p id={`${id}-descricao`} className="mt-1 text-xs leading-relaxed text-slate-600">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-titulo`}
        aria-describedby={`${id}-descricao`}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'relative mt-1 h-6 w-11 shrink-0 rounded-full transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2',
          checked ? 'bg-brand-blue' : 'bg-slate-300',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300',
            checked ? 'left-[22px]' : 'left-0.5',
          )}
        />
      </button>
    </div>
  );
}

export function CookiePreferencesModal({ onSave, onAcceptAll, onClose }: CookiePreferencesModalProps) {
  const stored = getCookieConsent();
  const [analytics, setAnalytics] = useState(stored?.analytics ?? false);
  const [marketing, setMarketing] = useState(stored?.marketing ?? false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-ink/50" aria-hidden="true" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-modal-titulo"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-card sm:p-7"
      >
        <h2
          id="cookie-modal-titulo"
          ref={titleRef}
          tabIndex={-1}
          className="font-display text-xl font-bold text-ink focus:outline-none"
        >
          Preferências de cookies
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Escolha quais cookies o Instituto Ideia pode usar. Você pode mudar sua escolha a qualquer momento pelo link no rodapé.
        </p>

        <div className="mt-5 space-y-3">
          <CategoryToggle
            id="cookies-necessarios"
            title="Cookies necessários"
            description="Essenciais para funcionamento do site, segurança, formulário de reserva, painel administrativo e preferências básicas. Não podem ser desativados."
            checked
            disabled
          />
          <CategoryToggle
            id="cookies-analiticos"
            title="Cookies analíticos"
            description="Ajudam a entender visitas, páginas acessadas e desempenho do site. Só serão ativados com seu consentimento."
            checked={analytics}
            onChange={setAnalytics}
          />
          <CategoryToggle
            id="cookies-marketing"
            title="Cookies de marketing"
            description="Usados para anúncios, remarketing e campanhas. Só serão ativados com seu consentimento."
            checked={marketing}
            onChange={setMarketing}
          />
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button onClick={() => onSave({ analytics, marketing })}>Salvar preferências</Button>
          <Button variant="secondary" onClick={onAcceptAll}>Aceitar todos</Button>
          <Button
            onClick={onClose}
            className="bg-transparent text-slate-600 shadow-none ring-1 ring-slate-300 hover:translate-y-0 hover:bg-slate-50 hover:text-ink hover:shadow-none"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
