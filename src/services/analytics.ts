import { hasCookieConsent } from '../utils/cookieConsent';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

let googleAnalyticsLoaded = false;

export function loadGoogleAnalytics(measurementId: string): void {
  if (googleAnalyticsLoaded) return;
  googleAnalyticsLoaded = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  const dataLayer = (window.dataLayer = window.dataLayer ?? []);
  // O GA exige que o objeto `arguments` (não um array) seja empurrado no dataLayer
  const gtag = function () {
    dataLayer.push(arguments);
  } as (...args: unknown[]) => void;

  gtag('js', new Date());
  gtag('config', measurementId, { anonymize_ip: true });
}

/**
 * Carrega apenas os scripts autorizados pelo usuário. Idempotente: pode ser
 * chamada no boot do app e novamente sempre que o consentimento mudar.
 */
export function initTrackingScripts(): void {
  const gaId = import.meta.env.VITE_GA_ID as string | undefined;
  if (gaId && hasCookieConsent('analytics')) {
    loadGoogleAnalytics(gaId);
  }

  // Marketing (Meta Pixel, remarketing etc.): quando existir, carregar aqui
  // somente se hasCookieConsent('marketing') === true.
}
