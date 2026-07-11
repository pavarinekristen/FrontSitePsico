import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Bell, BellOff, BellRing, CalendarDays, CheckCheck, ChevronLeft, ChevronRight, Copy, KeyRound, LogOut, Pencil, RefreshCw, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { type AdminReservation, type AdminReservationSlot, type AdminReservationUpdate, type AgendaSlot, adminCancelReservation, adminCancelReservationSlot, adminConfirmReservation, adminDeleteAllHistory, adminDeleteReservations, adminLogin, adminUpdateReservation, getAdminDayReservations, getAdminHistory, getAdminReservations, getAvailability } from '../services/agendaApi';
import { shortReservaId } from '../services/whatsappService';
import { planosDisponiveis, salas } from '../features/agendamento/data/rooms';
import { useClipboard } from '../hooks/useClipboard';
import { cn } from '../utils/cn';
import { getTodayInSaoPaulo } from '../utils/formatDate';

const REFRESH_INTERVAL_MS = 15000;

interface AdminData {
  pending: AdminReservation[];
  recent: AdminReservation[];
}

// Toca dois bipes curtos usando o Web Audio (sem arquivo externo). Reaproveita o AudioContext.
function playNotificationSound(ctxRef: { current: AudioContext | null }): void {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      return;
    }

    const ctx = ctxRef.current ?? new AudioCtx();
    ctxRef.current = ctx;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const start = ctx.currentTime;
    [0, 0.22].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, start + offset);
      gain.gain.exponentialRampToValueAtTime(0.35, start + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start + offset);
      osc.stop(start + offset + 0.22);
    });
  } catch {
    /* audio pode estar bloqueado pelo navegador; ignora */
  }
}

