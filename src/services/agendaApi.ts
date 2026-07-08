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
}

export interface LockSlotPayload {
  slotId: string;
  clienteNome: string;
  clienteWhatsapp: string;
  plano: string;
}

export interface LockSlotResult {
  reserva_id: string;
  slot_id: string;
  lock_token: string;
  locked_until: string;
  inicio: string;
  fim: string;
  status: SlotStatus;
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
  status: string;
  confirm_code?: string | null;
  locked_until?: string | null;
  seconds_to_expire?: number | null;
  confirmed_at?: string | null;
  slot_id: string;
  slot_inicio: string;
  slot_fim: string;
  sala_numero: string;
  sala_nome: string;
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
      cliente_nome: payload.clienteNome,
      cliente_whatsapp: payload.clienteWhatsapp,
      plano: payload.plano,
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

export async function adminCancelReservation(adminToken: string, reservaId: string): Promise<void> {
  await apiFetch<ApiResponse<{ cancelled: boolean }>>('/admin/reservations/cancel', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ reserva_id: reservaId }),
  });
}

export interface AdminReservationUpdate {
  cliente_nome?: string;
  cliente_whatsapp?: string;
  plano?: string;
}

export async function adminUpdateReservation(adminToken: string, reservaId: string, changes: AdminReservationUpdate): Promise<void> {
  await apiFetch<ApiResponse<{ updated: boolean }>>('/admin/reservations/update', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ reserva_id: reservaId, ...changes }),
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
