import type { RegistroAceite } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '/api';

export type SlotStatus = 'livre' | 'lock_temporario' | 'confirmada' | 'bloqueada_admin';

export interface AgendaSlot {
  id: string;
  inicio: string;
  fim: string;
  status: SlotStatus;
  available: boolean;
  locked_until: string | null;
  seconds_to_unlock: number;
  cliente_nome?: string | null;
  cliente_whatsapp?: string | null;
  cliente_crp?: string | null;
  publicos_atendidos?: string | null;
  abordagem_trabalho?: string | null;
}

export interface LockSlotPayload {
  slotId: string;
  slotIds?: string[];
  clienteNome: string;
  clienteWhatsapp: string;
  plano: string;
  clienteCrp: string;
  publicosAtendidos: string[];
  abordagemTrabalho: string;
  aceite?: RegistroAceite;
}

export interface LockSlotResult {
  reserva_id: string;
  slot_id: string;
  slot_ids?: string[];
  lock_token: string;
  locked_until: string;
  inicio: string;
  fim: string;
  status: SlotStatus;
  duration_slots?: number;
  sala: {
    id: string;
    numero: string;
    nome: string;
  };
}

export interface AdminReservation {
  reserva_id: string;
  cliente_nome: string | null;
  cliente_whatsapp: string | null;
  plano: string;
  cliente_crp: string | null;
  publicos_atendidos: string | null;
  abordagem_trabalho: string | null;
  status: string;
  payment_status?: 'aguardando_pix' | 'pix_recebido' | 'nao_aplicavel';
  pix_received_at?: string | null;
  confirm_code?: string | null;
  locked_until?: string | null;
  seconds_to_expire?: number | null;
  confirmed_at?: string | null;
  slot_id: string;
  slot_inicio: string;
  slot_fim: string;
  duration_slots?: number | string;
  slot_items?: AdminReservationSlot[];
  sala_numero: string;
  sala_nome: string;
}

export interface AdminReservationSlot {
  slot_id: string;
  slot_inicio: string;
  slot_fim: string;
  status: 'ativa' | 'cancelada';
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, unknown>;
  };
}

export async function getAvailability(salaId: string, date: string): Promise<AgendaSlot[]> {
  const response = await apiFetch<ApiResponse<{ slots: AgendaSlot[] }>>(`/availability?sala_id=${encodeURIComponent(salaId)}&date=${encodeURIComponent(date)}`);
  return response.data?.slots ?? [];
}

export async function lockSlot(payload: LockSlotPayload): Promise<LockSlotResult> {
  const response = await apiFetch<ApiResponse<LockSlotResult>>('/reservations/lock', {
    method: 'POST',
    body: JSON.stringify({
      slot_id: payload.slotId,
      slot_ids: payload.slotIds,
      cliente_nome: payload.clienteNome,
      cliente_whatsapp: payload.clienteWhatsapp,
      plano: payload.plano,
      cliente_crp: payload.clienteCrp,
      publicos_atendidos: payload.publicosAtendidos,
      abordagem_trabalho: payload.abordagemTrabalho,
      // O IP do titular, se registrado, deve ser coletado pelo backend a partir da
      // requisicao (REMOTE_ADDR), nunca enviado pelo front.
      ...(payload.aceite
        ? {
            aceite: {
              aceite_termos: payload.aceite.aceiteTermos,
              aceite_privacidade: payload.aceite.aceitePrivacidade,
              versao_termos: payload.aceite.versaoTermos,
              versao_privacidade: payload.aceite.versaoPrivacidade,
              data_hora_aceite: payload.aceite.dataHoraAceite,
              origem_aceite: payload.aceite.origemAceite,
              texto_aceite: payload.aceite.textoAceite,
              user_agent: payload.aceite.userAgent,
            },
          }
        : {}),
    }),
  });

  if (!response.data) {
    throw new Error('A API nao retornou os dados do bloqueio.');
  }

  return response.data;
}

