import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Lock, RefreshCw, Send } from 'lucide-react';
import type { DadosAgendamento, PlanoAgendamento, ResumoAgendamento, RoomId, Sala } from '../../../types';
import { type AgendaSlot, confirmReservation, getAvailability, lockSlot } from '../../../services/agendaApi';
import { buildBookingWhatsAppUrl, createBookingSummary } from '../../../services/whatsappService';
import { cn } from '../../../utils/cn';
import { getTodayInSaoPaulo } from '../../../utils/formatDate';
import { horariosDisponiveis, planosDisponiveis } from '../data/rooms';
import { AgendaCalendar } from './AgendaCalendar';

interface BookingFormProps {
  salas: Sala[];
  selectedSalaId: RoomId | null;
  selectedPlan: PlanoAgendamento;
  onSelectPlan: (plan: PlanoAgendamento) => void;
  onSelectSala: (id: RoomId) => void;
}

const initialData: DadosAgendamento = { salaId: null, slotId: null, nomeCompleto: '', data: getTodayInSaoPaulo(), horario: null, plano: 'Light - Hora avulsa', whatsapp: '' };

const PENDING_STORAGE_KEY = 'ideia-reserva-pendente';

function loadPendingSummary(): ResumoAgendamento | null {
  try {
    const raw = sessionStorage.getItem(PENDING_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as ResumoAgendamento;

    if (!parsed || typeof parsed !== 'object' || !parsed.reservaId) {
      return null;
    }

    if (parsed.lockedUntil) {
      const expiresAt = new Date(`${parsed.lockedUntil.replace(' ', 'T')}Z`).getTime();

      if (Number.isFinite(expiresAt) && expiresAt < Date.now()) {
        sessionStorage.removeItem(PENDING_STORAGE_KEY);
        return null;
      }
    }

    return parsed;
  } catch {
    return null;
  }
}

export function BookingForm({ salas, selectedSalaId, selectedPlan, onSelectPlan, onSelectSala }: BookingFormProps) {
  const [data, setData] = useState<DadosAgendamento>({ ...initialData, salaId: selectedSalaId, plano: selectedPlan });
  const [summary, setSummary] = useState<ResumoAgendamento | null>(() => loadPendingSummary());
  const [codigo, setCodigo] = useState('');
  const [confirmState, setConfirmState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [agendaSlots, setAgendaSlots] = useState<AgendaSlot[]>([]);
  const [agendaState, setAgendaState] = useState<'idle' | 'loading' | 'online' | 'offline'>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const selectedSala = useMemo(() => salas.find((sala) => sala.id === data.salaId), [data.salaId, salas]);
  const selectedSlot = useMemo(() => agendaSlots.find((slot) => slot.id === data.slotId), [agendaSlots, data.slotId]);

  useEffect(() => setData((current) => ({ ...current, salaId: selectedSalaId, horario: selectedSalaId === current.salaId ? current.horario : null, slotId: selectedSalaId === current.salaId ? current.slotId : null })), [selectedSalaId]);
  useEffect(() => setData((current) => ({ ...current, plano: selectedPlan })), [selectedPlan]);
  useEffect(() => {
    if (!data.salaId || !data.data) {
      setAgendaSlots([]);
      setAgendaState('idle');
      return;
    }

    let active = true;
    setAgendaState('loading');

    getAvailability(data.salaId, data.data)
      .then((slots) => {
        if (!active) {
          return;
        }

        setAgendaSlots(slots);
        setAgendaState('online');
        setData((current) => {
          if (!current.slotId || slots.some((slot) => slot.id === current.slotId && slot.available)) {
            return current;
          }

          return { ...current, slotId: null, horario: null };
        });
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setAgendaSlots([]);
        setAgendaState('offline');
      });

    return () => {
      active = false;
    };
  }, [data.salaId, data.data]);

  function selectSala(id: RoomId) {
    onSelectSala(id);
    setData((current) => ({ ...current, salaId: id, horario: null, slotId: null }));
  }

  function selectPlan(plan: PlanoAgendamento) {
    onSelectPlan(plan);
    setData((current) => ({ ...current, plano: plan }));
  }

  function selectDate(date: string) {
    setData((current) => ({ ...current, data: date, horario: null, slotId: null }));
  }

  function resetSummary() {
    setSummary(null);
    setCodigo('');
    setConfirmState('idle');
    setConfirmError(null);
    sessionStorage.removeItem(PENDING_STORAGE_KEY);
  }

  async function confirmWithCode() {
    if (!summary?.reservaId || codigo.length !== 6) {
      return;
    }

    setConfirmState('sending');
    setConfirmError(null);

    try {
      await confirmReservation(summary.reservaId, codigo);
      setConfirmState('done');
      sessionStorage.removeItem(PENDING_STORAGE_KEY);

      if (data.salaId && data.data) {
        getAvailability(data.salaId, data.data).then(setAgendaSlots).catch(() => undefined);
      }
    } catch (error) {
      setConfirmState('idle');
      setConfirmError(error instanceof Error ? error.message : 'Erro ao confirmar. Tente novamente.');
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!data.salaId || !data.horario) {
      setFormError('Escolha uma sala, data e horário livre antes de continuar.');
      return;
    }

    let bookingSummary = createBookingSummary(data, selectedSala);

    if (selectedSlot) {
      try {
        const locked = await lockSlot({
          slotId: selectedSlot.id,
          clienteNome: data.nomeCompleto,
          clienteWhatsapp: data.whatsapp,
          plano: data.plano,
        });

        bookingSummary = {
          ...bookingSummary,
          slotId: locked.slot_id,
          reservaId: locked.reserva_id,
          lockToken: locked.lock_token,
          lockedUntil: locked.locked_until,
        };
      } catch {
        setFormError('Esse horário acabou de ser bloqueado. Atualize a agenda e escolha outro horário.');
        setAgendaState('loading');
        try {
          setAgendaSlots(await getAvailability(data.salaId, data.data));
          setAgendaState('online');
        } catch {
          setAgendaState('offline');
        }
        return;
      }
    }

    window.open(buildBookingWhatsAppUrl(bookingSummary), '_blank', 'noopener,noreferrer');
    setCodigo('');
    setConfirmState('idle');
    setConfirmError(null);
    setSummary(bookingSummary);

    if (bookingSummary.reservaId) {
      // Nao persiste o lock_token: ele nao e necessario para a confirmacao por codigo
      // (que usa reservaId + codigo) e reduz a exposicao caso o storage seja lido via XSS.
      const persistable: ResumoAgendamento = { ...bookingSummary };
      delete persistable.lockToken;
      sessionStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(persistable));
    }
  }

  return (
    <div id="cadastro" className="mt-12 scroll-mt-28 grid overflow-hidden rounded-3xl border border-brand-blue/15 shadow-hero transition duration-300 hover:scale-[1.01] lg:grid-cols-[1.35fr_0.65fr]">
      <form onSubmit={submit} className="bg-white p-6 md:p-8">
        <h3 className="font-display text-2xl font-semibold text-ink">Cadastro para disponibilidade</h3>
        <p className="mt-1 text-sm text-slate-600">Escolha o plano, a sala, a data e o horário pretendido. A disponibilidade e o cadastro vêm antes do pagamento.</p>
        <fieldset className="mt-6">
          <legend className="mb-2 text-xs font-extrabold uppercase tracking-[0.1em] text-brand-blue">Sala escolhida</legend>
          <div className="grid gap-3 md:grid-cols-2">
            {salas.map((sala) => {
              const active = data.salaId === sala.id;
              return <button key={sala.id} type="button" onClick={() => selectSala(sala.id)} className={cn('rounded-xl border px-4 py-3 text-sm font-extrabold transition', active ? 'border-brand-blue bg-brand-blue text-white' : 'border-brand-blue/20 bg-brand-soft text-brand-blue hover:bg-white')}>{sala.numero} · {sala.nome}</button>;
            })}
          </div>
        </fieldset>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block"><span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-brand-blue">Nome completo</span><input className="w-full rounded-xl border border-brand-blue/20 bg-brand-soft px-4 py-3 text-ink outline-none transition focus:border-brand-blue focus:bg-white" value={data.nomeCompleto} onChange={(event) => setData((current) => ({ ...current, nomeCompleto: event.target.value }))} placeholder="Seu nome" /></label>
          <label className="block"><span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-brand-blue">WhatsApp</span><input className="w-full rounded-xl border border-brand-blue/20 bg-brand-soft px-4 py-3 text-ink outline-none transition focus:border-brand-blue focus:bg-white" value={data.whatsapp} onChange={(event) => setData((current) => ({ ...current, whatsapp: event.target.value }))} placeholder="(34) 9 9999-9999" /></label>
        </div>
        <fieldset className="mt-5">
          <legend className="mb-2 text-xs font-extrabold uppercase tracking-[0.1em] text-brand-blue">Plano desejado</legend>
          <div className="grid gap-2 md:grid-cols-2">
            {planosDisponiveis.map((plano) => {
              const active = data.plano === plano;
              return <button key={plano} type="button" onClick={() => selectPlan(plano as PlanoAgendamento)} className={cn('rounded-xl border px-3 py-3 text-left text-sm font-bold transition', active ? 'border-[#E7A70E] bg-brand-yellow text-ink' : 'border-brand-blue/20 bg-brand-soft text-brand-blue')}>{plano}</button>;
            })}
          </div>
        </fieldset>
        <fieldset className="mt-5">
          <legend className="mb-2 text-xs font-extrabold uppercase tracking-[0.1em] text-brand-blue">Data e horário pretendido</legend>
          <div className="rounded-2xl border border-brand-blue/15 bg-brand-soft p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-blue"><CalendarDays size={18} /> Agenda do dia {formatDateLabel(data.data)}</div>
              <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-extrabold', agendaState === 'online' ? 'bg-[#DDFBE8] text-[#147A3B]' : agendaState === 'loading' ? 'bg-white text-brand-blue' : 'bg-white text-slate-500')}>
                {agendaState === 'loading' ? <RefreshCw size={14} className="animate-spin" /> : null}
                {agendaState === 'online' ? 'Agenda online' : agendaState === 'loading' ? 'Carregando' : 'Modo local'}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-[minmax(0,280px)_1fr]">
              <AgendaCalendar selectedDate={data.data} onSelectDate={selectDate} />
              <div className="flex flex-col">
                <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
                  {getCalendarSlots(agendaSlots, agendaState !== 'online').map((slot) => {
                    const active = data.slotId ? data.slotId === slot.id : data.horario === slot.label;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setData((current) => ({ ...current, horario: slot.label, slotId: slot.api ? slot.id : null }))}
                        className={cn(
                          'min-h-[64px] rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition',
                          active && 'border-brand-blue bg-brand-blue text-white',
                          !active && slot.available && 'border-brand-blue/20 bg-white text-brand-blue hover:border-brand-blue hover:bg-white',
                          !slot.available && 'cursor-not-allowed border-red-200 bg-red-50 text-red-400',
                        )}
                      >
                        <span className="block text-base">{slot.label}</span>
                        <span className="mt-1 block text-xs font-extrabold">{slot.available ? 'Livre' : slot.status === 'lock_temporario' ? 'Em espera' : 'Reservado'}</span>
                      </button>
                    );
                  })}
                </div>
                {agendaState === 'online' && agendaSlots.length === 0 ? <p className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-600">Nenhum horário foi gerado para essa sala nesta data.</p> : null}
                <div className="mt-auto flex flex-wrap gap-2 pt-4 text-[11px] font-extrabold">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[#147A3B]"><span className="h-2 w-2 rounded-full bg-[#25A45B]" /> Livre</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-red-600"><span className="h-2 w-2 rounded-full bg-red-500" /> Ocupado</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-brand-blue"><span className="h-2 w-2 rounded-full bg-brand-blue" /> Selecionado</span>
                </div>
              </div>
            </div>
          </div>
        </fieldset>
        {formError ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{formError}</p> : null}
        <button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] px-5 py-4 font-extrabold text-white shadow-whatsapp transition hover:-translate-y-0.5"><Send size={19} /> Verificar disponibilidade no WhatsApp</button>
        <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs font-bold text-slate-600"><Lock size={14} className="text-brand-blue" /> Nenhum pagamento agora. Primeiro a equipe confirma sala livre e cadastro; depois vem o pagamento.</p>
      </form>
      <aside className="relative flex flex-col bg-brand-navy p-7 text-white md:p-8">
        <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-brand-yellow">Resumo da solicitação</div>
        {summary ? (
          <div className="mt-6 flex flex-1 flex-col justify-center gap-4">
            <div className={cn('grid h-14 w-14 place-items-center rounded-full text-ink', confirmState === 'done' ? 'bg-[#7CF29B]' : 'bg-brand-yellow')}>✓</div>
            <h4 className="font-display text-2xl font-semibold">{confirmState === 'done' ? 'Reserva confirmada!' : 'Solicitação enviada!'}</h4>
            {confirmState === 'done' ? (
              <p className="text-sm leading-7 text-white/85">Tudo certo, <strong>{summary.nome}</strong>! A <strong>{summary.sala}</strong> está garantida para <strong>{summary.data}</strong> às <strong>{summary.horario}</strong> no plano <strong>{summary.plano}</strong>. O horário já aparece como reservado na agenda.</p>
            ) : (
              <>
                <p className="text-sm leading-7 text-white/85"><strong>{summary.nome}</strong>, seu pedido da <strong>{summary.sala}</strong> para <strong>{summary.data}</strong> às <strong>{summary.horario}</strong> abriu no WhatsApp. O horário fica guardado por 30 minutos. Após o PIX, a equipe te envia um <strong>código de confirmação</strong>.</p>
                {summary.reservaId ? (
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                    <label htmlFor="codigo-confirmacao" className="block text-xs font-extrabold uppercase tracking-[0.12em] text-brand-yellow">Já recebeu o código? Digite aqui</label>
                    <input
                      id="codigo-confirmacao"
                      value={codigo}
                      onChange={(event) => setCodigo(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="000000"
                      className="mt-2 w-full rounded-xl border border-white/25 bg-white/15 px-4 py-3 text-center font-display text-2xl font-bold tracking-[0.35em] text-white outline-none transition placeholder:text-white/25 focus:border-brand-yellow"
                    />
                    <button
                      type="button"
                      disabled={codigo.length !== 6 || confirmState === 'sending'}
                      onClick={() => void confirmWithCode()}
                      className="mt-3 w-full rounded-xl bg-brand-yellow px-4 py-3 text-sm font-extrabold text-ink transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {confirmState === 'sending' ? 'Confirmando...' : 'Confirmar reserva'}
                    </button>
                    {confirmError ? <p className="mt-2 text-xs font-bold text-red-300">{confirmError}</p> : null}
                  </div>
                ) : null}
              </>
            )}
            <button type="button" onClick={resetSummary} className="mt-2 rounded-full bg-white/15 px-5 py-3 text-sm font-extrabold text-white ring-1 ring-white/30 transition hover:bg-white/25">Fazer novo pedido</button>
          </div>
        ) : (
          <div className="mt-6 flex flex-1 flex-col gap-4">
            <SummaryItem label="Sala" value={selectedSala ? `${selectedSala.numero} · ${selectedSala.nome}` : 'A escolher'} />
            <SummaryItem label="Horário pretendido" value={data.horario || 'A escolher'} />
            <SummaryItem label="Plano desejado" value={data.plano} />
            <div className="mt-auto space-y-3 pt-6">
              {['Você envia a solicitação pelo WhatsApp', 'A equipe confere disponibilidade da sala e do horário', 'Com horário livre, o cadastro é feito antes do pagamento'].map((step, index) => <div key={step} className="flex items-start gap-3 text-sm text-white/85"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-yellow text-xs font-black text-ink">{index + 1}</span>{step}</div>)}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

interface SummaryItemProps {
  label: string;
  value: string;
}

function SummaryItem({ label, value }: SummaryItemProps) {
  return <div><div className="text-xs text-white/60">{label}</div><div className="font-display text-lg font-semibold">{value}</div></div>;
}

interface CalendarSlot {
  id: string;
  label: string;
  status: AgendaSlot['status'] | 'local';
  available: boolean;
  api: boolean;
}

function getCalendarSlots(slots: AgendaSlot[], allowLocalFallback: boolean): CalendarSlot[] {
  if (slots.length > 0) {
    return slots.map((slot) => ({
      id: slot.id,
      label: formatSlotHour(slot.inicio),
      status: slot.status,
      available: slot.available,
      api: true,
    }));
  }

  if (!allowLocalFallback) {
    return [];
  }

  return horariosDisponiveis.map((horario) => ({
    id: horario,
    label: horario,
    status: 'local',
    available: true,
    api: false,
  }));
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

function formatDateLabel(value: string): string {
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : 'selecionado';
}
