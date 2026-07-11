import type { DadosAgendamento, ResumoAgendamento, Sala } from '../types';
import { formatDateToBr } from '../utils/formatDate';

const WHATSAPP_NUMBER = '553499710952';

export function createBookingSummary(data: DadosAgendamento, sala?: Sala): ResumoAgendamento {
  return {
    nome: data.nomeCompleto.trim() || 'Não informado',
    whatsapp: data.whatsapp.trim() || 'Não informado',
    crp: data.crp.trim() || 'Não informado',
    publicosAtendidos: data.publicosAtendidos,
    abordagemTrabalho: data.abordagemTrabalho.trim() || 'Não informado',
    ...(data.slotId ? { slotId: data.slotId } : {}),
    ...(data.slotIds.length > 0 ? { slotIds: data.slotIds } : {}),
    ...(data.slotsSelecionados.length > 0 ? { slotsSelecionados: data.slotsSelecionados } : {}),
    sala: sala ? `${sala.numero} · ${sala.nome}` : 'a definir',
    data: formatDateToBr(data.data),
    horario: data.horario || 'a definir',
    horarios: data.horarios,
    duracaoHoras: data.duracaoHoras,
    plano: data.plano,
  };
}

export function buildBookingMessage(summary: ResumoAgendamento): string {
  return [
    'Olá! Quero verificar disponibilidade no Instituto Ideia.',
    '',
    `• Plano desejado: ${summary.plano}`,
    `• Sala: ${summary.sala}`,
    `• Data: ${summary.data}`,
    `• Horário inicial: ${summary.horario}`,
    summary.horarios && summary.horarios.length > 1 ? `• Horários: ${summary.horarios.join(', ')}` : null,
    summary.duracaoHoras ? `• Duração: ${summary.duracaoHoras} hora${summary.duracaoHoras > 1 ? 's' : ''}` : null,
    `• Nome: ${summary.nome}`,
    `• CRP: ${summary.crp}`,
    summary.publicosAtendidos.length > 0 ? `• Público atendido: ${summary.publicosAtendidos.join(', ')}` : null,
    `• Abordagem de trabalho: ${summary.abordagemTrabalho}`,
    `• WhatsApp: ${summary.whatsapp}`,
    summary.reservaId ? `• Reserva: #${shortReservaId(summary.reservaId)}` : summary.slotId ? `• Slot: ${summary.slotId}` : null,
    '',
    'Estou ciente de que cancelamentos ou remarcações devem ser solicitados com no mínimo 48h de antecedência.',
    '',
    summary.reservaId
      ? 'O horário já está pré-reservado para mim. Após o PIX, por favor me envie o código de confirmação para eu finalizar no site. Obrigado(a)!'
      : 'Entendo que a disponibilidade da sala será conferida antes do cadastro e do pagamento. Se o horário estiver livre, por favor me oriente para seguir com a confirmação. Obrigado(a)!',
  ].filter(Boolean).join('\n');
}

export function shortReservaId(reservaId: string): string {
  return reservaId.slice(0, 8).toUpperCase();
}

export function buildBookingWhatsAppUrl(summary: ResumoAgendamento): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildBookingMessage(summary))}`;
}

export function getContactWhatsAppNumber(): string {
  return '+55 34 9971-0952';
}