export async function confirmReservation(reservaId: string, codigo: string): Promise<void> {
  await apiFetch<ApiResponse<{ confirmed: boolean }>>('/reservations/confirm', {
    method: 'POST',
    body: JSON.stringify({ reserva_id: reservaId, codigo }),
  });
}

export interface AdminSession {
  token: string;
  username: string;
  expires_at: string;
}

export async function adminLogin(username: string, password: string): Promise<AdminSession> {
  const response = await apiFetch<ApiResponse<AdminSession>>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  if (!response.data) {
    throw new Error('A API não retornou os dados da sessão.');
  }

  return response.data;
}

export async function getAdminReservations(adminToken: string): Promise<{ pending: AdminReservation[]; recent: AdminReservation[] }> {
  const response = await apiFetch<ApiResponse<{ pending: AdminReservation[]; recent: AdminReservation[] }>>('/admin/reservations', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  return {
    pending: response.data?.pending ?? [],
    recent: response.data?.recent ?? [],
  };
}

export async function getAdminDayReservations(adminToken: string, date: string): Promise<AdminReservation[]> {
  const response = await apiFetch<ApiResponse<{ reservations: AdminReservation[] }>>(`/admin/reservations/day?date=${encodeURIComponent(date)}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  return response.data?.reservations ?? [];
}

export async function adminConfirmReservation(adminToken: string, reservaId: string): Promise<void> {
  await apiFetch<ApiResponse<{ confirmed: boolean }>>('/admin/reservations/confirm-by-id', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ reserva_id: reservaId }),
  });
}

export async function adminMarkPixReceived(adminToken: string, reservaId: string): Promise<void> {
  await apiFetch<ApiResponse<{ payment_status: 'pix_recebido' }>>('/admin/reservations/pix-received', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ reserva_id: reservaId }),
  });
}

export async function adminCancelReservation(adminToken: string, reservaId: string): Promise<void> {
  await apiFetch<ApiResponse<{ cancelled: boolean }>>('/admin/reservations/cancel', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ reserva_id: reservaId }),
  });
}

export async function adminCancelReservationSlot(adminToken: string, reservaId: string, slotId: string): Promise<void> {
  await apiFetch<ApiResponse<{ cancelled: boolean }>>('/admin/reservations/cancel-slot', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ reserva_id: reservaId, slot_id: slotId }),
  });
}

export interface AdminReservationUpdate {
  cliente_nome?: string;
  cliente_whatsapp?: string;
  plano?: string;
  cliente_crp?: string;
  publicos_atendidos?: string[];
  abordagem_trabalho?: string;
}

export async function getAdminHistory(adminToken: string, q?: string): Promise<AdminReservation[]> {
  const query = q && q.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
  const response = await apiFetch<ApiResponse<{ reservations: AdminReservation[] }>>(`/admin/reservations/history${query}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  return response.data?.reservations ?? [];
}

export async function adminDeleteReservations(adminToken: string, reservaIds: string[]): Promise<number> {
  const response = await apiFetch<ApiResponse<{ deleted: number }>>('/admin/reservations/delete', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ reserva_ids: reservaIds }),
  });

  return response.data?.deleted ?? 0;
}

export async function adminDeleteAllHistory(adminToken: string): Promise<number> {
  const response = await apiFetch<ApiResponse<{ deleted: number }>>('/admin/reservations/delete-all', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  return response.data?.deleted ?? 0;
}

export async function adminUpdateReservation(adminToken: string, reservaId: string, changes: AdminReservationUpdate): Promise<void> {
  await apiFetch<ApiResponse<{ updated: boolean }>>('/admin/reservations/update', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      reserva_id: reservaId,
      ...changes,
      ...(changes.publicos_atendidos ? { publicos_atendidos: changes.publicos_atendidos } : {}),
    }),
  });
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  const payload = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error?.message || 'Erro ao comunicar com a API.');
  }

  return payload as T;
}
