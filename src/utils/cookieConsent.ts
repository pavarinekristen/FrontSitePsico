export type CookieCategory = 'necessary' | 'analytics' | 'marketing';

export interface CookieConsentPreferences {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  version: string;
  createdAt: string;
}

/** Aumente esta data quando a política de cookies mudar: o banner reaparece para todos. */
export const COOKIE_CONSENT_VERSION = '2026-07-10';

export const COOKIE_CONSENT_STORAGE_KEY = 'instituto_ideia_cookie_consent';
export const COOKIE_CONSENT_CHANGED_EVENT = 'instituto-ideia:cookie-consent-changed';
export const OPEN_COOKIE_PREFERENCES_EVENT = 'instituto-ideia:open-cookie-preferences';

export function getDefaultCookieConsent(): CookieConsentPreferences {
  return {
    necessary: true,
    analytics: false,
    marketing: false,
    version: COOKIE_CONSENT_VERSION,
    createdAt: new Date().toISOString(),
  };
}

export function getCookieConsent(): CookieConsentPreferences | null {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const data = parsed as Partial<CookieConsentPreferences>;
    if (typeof data.version !== 'string') return null;
    return {
      necessary: true,
      analytics: data.analytics === true,
      marketing: data.marketing === true,
      version: data.version,
      createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveCookieConsent(preferences: { analytics: boolean; marketing: boolean }): CookieConsentPreferences {
  const consent: CookieConsentPreferences = {
    necessary: true,
    analytics: preferences.analytics,
    marketing: preferences.marketing,
    version: COOKIE_CONSENT_VERSION,
    createdAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // localStorage indisponível (modo privado antigo etc.): segue sem persistir
  }
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: consent }));
  return consent;
}

export function clearCookieConsent(): void {
  try {
    localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
  } catch {
    // sem persistência disponível, nada a limpar
  }
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: null }));
}

export function hasCookieConsent(category: CookieCategory): boolean {
  if (category === 'necessary') return true;
  const consent = getCookieConsent();
  if (!consent || consent.version !== COOKIE_CONSENT_VERSION) return false;
  return consent[category] === true;
}

export function shouldShowCookieBanner(): boolean {
  const consent = getCookieConsent();
  return consent === null || consent.version !== COOKIE_CONSENT_VERSION;
}

/** Reabre o modal de preferências de qualquer lugar do site (ex.: link no rodapé). */
export function openCookiePreferences(): void {
  window.dispatchEvent(new CustomEvent(OPEN_COOKIE_PREFERENCES_EVENT));
}
