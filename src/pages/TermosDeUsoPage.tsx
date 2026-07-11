import { Link } from 'react-router-dom';
import { LegalLayout, LegalSection } from '../layouts/LegalLayout';
import { getContactWhatsAppNumber } from '../services/whatsappService';
import { formatDateToBr } from '../utils/formatDate';
import { TERMS_VERSION } from '../utils/legalConsent';

export function TermosDeUsoPage() {
  return (
    <LegalLayout title="Termos de Uso" updatedAt={formatDateToBr(TERMS_VERSION)}>
      <LegalSection id="quem-somos" title="Quem Somos">
        <p>
          O <strong>Instituto Ideia</strong> é um espaço de coworking para psicólogos localizado na R. Francisco Sales,
          1341, Osvaldo Rezende, Uberlândia - MG. Oferecemos salas equipadas para atendimento psicológico, reservadas
          por hora ou por pacotes, por meio deste site.
        </p>
        <p>Ao usar o site e solicitar uma reserva, você concorda com estes Termos de Uso.</p>
      </LegalSection>

      <LegalSection id="como-funciona" title="Como Funciona a Reserva">
        <p>A reserva acontece em etapas simples:</p>
        <ul>
          <li>Você escolhe a sala, o plano, a data e os horários no formulário do site.</li>
          <li>A solicitação é enviada para o WhatsApp da clínica, que confere a disponibilidade.</li>
          <li>Quando a agenda online está ativa, os horários escolhidos ficam pré-reservados por 30 minutos.</li>
          <li>Após a confirmação da equipe e o pagamento por PIX, a reserva é efetivada com um código de confirmação.</li>
        </ul>
        <p>O envio da solicitação não garante a reserva: ela só é confirmada após retorno da equipe.</p>
      </LegalSection>

      <LegalSection id="cadastro" title="Cadastro do Profissional">
        <p>
          As salas destinam-se a psicólogos com registro ativo no Conselho Regional de Psicologia. Por isso, pedimos
          nome completo, CRP, público atendido, abordagem de trabalho e WhatsApp de contato. Você é responsável pela
          veracidade das informações enviadas.
        </p>
      </LegalSection>

      <LegalSection id="confirmacao-whatsapp" title="Confirmação por WhatsApp">
        <p>
          Toda a comunicação de confirmação acontece pelo WhatsApp da clínica ({getContactWhatsAppNumber()}). Ao enviar
          o formulário, seus dados de reserva são incluídos em uma mensagem aberta no seu próprio WhatsApp, que você
          revisa antes de enviar. A conversa segue as regras de privacidade do WhatsApp, além da nossa{' '}
          <Link to="/politica-de-privacidade">Política de Privacidade</Link>.
        </p>
      </LegalSection>

      <LegalSection id="pagamento-pix" title="Pagamento por PIX Fora do Site">
        <p>
          <strong>Nenhum pagamento é feito neste site.</strong> O site não coleta dados de cartão nem processa
          transações. O pagamento é combinado diretamente com a equipe pelo WhatsApp e feito por PIX, sempre após a
          confirmação de disponibilidade. Desconfie de qualquer cobrança feita por outros canais em nome do Instituto
          Ideia.
        </p>
      </LegalSection>

      <LegalSection id="cancelamento" title="Cancelamento, Remarcação e Reembolso">
        <ul>
          <li>Cancelamentos e remarcações devem ser solicitados pelo WhatsApp com <strong>no mínimo 48 horas de antecedência</strong> do horário reservado.</li>
          <li>Com aviso dentro do prazo, você pode remarcar para outro horário disponível ou solicitar reembolso do valor pago.</li>
          <li>Solicitações com menos de 48 horas de antecedência ou não comparecimento podem não ter direito a reembolso ou remarcação, salvo casos de força maior avaliados pela equipe.</li>
          <li>Reembolsos, quando devidos, são feitos por PIX na conta de origem do pagamento.</li>
        </ul>
      </LegalSection>

      <LegalSection id="arrependimento" title="Direito de Arrependimento Quando Aplicável">
        <p>
          Nas contratações feitas a distância, o Código de Defesa do Consumidor (art. 49) garante o direito de
          arrependimento em até 7 dias a contar da contratação, quando aplicável. Nesses casos, o valor pago é devolvido
          integralmente. Se o uso da sala já tiver ocorrido dentro desse período por sua escolha, o valor proporcional
          ao uso poderá ser descontado.
        </p>
      </LegalSection>

      <LegalSection id="uso-das-salas" title="Uso Correto das Salas">
        <ul>
          <li>Respeite os horários reservados, incluindo início e término, para não afetar o próximo profissional.</li>
          <li>Mantenha a sala organizada e comunique qualquer dano ou problema à equipe.</li>
          <li>Equipamentos e mobiliário devem ser usados apenas para a finalidade de atendimento.</li>
          <li>O acesso é pessoal: a reserva vale para o profissional identificado no cadastro.</li>
        </ul>
      </LegalSection>

      <LegalSection id="responsabilidades" title="Responsabilidades do Profissional">
        <p>
          O profissional é o único responsável pelos atendimentos que realiza, pela relação com seus pacientes, pelo
          sigilo profissional e pelo cumprimento das normas do CFP/CRP. O Instituto Ideia fornece a estrutura física e
          não participa, supervisiona ou interfere nos atendimentos.
        </p>
      </LegalSection>

      <LegalSection id="condutas-proibidas" title="Condutas Proibidas">
        <ul>
          <li>Usar as salas para atividades ilegais ou diferentes da finalidade contratada.</li>
          <li>Ceder ou sublocar a reserva a terceiros sem autorização da equipe.</li>
          <li>Fornecer dados falsos no cadastro, incluindo CRP inválido ou de terceiros.</li>
          <li>Praticar qualquer conduta que prejudique outros profissionais, pacientes ou o espaço.</li>
        </ul>
        <p>O descumprimento pode levar ao cancelamento de reservas e à recusa de novas solicitações.</p>
      </LegalSection>

      <LegalSection id="alteracoes" title="Alterações nos Termos">
        <p>
          Estes Termos podem ser atualizados para refletir mudanças no serviço ou na legislação. A data da última
          atualização aparece no topo desta página. Mudanças relevantes serão destacadas no site, e o uso do serviço
          após a atualização indica concordância com a nova versão.
        </p>
      </LegalSection>

      <LegalSection id="atendimento" title="Canal de Atendimento">
        <p>
          Dúvidas sobre estes Termos, reservas, cancelamentos ou reembolsos podem ser enviadas pelo WhatsApp{' '}
          <strong>{getContactWhatsAppNumber()}</strong> ou pelo Instagram <strong>@institutoideia</strong>. Para assuntos
          de privacidade e dados pessoais, use o <Link to="/politica-de-privacidade#canal-lgpd">Canal LGPD</Link>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
