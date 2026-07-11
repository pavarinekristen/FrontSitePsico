import type { RoomId } from './sala';

export type PlanoAgendamento =
  | 'Light - Hora avulsa'
  | 'Standard - 2 a 4 horas'
  | 'Full - 5 a 8 horas'
  | 'Premium - acima de 9 horas';

export interface HorarioSelecionado {
  slotId?: string;
  data: string;
  horario: string;
  label: string;
}

export interface DadosAgendamento {
  salaId: RoomId | null;
  slotId: string | null;
  slotIds: string[];
  slotsSelecionados: HorarioSelecionado[];
  nomeCompleto: string;
  crp: string;
  publicosAtendidos: string[];
  abordagemTrabalho: string;
  data: string;
  horario: string | null;
  horarios: string[];
  duracaoHoras: number;
  plano: PlanoAgendamento;
  whatsapp: string;
}

export interface RegistroAceite {
  aceiteTermos: true;
  aceitePrivacidade: true;
  versaoTermos: string;
  versaoPrivacidade: string;
  dataHoraAceite: string;
  origemAceite: 'formulario-reserva';
  textoAceite: string;
  userAgent: string;
}

export interface ResumoAgendamento {
  nome: string;
  whatsapp: string;
  crp: string;
  publicosAtendidos: string[];
  abordagemTrabalho: string;
  sala: string;
  data: string;
  horario: string;
  horarios?: string[];
  duracaoHoras?: number;
  plano: PlanoAgendamento;
  slotId?: string;
  slotIds?: string[];
  slotsSelecionados?: HorarioSelecionado[];
  reservaId?: string;
  lockToken?: string;
  lockedUntil?: string;
  aceite?: RegistroAceite;
}
