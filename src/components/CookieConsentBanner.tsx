import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OPEN_COOKIE_PREFERENCES_EVENT, saveCookieConsent, shouldShowCookieBanner } from '../utils/cookieConsent';
import { Button } from './Button';
import { CookiePreferencesModal } from './CookiePreferencesModal';

const HAS_TRACKING_CONFIGURED = Boolean(import.meta.env.VITE_GA_ID);

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setShowBanner(shouldShowCookieBanner());
  }, []);

  useEffect(() => {
    const openModal = () => setShowModal(true);
    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, openModal);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, openModal);
  }, []);

  const handleAcceptAll = useCallback(() => {
    saveCookieConsent({ analytics: true, marketing: true });
    setShowBanner(false);
    setShowModal(false);
  }, []);

  const handleNecessaryOnly = useCallback(() => {
    saveCookieConsent({ analytics: false, marketing: false });
    setShowBanner(false);
  }, []);

  const handleSavePreferences = useCallback((preferences: { analytics: boolean; marketing: boolean }) => {
    saveCookieConsent(preferences);
    setShowBanner(false);
    setShowModal(false);
  }, []);

  return (
    <>
      {showBanner && !showModal && (
        <section
          role="region"
          aria-label="Aviso sobre uso de cookies"
          className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
        >
          <div className="mx-auto max-w-3xl rounded-3xl bg-white p-4 shadow-card ring-1 ring-slate-200 dark:bg-night-card dark:ring-white/10 sm:p-5">
            <p className="text-xs leading-5 text-slate-600 dark:text-slate-300 sm:text-sm sm:leading-relaxed">
              {HAS_TRACKING_CONFIGURED
                ? 'Usamos cookies necessários para o funcionamento do site e para lembrar suas preferências. Com sua autorização, também podemos usar cookies analíticos para entender o uso da página e melhorar a experiência.'
                : 'Usamos cookies necessários para funcionamento do site e serviços externos como mapa e fontes. Caso adicionemos cookies analíticos ou de marketing, pediremos seu consentimento.'}{' '}
              <Link to="/politica-de-cookies" className="font-bold text-brand-blue underline dark:text-brand-sky">Política de Cookies</Link>
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:flex-wrap">
              <Button onClick={handleAcceptAll} className="py-2.5 sm:py-3">Aceitar todos</Button>
              <Button variant="secondary" onClick={handleNecessaryOnly} className="py-2.5 sm:py-3">Usar apenas necessários</Button>
              <Button
                onClick={() => setShowModal(true)}
                aria-label="Configurar preferências de cookies"
                className="bg-transparent py-2.5 text-slate-600 shadow-none ring-1 ring-slate-300 hover:translate-y-0 hover:bg-slate-50 hover:text-ink hover:shadow-none sm:py-3"
              >
                Configurar
              </Button>
            </div>
          </div>
        </section>
      )}
      {showModal && (
        <CookiePreferencesModal
          onSave={handleSavePreferences}
          onAcceptAll={handleAcceptAll}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
