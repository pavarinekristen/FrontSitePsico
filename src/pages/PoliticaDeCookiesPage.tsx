import { Link } from 'react-router-dom';
import { LegalLayout, LegalSection } from '../layouts/LegalLayout';
import { COOKIE_CONSENT_VERSION, openCookiePreferences } from '../utils/cookieConsent';
import { formatDateToBr } from '../utils/formatDate';

export function PoliticaDeCookiesPage() {
  return (
    <LegalLayout title="Política de Cookies" updatedAt={formatDateToBr(COOKIE_CONSENT_VERSION)}>
      <LegalSection id="o-que-sao" title="O Que São Cookies">
        <p>
          Cookies e tecnologias semelhantes (como o armazenamento local do navegador) são pequenos registros que o site
          guarda no seu dispositivo para funcionar corretamente e lembrar suas preferências.
        </p>
        <p>
          <strong>Hoje o Instituto Ideia não usa cookies analíticos nem de marketing.</strong> Usamos cookies
          necessários para funcionamento do site e serviços externos como mapa e fontes. Caso adicionemos cookies
          analíticos ou de marketing, pediremos seu consentimento.
        </p>
      </LegalSection>

      <LegalSection id="necessarios" title="Cookies Necessários (Sempre Ativos)">
        <p>Essenciais para o site funcionar. Não podem ser desativados. Incluem:</p>
        <ul>
          <li><strong>Preferência de cookies</strong> (instituto_ideia_cookie_consent): guarda a sua escolha neste banner.</li>
          <li><strong>Reserva pendente</strong> (ideia-reserva-pendente): mantém sua solicitação ativa enquanto aguarda o código de confirmação.</li>
          <li><strong>Sessão do painel administrativo:</strong> login e segurança da área restrita da equipe.</li>
          <li><strong>Serviços externos:</strong> o mapa (Google Maps) e as fontes (Google Fonts) podem registrar dados técnicos necessários à exibição.</li>
        </ul>
      </LegalSection>

      <LegalSection id="analiticos" title="Cookies Analíticos (Opcionais)">
        <p>
          Serviriam para entender visitas, páginas acessadas e desempenho do site (por exemplo, Google Analytics).{' '}
          <strong>Não estão em uso no momento</strong> e, se forem adicionados, só serão ativados com o seu
          consentimento.
        </p>
      </LegalSection>

      <LegalSection id="marketing" title="Cookies de Marketing (Opcionais)">
        <p>
          Serviriam para anúncios, remarketing e campanhas (por exemplo, Meta Pixel).{' '}
          <strong>Não estão em uso no momento</strong> e, se forem adicionados, só serão ativados com o seu
          consentimento.
        </p>
      </LegalSection>

      <LegalSection id="como-gerenciar" title="Como Gerenciar Suas Preferências">
        <p>
          Você pode mudar sua escolha a qualquer momento clicando em{' '}
          <button type="button" onClick={openCookiePreferences} className="font-bold text-brand-blue underline">
            Preferências de cookies
          </button>{' '}
          (também disponível no rodapé do site). Além disso, o seu navegador permite apagar ou bloquear cookies nas
          configurações — bloquear os necessários pode afetar o funcionamento do site.
        </p>
        <p>
          Rolar a página ou continuar navegando <strong>não</strong> vale como consentimento: só a sua escolha ativa no
          banner ou no painel de preferências.
        </p>
      </LegalSection>

      <LegalSection id="mais-informacoes" title="Mais Informações">
        <p>
          O tratamento de dados pessoais é detalhado na{' '}
          <Link to="/politica-de-privacidade">Política de Privacidade</Link>. Dúvidas podem ser enviadas pelo{' '}
          <Link to="/politica-de-privacidade#canal-lgpd">Canal LGPD</Link>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