export function AdminPage() {
  // O token de sessao vive somente em memoria: sair, recarregar ou fechar a aba exige logar de novo.
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loggingIn, setLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => getTodayInSaoPaulo());
  const [agendaSalaId, setAgendaSalaId] = useState(() => salas[0]?.id ?? 'sala1');
  const [adminAgendaSlots, setAdminAgendaSlots] = useState<AgendaSlot[]>([]);
  const [adminAgendaLoading, setAdminAgendaLoading] = useState(false);
  const [adminAgendaError, setAdminAgendaError] = useState<string | null>(null);
  const [dayReservations, setDayReservations] = useState<AdminReservation[] | null>(null);
  const [editing, setEditing] = useState<AdminReservation | null>(null);
  const [editForm, setEditForm] = useState({ nome: '', whatsapp: '', plano: '', crp: '', abordagem: '', publicosAtendidos: [] as string[] });
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<AdminReservation | null>(null);
  const [scheduleSelection, setScheduleSelection] = useState<Set<string>>(new Set());
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [history, setHistory] = useState<AdminReservation[]>([]);
  const [historySearch, setHistorySearch] = useState('');
  const [selectedHistory, setSelectedHistory] = useState<Set<string>>(new Set());
  const [historyBusy, setHistoryBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const prevPendingRef = useRef<Set<string> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundOnRef = useRef(true);
  const { copiedKey, copy } = useClipboard();

  const load = useCallback(async (currentToken: string, date: string) => {
    setLoading(true);
    setLoadError(null);

    try {
      const [overview, day, hist] = await Promise.all([
        getAdminReservations(currentToken),
        getAdminDayReservations(currentToken, date),
        getAdminHistory(currentToken),
      ]);
      setData(overview);
      setDayReservations(day);
      setHistory(hist);

      // Aviso de nova solicitacao (Aguardando PIX) desde a ultima checagem.
      const currentPendingIds = new Set(overview.pending.map((reservation) => reservation.reserva_id));
      const previous = prevPendingRef.current;
      if (previous !== null) {
        const novos = overview.pending.filter((reservation) => !previous.has(reservation.reserva_id));
        if (novos.length > 0) {
          const nomes = novos.map((reservation) => reservation.cliente_nome || 'Sem nome').join(', ');
          setToast(novos.length === 1 ? `Nova solicitação de ${nomes}` : `${novos.length} novas solicitações: ${nomes}`);
          if (soundOnRef.current) {
            playNotificationSound(audioCtxRef);
          }
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try {
              // eslint-disable-next-line no-new
              new Notification('Nova solicitação — Instituto Ideia', { body: nomes });
            } catch {
              /* ignora */
            }
          }
        }
      }
      prevPendingRef.current = currentPendingIds;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar o painel.';

      if (message.toLowerCase().includes('autorizado')) {
        setToken(null);
        setUsername(null);
        setData(null);
        setAuthError('Sessão expirada. Entre novamente.');
      } else {
        setLoadError(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      prevPendingRef.current = null; // ao deslogar, zera a base pra nao avisar tudo no proximo login
      return;
    }

    void load(token, selectedDate);
    const intervalId = window.setInterval(() => void load(token, selectedDate), REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [token, selectedDate, load]);

  useEffect(() => {
    if (!token || !agendaSalaId) {
      setAdminAgendaSlots([]);
      return;
    }

    let active = true;
    setAdminAgendaLoading(true);
    setAdminAgendaError(null);

    getAvailability(agendaSalaId, selectedDate)
      .then((slots) => {
        if (!active) {
          return;
        }
        setAdminAgendaSlots(slots);
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        setAdminAgendaSlots([]);
        setAdminAgendaError(error instanceof Error ? error.message : 'Erro ao carregar agenda.');
      })
      .finally(() => {
        if (active) {
          setAdminAgendaLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token, agendaSalaId, selectedDate]);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  useEffect(() => {
    const pendentes = data?.pending.length ?? 0;
    document.title = pendentes > 0 ? `(${pendentes}) Painel Instituto Ideia` : 'Painel Instituto Ideia';
    return () => {
      document.title = 'Instituto Ideia | Coworking Psicológico';
    };
  }, [data]);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const user = loginForm.username.trim();
    const pass = loginForm.password;

    if (!user || !pass) {
      return;
    }

    setLoggingIn(true);
    setAuthError(null);

    try {
      const session = await adminLogin(user, pass);
      setToken(session.token);
      setUsername(session.username);
      setLoginForm({ username: '', password: '' });

      // O clique de login libera o audio e permite pedir a permissao de notificacao.
      try {
        const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = audioCtxRef.current ?? new AudioCtx();
          void audioCtxRef.current.resume();
        }
      } catch {
        /* ignora */
      }
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        void Notification.requestPermission();
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Não foi possível entrar.');
    } finally {
      setLoggingIn(false);
    }
  }

  function logout() {
    setToken(null);
    setUsername(null);
    setData(null);
    setDayReservations(null);
  }

  function shiftDay(offset: number) {
    setSelectedDate((current) => {
      const date = new Date(`${current}T12:00:00`);
      date.setDate(date.getDate() + offset);

      return new Intl.DateTimeFormat('en-CA').format(date);
    });
  }

  async function runAction(reservation: AdminReservation, action: () => Promise<void>, errorFallback: string) {
    if (!token || busyId) {
      return;
    }

    setBusyId(reservation.reserva_id);
    setLoadError(null);

    try {
      await action();
      await load(token, selectedDate);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : errorFallback);
    } finally {
      setBusyId(null);
    }
  }

  function confirmManually(reservation: AdminReservation) {
    if (!token) {
      return;
    }

    const label = `${reservation.cliente_nome || 'Sem nome'} · ${reservation.sala_numero} · ${formatReservationPeriod(reservation)}`;

    if (!window.confirm(`Confirmar manualmente a reserva de ${label}?\n\nUse apenas se o cliente não conseguir digitar o código no site.`)) {
      return;
    }

    void runAction(reservation, () => adminConfirmReservation(token, reservation.reserva_id), 'Erro ao confirmar manualmente.');
  }

  function cancelReservation(reservation: AdminReservation) {
    if (!token) {
      return;
    }

    const label = `${reservation.cliente_nome || 'Sem nome'} · ${reservation.sala_numero} · ${formatReservationPeriod(reservation)}`;

    if (!window.confirm(`Cancelar o cadastro de ${label}?\n\nO horário volta a ficar LIVRE na agenda para outras pessoas.`)) {
      return;
    }

    void runAction(reservation, () => adminCancelReservation(token, reservation.reserva_id), 'Erro ao cancelar.');
  }

  function openEdit(reservation: AdminReservation) {
    setEditing(reservation);
    setEditError(null);
    setEditForm({
      nome: reservation.cliente_nome ?? '',
      whatsapp: reservation.cliente_whatsapp ?? '',
      plano: reservation.plano,
      crp: reservation.cliente_crp ?? '',
      abordagem: reservation.abordagem_trabalho ?? '',
      publicosAtendidos: splitPublicosAtendidos(reservation.publicos_atendidos),
    });
  }

  function openScheduleEdit(reservation: AdminReservation) {
    setEditingSchedule(reservation);
    setScheduleError(null);
    setScheduleSelection(new Set(activeSlotItems(reservation).map((slot) => slot.slot_id)));
  }

  function toggleScheduleSlot(slotId: string) {
    setScheduleError(null);
    setScheduleSelection((current) => {
      const next = new Set(current);
      if (next.has(slotId)) {
        next.delete(slotId);
      } else {
        next.add(slotId);
      }
      return next;
    });
  }

  async function saveScheduleEdit() {
    if (!token || !editingSchedule || savingSchedule) {
      return;
    }

    const activeSlots = activeSlotItems(editingSchedule);
    const removed = activeSlots.filter((slot) => !scheduleSelection.has(slot.slot_id));

    if (removed.length === 0) {
      setEditingSchedule(null);
      return;
    }

    if (scheduleSelection.size === 0) {
      setScheduleError('Para remover todos os horários, use o botão Recusar/Cancelar cadastro.');
      return;
    }

    const label = removed.map((slot) => formatSlotPeriod(slot.slot_inicio, slot.slot_fim)).join(', ');
    if (!window.confirm(`Remover ${removed.length} horário(s) da reserva?\n\n${label}\n\nEsses horários voltarão a ficar livres na agenda.`)) {
      return;
    }

    setSavingSchedule(true);
    setScheduleError(null);

    try {
      for (const slot of removed) {
        await adminCancelReservationSlot(token, editingSchedule.reserva_id, slot.slot_id);
      }
      setEditingSchedule(null);
      await load(token, selectedDate);
    } catch (error) {
      setScheduleError(error instanceof Error ? error.message : 'Erro ao salvar os horários.');
    } finally {
      setSavingSchedule(false);
    }
  }

  async function saveEdit() {
    if (!token || !editing || savingEdit) {
      return;
    }

    setSavingEdit(true);
    setEditError(null);

    try {
      const changes: AdminReservationUpdate = {};

      if (editForm.nome.trim()) {
        changes.cliente_nome = editForm.nome.trim();
      }

      if (editForm.whatsapp.trim()) {
        changes.cliente_whatsapp = editForm.whatsapp.trim();
      }

      if (editForm.plano) {
        changes.plano = editForm.plano;
      }

      if (editForm.crp.trim()) {
        changes.cliente_crp = editForm.crp.trim();
      }

      if (editForm.abordagem.trim()) {
        changes.abordagem_trabalho = editForm.abordagem.trim();
      }

      if (editForm.publicosAtendidos.length > 0) {
        changes.publicos_atendidos = editForm.publicosAtendidos;
      }

      await adminUpdateReservation(token, editing.reserva_id, changes);
      setEditing(null);
      await load(token, selectedDate);
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Erro ao salvar as alterações.');
    } finally {
      setSavingEdit(false);
    }
  }

  function toggleHistorySelect(id: string) {
    setSelectedHistory((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAllHistory(ids: string[]) {
    setSelectedHistory((current) => {
      const allSelected = ids.length > 0 && ids.every((id) => current.has(id));
      return allSelected ? new Set() : new Set(ids);
    });
  }

  async function removeHistory(ids: string[], label: string) {
    if (!token || ids.length === 0 || historyBusy) {
      return;
    }

    if (!window.confirm(`Excluir ${label} do histórico?\n\nIsso apaga o registro definitivamente e NÃO tem como desfazer.`)) {
      return;
    }

    setHistoryBusy(true);
    setLoadError(null);

    try {
      await adminDeleteReservations(token, ids);
      setSelectedHistory(new Set());
      await load(token, selectedDate);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Erro ao excluir do histórico.');
    } finally {
      setHistoryBusy(false);
    }
  }

  async function removeAllHistory() {
    if (!token || historyBusy) {
      return;
    }

    if (!window.confirm('Excluir TODO o histórico?\n\nIsso apaga todos os cadastros finalizados (confirmados, cancelados e expirados) e NÃO tem como desfazer.')) {
      return;
    }

    setHistoryBusy(true);
    setLoadError(null);

    try {
      await adminDeleteAllHistory(token);
      setSelectedHistory(new Set());
      await load(token, selectedDate);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Erro ao limpar o histórico.');
    } finally {
      setHistoryBusy(false);
    }
  }

  if (!token) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-bg px-5 text-ink antialiased">
        <form onSubmit={submitLogin} className="w-full max-w-sm rounded-3xl border border-brand-blue/15 bg-white p-8 shadow-hero">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-navy text-brand-yellow"><KeyRound size={26} /></div>
          <h1 className="mt-5 text-center font-display text-2xl font-semibold">Painel Instituto Ideia</h1>
          <p className="mt-2 text-center text-sm text-slate-600">Área restrita da equipe. Entre com seu usuário e senha.</p>
          <input
            type="text"
            value={loginForm.username}
            onChange={(event) => setLoginForm((current) => ({ ...current, username: event.target.value }))}
            placeholder="Usuário"
            autoComplete="username"
            autoFocus
            className="mt-6 w-full rounded-xl border border-brand-blue/20 bg-brand-soft px-4 py-3 text-ink outline-none transition focus:border-brand-blue focus:bg-white"
          />
          <input
            type="password"
            value={loginForm.password}
            onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Senha"
            autoComplete="current-password"
            className="mt-3 w-full rounded-xl border border-brand-blue/20 bg-brand-soft px-4 py-3 text-ink outline-none transition focus:border-brand-blue focus:bg-white"
          />
          {authError ? <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700">{authError}</p> : null}
          <button type="submit" disabled={loggingIn} className="mt-4 w-full rounded-xl bg-brand-blue px-4 py-3 font-extrabold text-white shadow-brand transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">{loggingIn ? 'Entrando...' : 'Entrar'}</button>
        </form>
      </div>
    );
  }

  const historyQuery = historySearch.trim().toLowerCase();
  const filteredHistory = historyQuery
    ? history.filter((reservation) => (reservation.cliente_nome ?? '').toLowerCase().includes(historyQuery))
    : history;
  const filteredHistoryIds = filteredHistory.map((reservation) => reservation.reserva_id);
  const allHistorySelected = filteredHistoryIds.length > 0 && filteredHistoryIds.every((id) => selectedHistory.has(id));

  return (
    <div className="min-h-screen bg-brand-bg px-5 py-8 text-ink antialiased md:px-8">
      {toast ? (
        <div className="fixed left-1/2 top-4 z-[70] w-[min(92vw,440px)] -translate-x-1/2 rounded-2xl border-2 border-brand-yellow bg-brand-navy px-5 py-4 text-white shadow-hero">
          <div className="flex items-start gap-3">
            <BellRing size={22} className="mt-0.5 shrink-0 animate-bounce text-brand-yellow" />
            <div className="flex-1">
              <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-brand-yellow">Nova solicitação chegou</div>
              <div className="mt-0.5 text-sm font-bold leading-snug">{toast}</div>
            </div>
            <button type="button" onClick={() => setToast(null)} aria-label="Fechar aviso" className="shrink-0 rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"><X size={16} /></button>
          </div>
        </div>
      ) : null}
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-navy text-brand-yellow"><ShieldCheck size={22} /></div>
            <div>
              <h1 className="font-display text-2xl font-semibold leading-none">Painel Instituto Ideia</h1>
              <p className="mt-1 text-xs font-bold text-slate-500">Logado como {username ?? '—'} · atualiza sozinho e avisa quando chega solicitação</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundOn((current) => !current)}
              title={soundOn ? 'Som do aviso ligado (clique para desligar)' : 'Som do aviso desligado (clique para ligar)'}
              aria-label={soundOn ? 'Desligar som do aviso' : 'Ligar som do aviso'}
              className={cn('inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition hover:-translate-y-0.5', soundOn ? 'border-brand-blue/20 bg-white text-brand-blue' : 'border-slate-200 bg-slate-100 text-slate-400')}
            >
              {soundOn ? <Bell size={15} /> : <BellOff size={15} />}
            </button>
            <button type="button" onClick={() => void load(token, selectedDate)} className="inline-flex items-center gap-2 rounded-full border border-brand-blue/20 bg-white px-4 py-2.5 text-sm font-extrabold text-brand-blue shadow-sm transition hover:-translate-y-0.5">
              <RefreshCw size={15} className={cn(loading && 'animate-spin')} /> Atualizar
            </button>
            <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-brand-blue/20 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-500 shadow-sm transition hover:-translate-y-0.5">
              <LogOut size={15} /> Sair
            </button>
          </div>
        </header>

        {loadError ? <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{loadError}</p> : null}

        <section className="mt-8">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-blue">Aguardando PIX ({data?.pending.length ?? 0})</h2>
          <div className="mt-3 flex flex-col gap-3">
            {data && data.pending.length === 0 ? (
              <p className="rounded-2xl border border-brand-blue/15 bg-white px-5 py-6 text-sm font-bold text-slate-500">Nenhum cadastro aguardando confirmação agora.</p>
            ) : null}
            {data?.pending.map((reservation) => (
              <article key={reservation.reserva_id} className="rounded-2xl border border-brand-blue/15 bg-white p-5 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-semibold">{reservation.cliente_nome || 'Sem nome'}</h3>
                      <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-extrabold text-brand-blue">#{shortReservaId(reservation.reserva_id)}</span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-slate-600">{reservation.sala_numero} · {reservation.sala_nome} — {formatReservationPeriod(reservation)}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      WhatsApp: {reservation.cliente_whatsapp || 'não informado'} · CRP: {reservation.cliente_crp || 'não informado'} · {formatPublicosAtendidos(reservation.publicos_atendidos)} · {reservation.abordagem_trabalho || 'abordagem não informada'} · {reservation.plano} · {formatDurationSlots(reservation.duration_slots)}
                    </p>
                    <ReservationSlotList reservation={reservation} />
                    <p className="mt-2 inline-flex rounded-full bg-[#FFF4D6] px-3 py-1 text-xs font-extrabold text-[#8A6100]">⏱ Expira em {formatRemaining(reservation.seconds_to_expire ?? 0)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Código de confirmação</div>
                    <div className="mt-1 rounded-xl bg-brand-navy px-4 py-2 font-display text-3xl font-bold tracking-[0.25em] text-brand-yellow">{reservation.confirm_code}</div>
                    <button
                      type="button"
                      onClick={() => void copy(reservation.reserva_id, reservation.confirm_code ?? '')}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-yellow px-4 py-2 text-xs font-extrabold text-ink shadow-yellow transition hover:-translate-y-0.5"
                    >
                      <Copy size={13} /> {copiedKey === reservation.reserva_id ? 'Copiado!' : 'Copiar código'}
                    </button>
                    <button
                      type="button"
                      disabled={busyId !== null}
                      onClick={() => confirmManually(reservation)}
                      title="Use se o cliente não conseguir digitar o código no site"
                      className="mt-2 ml-2 inline-flex items-center gap-1.5 rounded-full border border-brand-blue/20 bg-white px-4 py-2 text-xs font-extrabold text-brand-blue transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCheck size={13} /> {busyId === reservation.reserva_id ? 'Processando...' : 'Confirmar manualmente'}
                    </button>
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={busyId !== null}
                        onClick={() => openEdit(reservation)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-brand-blue/20 bg-white px-4 py-2 text-xs font-extrabold text-brand-blue transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Pencil size={13} /> Editar
                      </button>
                      <button
                        type="button"
                        disabled={busyId !== null}
                        onClick={() => openScheduleEdit(reservation)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-brand-blue/20 bg-white px-4 py-2 text-xs font-extrabold text-brand-blue transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <CalendarDays size={13} /> Editar horários
                      </button>
                      <button
                        type="button"
                        disabled={busyId !== null}
                        onClick={() => cancelReservation(reservation)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-extrabold text-red-600 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X size={13} /> Recusar
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-blue">Agenda</h2>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-bold capitalize text-slate-500"><CalendarDays size={15} /> {formatDayLabel(selectedDate)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select value={agendaSalaId} onChange={(event) => setAgendaSalaId(event.target.value as typeof agendaSalaId)} className="rounded-xl border border-brand-blue/20 bg-white px-3 py-2 text-sm font-bold text-ink outline-none transition focus:border-brand-blue">
                {salas.map((sala) => <option key={sala.id} value={sala.id}>{sala.numero} · {sala.nome}</option>)}
              </select>
              <button type="button" onClick={() => shiftDay(-1)} aria-label="Dia anterior" className="grid h-9 w-9 place-items-center rounded-full border border-brand-blue/20 bg-white text-brand-blue shadow-sm transition hover:-translate-y-0.5">
                <ChevronLeft size={16} />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => event.target.value && setSelectedDate(event.target.value)}
                className="rounded-xl border border-brand-blue/20 bg-white px-3 py-2 text-sm font-bold text-ink outline-none transition focus:border-brand-blue"
              />
              <button type="button" onClick={() => shiftDay(1)} aria-label="Próximo dia" className="grid h-9 w-9 place-items-center rounded-full border border-brand-blue/20 bg-white text-brand-blue shadow-sm transition hover:-translate-y-0.5">
                <ChevronRight size={16} />
              </button>
              {selectedDate !== getTodayInSaoPaulo() ? (
                <button type="button" onClick={() => setSelectedDate(getTodayInSaoPaulo())} className="rounded-full bg-brand-yellow px-4 py-2 text-xs font-extrabold text-ink shadow-yellow transition hover:-translate-y-0.5">
                  Hoje
                </button>
              ) : null}
            </div>
          </div>

          {adminAgendaError ? <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{adminAgendaError}</p> : null}

          <div className="mt-3 rounded-2xl border border-brand-blue/15 bg-white p-4 shadow-card">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-extrabold text-ink">{selectedAgendaRoomLabel(agendaSalaId)}</div>
              <div className="flex flex-wrap gap-2 text-[11px] font-extrabold">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DDFBE8] px-3 py-1.5 text-[#147A3B]"><span className="h-2 w-2 rounded-full bg-[#25A45B]" /> Livre</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF4D6] px-3 py-1.5 text-[#8A6100]"><span className="h-2 w-2 rounded-full bg-[#E7A70E]" /> Aguardando PIX</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-red-600"><span className="h-2 w-2 rounded-full bg-red-500" /> Ocupado</span>
              </div>
            </div>
            {adminAgendaLoading ? (
              <p className="rounded-xl bg-brand-soft px-4 py-6 text-center text-sm font-bold text-brand-blue">Carregando agenda...</p>
            ) : adminAgendaSlots.length === 0 ? (
              <p className="rounded-xl bg-brand-soft px-4 py-6 text-center text-sm font-bold text-slate-500">Nenhum horário gerado para essa sala nesta data.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {adminAgendaSlots.map((slot) => (
                  <div key={slot.id} className={cn('min-h-[70px] rounded-xl border px-3 py-2.5 text-sm font-bold', agendaSlotStyle(slot))}>
                    <div className="font-display text-lg font-semibold">{formatSlotHour(slot.inicio)} - {formatSlotHour(slot.fim)}</div>
                    <div className="mt-1 text-xs font-extrabold">{agendaSlotLabel(slot)}</div>
                    {!slot.available ? (
                      <div className="mt-1 space-y-0.5 text-[11px] font-semibold">
                        {slot.cliente_nome ? <div>{slot.cliente_nome}</div> : null}
                        <div>{slot.cliente_crp || 'CRP não informado'}</div>
                        <div>{formatPublicosAtendidos(slot.publicos_atendidos)}</div>
                        <div>{slot.abordagem_trabalho || 'Abordagem não informada'}</div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-blue">Cadastros do dia</h2>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => shiftDay(-1)} aria-label="Dia anterior" className="grid h-9 w-9 place-items-center rounded-full border border-brand-blue/20 bg-white text-brand-blue shadow-sm transition hover:-translate-y-0.5">
                <ChevronLeft size={16} />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => event.target.value && setSelectedDate(event.target.value)}
                className="rounded-xl border border-brand-blue/20 bg-white px-3 py-2 text-sm font-bold text-ink outline-none transition focus:border-brand-blue"
              />
              <button type="button" onClick={() => shiftDay(1)} aria-label="Próximo dia" className="grid h-9 w-9 place-items-center rounded-full border border-brand-blue/20 bg-white text-brand-blue shadow-sm transition hover:-translate-y-0.5">
                <ChevronRight size={16} />
              </button>
              {selectedDate !== getTodayInSaoPaulo() ? (
                <button type="button" onClick={() => setSelectedDate(getTodayInSaoPaulo())} className="rounded-full bg-brand-yellow px-4 py-2 text-xs font-extrabold text-ink shadow-yellow transition hover:-translate-y-0.5">
                  Hoje
                </button>
              ) : null}
            </div>
          </div>
          <p className="mt-2 inline-flex items-center gap-2 text-sm font-bold capitalize text-slate-500"><CalendarDays size={15} /> {formatDayLabel(selectedDate)}</p>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-brand-blue/15 bg-white shadow-card">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-brand-blue/10 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Horário</th>
                  <th className="px-5 py-3">Sala</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">WhatsApp</th>
                  <th className="px-5 py-3">Plano</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {dayReservations && dayReservations.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-8 text-center font-bold text-slate-400">Nenhum cadastro neste dia.</td></tr>
                ) : null}
                {dayReservations?.map((reservation) => {
                  const editable = reservation.status === 'lock_temporario' || reservation.status === 'confirmada';
                  const daySlot = activeSlotItems(reservation)[0];

                  return (
                    <tr key={reservation.reserva_id} className="border-b border-brand-blue/5 last:border-0">
                      <td className="px-5 py-3 font-display font-bold text-ink">{formatSlotHour(reservation.slot_inicio)} – {formatSlotHour(reservation.slot_fim)}</td>
                      <td className="px-5 py-3 text-slate-600">{reservation.sala_numero} · {reservation.sala_nome}</td>
                      <td className="px-5 py-3 font-bold">{reservation.cliente_nome || 'Sem nome'}</td>
                      <td className="px-5 py-3 text-slate-600">
                        <div>{reservation.cliente_whatsapp || '—'}</div>
                        <div className="mt-1 text-[11px] leading-5 text-slate-500">
                          CRP: {reservation.cliente_crp || '—'} · {formatPublicosAtendidos(reservation.publicos_atendidos)} · {reservation.abordagem_trabalho || 'Abordagem não informada'}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{reservation.plano} · {formatDurationSlots(reservation.duration_slots)}</td>
                      <td className="px-5 py-3"><StatusBadge status={reservation.status} /></td>
                      <td className="px-5 py-3">
                        {editable ? (
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              disabled={busyId !== null}
                              onClick={() => openEdit(reservation)}
                              title="Editar dados do cliente"
                              className="grid h-8 w-8 place-items-center rounded-full border border-brand-blue/20 bg-white text-brand-blue transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              disabled={busyId !== null || !daySlot}
                              onClick={() => openScheduleEdit(reservation)}
                              title="Editar horários da reserva"
                              className="grid h-8 w-8 place-items-center rounded-full border border-brand-blue/20 bg-white text-brand-blue transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <CalendarDays size={13} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-blue">Histórico</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={historySearch}
                  onChange={(event) => setHistorySearch(event.target.value)}
                  placeholder="Buscar por nome"
                  className="w-56 rounded-full border border-brand-blue/20 bg-white py-2 pl-9 pr-4 text-sm font-bold text-ink outline-none transition focus:border-brand-blue"
                />
              </div>
              <button
                type="button"
                disabled={selectedHistory.size === 0 || historyBusy}
                onClick={() => void removeHistory(Array.from(selectedHistory), `${selectedHistory.size} cadastro(s)`)}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-extrabold text-red-600 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 size={14} /> Excluir selecionados{selectedHistory.size > 0 ? ` (${selectedHistory.size})` : ''}
              </button>
              <button
                type="button"
                disabled={history.length === 0 || historyBusy}
                onClick={() => void removeAllHistory()}
                className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 size={14} /> Excluir todos
              </button>
            </div>
          </div>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-brand-blue/15 bg-white shadow-card">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-brand-blue/10 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3"><input type="checkbox" checked={allHistorySelected} onChange={() => toggleSelectAllHistory(filteredHistoryIds)} aria-label="Selecionar todos" className="h-4 w-4 accent-brand-blue" /></th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Sala · Horário</th>
                  <th className="px-4 py-3">Plano</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-6 text-center font-bold text-slate-500">{history.length === 0 ? 'Nenhum registro ainda.' : 'Nenhum resultado para essa busca.'}</td></tr>
                ) : null}
                {filteredHistory.map((reservation) => (
                  <tr key={reservation.reserva_id} className={cn('border-b border-brand-blue/5 last:border-0', selectedHistory.has(reservation.reserva_id) && 'bg-brand-soft/60')}>
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedHistory.has(reservation.reserva_id)} onChange={() => toggleHistorySelect(reservation.reserva_id)} aria-label={`Selecionar ${reservation.cliente_nome || 'cadastro'}`} className="h-4 w-4 accent-brand-blue" /></td>
                    <td className="px-4 py-3 font-bold">{reservation.cliente_nome || 'Sem nome'}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{reservation.sala_numero} — {formatReservationPeriod(reservation)}</div>
                      <ReservationSlotList reservation={reservation} compact />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{reservation.plano} · {formatDurationSlots(reservation.duration_slots)}</div>
                      <div className="mt-1 text-[11px] leading-5 text-slate-500">
                        CRP: {reservation.cliente_crp || '—'} · {formatPublicosAtendidos(reservation.publicos_atendidos)} · {reservation.abordagem_trabalho || 'Abordagem não informada'}
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={reservation.status} /></td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={historyBusy}
                        onClick={() => void removeHistory([reservation.reserva_id], reservation.cliente_nome || 'este cadastro')}
                        title="Excluir do histórico"
                        className="grid h-8 w-8 place-items-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {historyBusy ? <p className="mt-2 text-xs font-bold text-slate-500">Processando...</p> : null}
        </section>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-sm" onClick={() => !savingEdit && setEditing(null)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-hero" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-semibold text-ink">Editar cadastro</h3>
                <p className="mt-1 text-sm font-bold text-slate-500">{editing.sala_numero} · {editing.sala_nome} — {formatSlotDateTime(editing.slot_inicio)} · #{shortReservaId(editing.reserva_id)}</p>
              </div>
              <button type="button" onClick={() => !savingEdit && setEditing(null)} aria-label="Fechar" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-blue transition hover:bg-brand-bg">
                <X size={16} />
              </button>
            </div>
            <div className="mt-5 flex flex-col gap-4">
              <label className="block">
                <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-brand-blue">Nome</span>
                <input value={editForm.nome} onChange={(event) => setEditForm((current) => ({ ...current, nome: event.target.value }))} className="w-full rounded-xl border border-brand-blue/20 bg-brand-soft px-4 py-3 text-ink outline-none transition focus:border-brand-blue focus:bg-white" placeholder="Nome do cliente" />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-brand-blue">WhatsApp</span>
                <input value={editForm.whatsapp} onChange={(event) => setEditForm((current) => ({ ...current, whatsapp: event.target.value }))} className="w-full rounded-xl border border-brand-blue/20 bg-brand-soft px-4 py-3 text-ink outline-none transition focus:border-brand-blue focus:bg-white" placeholder="(34) 9 9999-9999" />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-brand-blue">Plano</span>
                <select value={editForm.plano} onChange={(event) => setEditForm((current) => ({ ...current, plano: event.target.value }))} className="w-full rounded-xl border border-brand-blue/20 bg-brand-soft px-4 py-3 text-ink outline-none transition focus:border-brand-blue focus:bg-white">
                  {!planosDisponiveis.includes(editForm.plano as (typeof planosDisponiveis)[number]) && editForm.plano ? <option value={editForm.plano}>{editForm.plano}</option> : null}
                  {planosDisponiveis.map((plano) => <option key={plano} value={plano}>{plano}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-brand-blue">CRP</span>
                <input value={editForm.crp} onChange={(event) => setEditForm((current) => ({ ...current, crp: event.target.value }))} className="w-full rounded-xl border border-brand-blue/20 bg-brand-soft px-4 py-3 text-ink outline-none transition focus:border-brand-blue focus:bg-white" placeholder="CRP 00/00000" />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-brand-blue">Abordagem</span>
                <input value={editForm.abordagem} onChange={(event) => setEditForm((current) => ({ ...current, abordagem: event.target.value }))} className="w-full rounded-xl border border-brand-blue/20 bg-brand-soft px-4 py-3 text-ink outline-none transition focus:border-brand-blue focus:bg-white" placeholder="TCC, psicanálise, humanista..." />
              </label>
              <div>
                <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-brand-blue">Público atendido</span>
                <div className="grid gap-2 md:grid-cols-3">
                  {['Adulto', 'Criança', 'Adolescente'].map((publico) => {
                    const active = editForm.publicosAtendidos.includes(publico);
                    return (
                      <button
                        key={publico}
                        type="button"
                        onClick={() => setEditForm((current) => ({
                          ...current,
                          publicosAtendidos: active
                            ? current.publicosAtendidos.filter((item) => item !== publico)
                            : [...current.publicosAtendidos, publico],
                        }))}
                        className={cn('rounded-xl border px-3 py-3 text-left text-sm font-bold transition', active ? 'border-brand-blue bg-brand-blue text-white' : 'border-brand-blue/20 bg-brand-soft text-brand-blue')}
                      >
                        {publico}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            {editError ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700">{editError}</p> : null}
            <div className="mt-6 flex gap-3">
              <button type="button" disabled={savingEdit} onClick={() => setEditing(null)} className="flex-1 rounded-xl border border-brand-blue/20 bg-white px-4 py-3 text-sm font-extrabold text-slate-500 transition hover:-translate-y-0.5 disabled:opacity-50">Cancelar</button>
              <button type="button" disabled={savingEdit} onClick={() => void saveEdit()} className="flex-1 rounded-xl bg-brand-blue px-4 py-3 text-sm font-extrabold text-white shadow-brand transition hover:-translate-y-0.5 disabled:opacity-50">{savingEdit ? 'Salvando...' : 'Salvar alterações'}</button>
            </div>
          </div>
        </div>
      ) : null}

      {editingSchedule ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-sm" onClick={() => !savingSchedule && setEditingSchedule(null)}>
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-hero" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-semibold text-ink">Editar horários</h3>
                <p className="mt-1 text-sm font-bold text-slate-500">{editingSchedule.cliente_nome || 'Sem nome'} · {editingSchedule.sala_numero} · {editingSchedule.plano}</p>
              </div>
              <button type="button" onClick={() => !savingSchedule && setEditingSchedule(null)} aria-label="Fechar" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-blue transition hover:bg-brand-bg">
                <X size={16} />
              </button>
            </div>

            <p className="mt-4 rounded-xl border border-brand-blue/15 bg-brand-soft px-4 py-3 text-sm font-bold text-brand-blue">Desmarque o dia/horário que o cliente cancelou. Ao salvar, esse horário volta a ficar livre na agenda e os demais continuam na reserva.</p>

            <div className="mt-5 flex max-h-[360px] flex-col gap-2 overflow-y-auto pr-1">
              {(editingSchedule.slot_items ?? []).map((slot) => {
                const cancelled = slot.status === 'cancelada';
                const checked = cancelled ? false : scheduleSelection.has(slot.slot_id);

                return (
                  <label key={slot.slot_id} className={cn('flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold', cancelled ? 'border-slate-200 bg-slate-50 text-slate-400' : checked ? 'border-brand-blue bg-brand-soft text-brand-blue' : 'border-red-200 bg-red-50 text-red-600')}>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={cancelled || savingSchedule}
                      onChange={() => toggleScheduleSlot(slot.slot_id)}
                      className="h-4 w-4 accent-brand-blue"
                    />
                    <span className="flex-1">{formatSlotPeriod(slot.slot_inicio, slot.slot_fim)}</span>
                    <span className={cn('rounded-full px-2 py-1 text-[10px] font-extrabold uppercase', cancelled ? 'bg-slate-200 text-slate-500' : checked ? 'bg-[#DDFBE8] text-[#147A3B]' : 'bg-red-100 text-red-600')}>
                      {cancelled ? 'Cancelado' : checked ? 'Mantém' : 'Remover'}
                    </span>
                  </label>
                );
              })}
            </div>

            {scheduleError ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700">{scheduleError}</p> : null}

            <div className="mt-6 flex gap-3">
              <button type="button" disabled={savingSchedule} onClick={() => setEditingSchedule(null)} className="flex-1 rounded-xl border border-brand-blue/20 bg-white px-4 py-3 text-sm font-extrabold text-slate-500 transition hover:-translate-y-0.5 disabled:opacity-50">Cancelar</button>
              <button type="button" disabled={savingSchedule} onClick={() => void saveScheduleEdit()} className="flex-1 rounded-xl bg-brand-blue px-4 py-3 text-sm font-extrabold text-white shadow-brand transition hover:-translate-y-0.5 disabled:opacity-50">{savingSchedule ? 'Salvando...' : 'Salvar horários'}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmada: 'bg-[#DDFBE8] text-[#147A3B]',
    lock_temporario: 'bg-[#FFF4D6] text-[#8A6100]',
    cancelada: 'bg-slate-100 text-slate-500',
    expirada: 'bg-red-50 text-red-600',
  };
  const labels: Record<string, string> = {
    confirmada: 'Confirmada',
    lock_temporario: 'Aguardando PIX',
    cancelada: 'Cancelada',
    expirada: 'Expirada',
  };

  return <span className={cn('rounded-full px-3 py-1 text-xs font-extrabold', styles[status] ?? 'bg-brand-soft text-brand-blue')}>{labels[status] ?? status}</span>;
}

function selectedAgendaRoomLabel(roomId: string): string {
  const room = salas.find((sala) => sala.id === roomId);

  return room ? `${room.numero} · ${room.nome}` : 'Sala selecionada';
}

function splitPublicosAtendidos(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  return value.split(',').map((item) => item.trim()).filter((item) => item.length > 0);
}

function formatPublicosAtendidos(value: string | null | undefined): string {
  const items = splitPublicosAtendidos(value);

  return items.length > 0 ? `Público atendido: ${items.join(', ')}` : 'Público atendido não informado';
}

function agendaSlotLabel(slot: AgendaSlot): string {
  const labels: Record<AgendaSlot['status'], string> = {
    livre: 'Livre',
    lock_temporario: 'Aguardando PIX',
    confirmada: 'Ocupado',
    bloqueada_admin: 'Bloqueado',
  };

  return labels[slot.status] ?? slot.status;
}

function agendaSlotStyle(slot: AgendaSlot): string {
  const styles: Record<AgendaSlot['status'], string> = {
    livre: 'border-green-200 bg-[#DDFBE8] text-[#147A3B]',
    lock_temporario: 'border-yellow-200 bg-[#FFF4D6] text-[#8A6100]',
    confirmada: 'border-red-200 bg-red-50 text-red-600',
    bloqueada_admin: 'border-slate-200 bg-slate-100 text-slate-500',
  };

  return styles[slot.status] ?? 'border-brand-blue/15 bg-brand-soft text-brand-blue';
}

interface ReservationSlotListProps {
  reservation: AdminReservation;
  onCancelSlot?: (slot: AdminReservationSlot) => void;
  busyId?: string | null;
  compact?: boolean;
}

function ReservationSlotList({ reservation, onCancelSlot, busyId, compact = false }: ReservationSlotListProps) {
  const items = reservation.slot_items ?? [];

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={compact ? 'mt-1 flex flex-col gap-1' : 'mt-3 flex flex-col gap-2'}>
      {items.map((slot) => {
        const cancelled = slot.status === 'cancelada';
        const busy = busyId === `${reservation.reserva_id}:${slot.slot_id}`;

        return (
          <div key={slot.slot_id} className={cn('flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold', cancelled ? 'border-slate-200 bg-slate-50 text-slate-400' : 'border-brand-blue/15 bg-brand-soft text-brand-blue')}>
            <span className="font-display text-sm font-semibold">{formatSlotPeriod(slot.slot_inicio, slot.slot_fim)}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase', cancelled ? 'bg-slate-200 text-slate-500' : 'bg-[#DDFBE8] text-[#147A3B]')}>{cancelled ? 'Cancelado' : 'Ativo'}</span>
            {onCancelSlot && !cancelled ? (
              <button
                type="button"
                disabled={busyId !== null}
                onClick={() => onCancelSlot(slot)}
                className="ml-auto rounded-full border border-red-200 bg-white px-3 py-1 text-[11px] font-extrabold text-red-600 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? 'Cancelando...' : 'Cancelar horário'}
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function activeSlotItems(reservation: AdminReservation): AdminReservationSlot[] {
  return (reservation.slot_items ?? []).filter((slot) => slot.status !== 'cancelada');
}

function formatSlotHour(value: string): string {
  const date = new Date(`${value.replace(' ', 'T')}Z`);

  if (Number.isNaN(date.getTime())) {
    return value.slice(11, 16);
  }

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(date);
}

function formatDayLabel(value: string): string {
  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatSlotDateTime(value: string): string {
  const date = new Date(`${value.replace(' ', 'T')}Z`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(date);
}

function formatSlotPeriod(start: string, end: string): string {
  return `${formatSlotDateTime(start)} - ${formatSlotHour(end)}`;
}

function formatReservationPeriod(reservation: AdminReservation): string {
  const activeSlots = activeSlotItems(reservation);

  if (activeSlots.length <= 1) {
    return formatSlotPeriod(reservation.slot_inicio, reservation.slot_fim);
  }

  return `${activeSlots.length} horários selecionados`;
}

function formatRemaining(seconds: number): string {
  const minutes = Math.max(0, Math.floor(seconds / 60));

  return minutes >= 1 ? `${minutes} min` : 'menos de 1 min';
}

function formatDurationSlots(value: number | string | undefined): string {
  const hours = Number(value ?? 1);

  return `${hours} hora${hours === 1 ? '' : 's'}`;
}
