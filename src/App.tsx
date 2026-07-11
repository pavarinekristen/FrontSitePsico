import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { AdminPage } from './pages/AdminPage';
import { HomePage } from './pages/HomePage';
import { PoliticaDeCookiesPage } from './pages/PoliticaDeCookiesPage';
import { PoliticaDePrivacidadePage } from './pages/PoliticaDePrivacidadePage';
import { TermosDeUsoPage } from './pages/TermosDeUsoPage';
import { initTrackingScripts } from './services/analytics';
import { COOKIE_CONSENT_CHANGED_EVENT } from './utils/cookieConsent';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

export default function App() {
  useEffect(() => {
    initTrackingScripts();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, initTrackingScripts);
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, initTrackingScripts);
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/termos-de-uso" element={<TermosDeUsoPage />} />
        <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidadePage />} />
        <Route path="/politica-de-cookies" element={<PoliticaDeCookiesPage />} />
      </Routes>
      <CookieConsentBanner />
    </BrowserRouter>
  );
}
