import type { RegistroAceite } from '../types';

/** Aumente estas datas quando os documentos mudarem: o aceite registrado passa a apontar para a nova versão. */
export const TERMS_VERSION = '2026-07-10';
export const PRIVACY_VERSION = '2026-07-10';

/** Texto exibido junto ao checkbox no momento do aceite. Mantenha em sincronia com o JSX do formulário. */
export const CONSENT_TEXT =
  'Li e aceito os Termos de Uso e a Política de Privacidade. Entendo que meus dados serão usados para solicitar e confirmar a reserva, enviados para o WhatsApp da clínica e que cancelamentos/remarcações seguem a política informada.';

export function buildConsentRecord(): RegistroAceite {
  return {
    aceiteTermos: true,
    aceitePrivacidade: true,
    versaoTermos: TERMS_VERSION,
    versaoPrivacidade: PRIVACY_VERSION,
    dataHoraAceite: new Date().toISOString(),
    origemAceite: 'formulario-reserva',
    textoAceite: CONSENT_TEXT,
    userAgent: navigator.userAgent,
  };
}
