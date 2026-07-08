import type { RoomId } from './sala';

export type PlanoAgendamento =
  | 'Light - Hora avulsa'
  | 'Standard - 2 a 4 horas'
  | 'Full - 5 a 8 horas'
  | 'Premium - acima de 9 horas';

export interface DadosAgendamento {
  salaId: RoomId | null;
  slotId: string | null;
  nomeCompleto: string;
  data: string;
  horario: string | null;
  plano: PlanoAgendamento;
  whatsapp: string;
}

export interface ResumoAgendamento {
  nome: string;
  whatsapp: string;
  sala: string;
  data: string;
  horario: string;
  plano: PlanoAgendamento;
  slotId?: string;
  reservaId?: string;
  lockToken?: string;
  lockedUntil?: string;
}
