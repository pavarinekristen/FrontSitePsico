import { Link } from 'react-router-dom';
import { LegalLayout, LegalSection } from '../layouts/LegalLayout';
import { getContactWhatsAppNumber } from '../services/whatsappService';
import { openCookiePreferences } from '../utils/cookieConsent';
import { formatDateToBr } from '../utils/formatDate';
import { PRIVACY_VERSION } from '../utils/legalConsent';

export function PoliticaDePrivacidadePage() {
  return (
    <LegalLayout title="Política de Privacidade" updatedAt={formatDateToBr(PRIVACY_VERSION)}>
      <LegalSection id="quem-somos" title="Quem Somos">
        <p>
          O <strong>Instituto Ideia</strong> (R. Francisco Sales, 1341, Osvaldo Rezende, Uberlândia - MG) é um espaço de
          coworking para psicólogos. Esta política explica, em linguagem simples, como tratamos os dados pessoais de
          quem usa o site para solicitar reserva de salas, conforme a Lei Geral de Proteção de Dados (LGPD - Lei
          13.709/2018).
        </p>
      </LegalSection>

      <LegalSection id="dados-coletados" title="Dados Que Coletamos">
        <p>Coletamos apenas o que é necessário para a reserva:</p>
        <ul>
          <li><strong>Dados do formulário:</strong> nome completo, WhatsApp, CRP, público atendido, abordagem de trabalho, sala, plano, data e horários escolhidos.</li>
          <li><strong>Registro do aceite:</strong> data e hora em que você aceitou os Termos e esta Política, a versão dos documentos e o navegador usado (user agent).</li>
          <li><strong>Preferências salvas no seu navegador:</strong> escolha de cookies e dados temporários da reserva pendente (localStorage).</li>
        </ul>
        <p>Não coletamos dados de pacientes, dados de pagamento nem dados sensíveis pelo site.</p>
      </LegalSection>

      <LegalSection id="por-que-coletamos" title="Por Que Coletamos Esses Dados">
        <ul>
          <li>Verificar disponibilidade e organizar a agenda das salas.</li>
          <li>Entrar em contato para confirmar, remarcar ou cancelar reservas.</li>
          <li>Confirmar que a reserva é feita por profissional habilitado (CRP).</li>
          <li>Comprovar o aceite dos Termos de Uso e desta Política.</li>
          <li>Manter o site seguro e funcionando corretamente.</li>
        </ul>
      </LegalSection>

      <LegalSection id="base-legal" title="Base Legal Para o Tratamento">
        <ul>
          <li><strong>Execução de contrato e procedimentos preliminares</strong> (art. 7º, V da LGPD): dados da reserva e do cadastro.</li>
          <li><strong>Cumprimento de obrigação legal</strong> (art. 7º, II): guarda de registros quando exigida.</li>
          <li><strong>Legítimo interesse</strong> (art. 7º, IX): segurança do site e prevenção a fraudes.</li>
          <li><strong>Consentimento</strong> (art. 7º, I): cookies não essenciais, quando existirem.</li>
        </ul>
      </LegalSection>

      <LegalSection id="envio-whatsapp" title="Envio de Dados Para o WhatsApp">
        <p>
          Ao concluir o formulário, os dados da sua solicitação são incluídos em uma mensagem aberta no{' '}
          <strong>seu próprio WhatsApp</strong>, direcionada ao número da clínica ({getContactWhatsAppNumber()}). Você
          vê a mensagem completa antes de enviar e só a envia se quiser. A partir daí, a conversa também é tratada pelo
          WhatsApp (Meta), conforme a política de privacidade da plataforma.
        </p>
      </LegalSection>

      <LegalSection id="compartilhamento" title="Compartilhamento com Terceiros">
        <p>
          Não vendemos nem alugamos seus dados. Compartilhamos apenas o necessário com: o serviço de hospedagem do site
          e da agenda; o WhatsApp, quando você envia a mensagem; e autoridades, se houver obrigação legal.
        </p>
      </LegalSection>

      <LegalSection id="servicos-externos" title="Google Maps, Fontes e Serviços Externos">
        <p>
          O site exibe um mapa do <strong>Google Maps</strong> e usa <strong>fontes do Google Fonts</strong>. Ao
          carregar esses recursos, o Google pode receber dados técnicos como seu endereço IP, conforme a política de
          privacidade do Google. Esses serviços são necessários para o funcionamento e a exibição do site.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies e Tecnologias Semelhantes">
        <p>
          Usamos cookies necessários para funcionamento do site e serviços externos como mapa e fontes. Caso adicionemos
          cookies analíticos ou de marketing, pediremos seu consentimento. Os detalhes estão na{' '}
          <Link to="/politica-de-cookies">Política de Cookies</Link>, e você pode ajustar sua escolha a qualquer momento
          em{' '}
          <button type="button" onClick={openCookiePreferences} className="font-bold text-brand-blue underline">
            Preferências de cookies
          </button>
          .
        </p>
      </LegalSection>

      <LegalSection id="seguranca" title="Segurança dos Dados">
        <p>
          Adotamos medidas para proteger seus dados, como conexão criptografada (HTTPS), acesso restrito ao painel
          administrativo e coleta mínima de informações. Nenhum sistema é 100% seguro, mas trabalhamos para reduzir
          riscos e corrigir problemas rapidamente.
        </p>
      </LegalSection>

      <LegalSection id="prazo-de-guarda" title="Prazo de Guarda">
        <p>
          Os dados da reserva e o registro de aceite são mantidos enquanto forem necessários para administrar a reserva
          e cumprir prazos legais (por exemplo, para defesa em eventuais questionamentos). Depois disso, são excluídos
          ou anonimizados. As preferências salvas no seu navegador ficam com você e podem ser apagadas limpando os dados
          do site.
        </p>
      </LegalSection>

      <LegalSection id="direitos" title="Direitos do Titular">
        <p>A LGPD garante a você, entre outros, os direitos de:</p>
        <ul>
          <li>confirmar se tratamos seus dados e acessá-los;</li>
          <li>corrigir dados incompletos ou desatualizados;</li>
          <li>solicitar exclusão dos dados tratados com consentimento;</li>
          <li>revogar o consentimento a qualquer momento;</li>
          <li>saber com quem compartilhamos seus dados.</li>
        </ul>
      </LegalSection>

      <LegalSection id="como-solicitar" title="Como Solicitar Acesso, Correção ou Exclusão">
        <p>
          Envie sua solicitação pelo <Link to="/politica-de-privacidade#canal-lgpd">Canal LGPD</Link> informando seu
          nome e o pedido. Podemos pedir uma confirmação de identidade para proteger seus dados. Respondemos no menor
          prazo possível, dentro dos prazos da LGPD.
        </p>
      </LegalSection>

      <LegalSection id="canal-lgpd" title="Canal LGPD">
        <p>
          Para assuntos de privacidade e dados pessoais, fale com o Instituto Ideia pelo WhatsApp{' '}
          <strong>{getContactWhatsAppNumber()}</strong> (identifique a mensagem com o assunto “LGPD”) ou pelo Instagram{' '}
          <strong>@institutoideia</strong>.
        </p>
      </LegalSection>

      <LegalSection id="alteracoes" title="Alterações Nesta Política">
        <p>
          Esta política pode ser atualizada para refletir mudanças no site ou na legislação. A data da última
          atualização aparece no topo da página. Se a mudança afetar o uso de cookies, pediremos seu consentimento
          novamente.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
