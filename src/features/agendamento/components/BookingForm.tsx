import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Lock, RefreshCw, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DadosAgendamento, HorarioSelecionado, PlanoAgendamento, ResumoAgendamento, RoomId, Sala } from '../../../types';
import { type AgendaSlot, confirmReservation, getAvailability, getAvailabilityRange, lockSlot } from '../../../services/agendaApi';
import { buildBookingWhatsAppUrl, createBookingSummary } from '../../../services/whatsappService';
import { cn } from '../../../utils/cn';
import { getTodayInSaoPaulo } from '../../../utils/formatDate';
import { buildConsentRecord } from '../../../utils/legalConsent';
import { getRegraPlano, horariosDisponiveis, planosDisponiveis } from '../data/rooms';
import { AgendaCalendar } from './AgendaCalendar';

interface BookingFormProps {
  salas: Sala[];
  selectedSalaId: RoomId | null;
  selectedPlan: PlanoAgendamento;
  onSelectPlan: (plan: PlanoAgendamento) => void;
  onSelectSala: (id: RoomId) => void;
}

const initialData: DadosAgendamento = { salaId: null, slotId: null, slotIds: [], slotsSelecionados: [], nomeCompleto: '', crp: '', publicosAtendidos: [], abordagemTrabalho: '', data: getTodayInSaoPaulo(), horario: null, horarios: [], duracaoHoras: 0, plano: 'Light - Hora avulsa', whatsapp: '' };
const PUBLICOS_ATENDIDOS = ['Adulto', 'Criança', 'Adolescente'] as const;

const PENDING_STORAGE_KEY = 'ideia-reserva-pendente';

function loadPendingSummary(): ResumoAgendamento | null {
  try {
    const raw = localStorage.getItem(PENDING_STORAGE_KEY);
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
        localStorage.removeItem(PENDING_STORAGE_KEY);
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
  const availabilityCacheRef = useRef<Record<string, AgendaSlot[]>>({});
  const loadedMonthsRef = useRef<Set<string>>(new Set());
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ whatsapp: string | null; crp: string | null }>({ whatsapp: null, crp: null });
  const [aceiteLegal, setAceiteLegal] = useState(false);
  const selectedSala = useMemo(() => salas.find((sala) => sala.id === data.salaId), [data.salaId, salas]);
  const regraPlano = getRegraPlano(data.plano);
  const calendarSlots = useMemo(() => getCalendarSlots(agendaSlots, agendaState !== 'online'), [agendaSlots, agendaState]);

  useEffect(() => setData((current) => (selectedSalaId === current.salaId ? { ...current, salaId: selectedSalaId } : applySelectedSlots({ ...current, salaId: selectedSalaId }, []))), [selectedSalaId]);
  useEffect(() => {
    setData((current) => ({
      ...current,
      plano: selectedPlan,
      ...selectionFields([]),
    }));
  }, [selectedPlan]);
  useEffect(() => {
    if (!data.salaId || !data.data) {
      setAgendaSlots([]);
      setAgendaState('idle');
      return;
    }

    const salaId = data.salaId;
    const selectedDate = data.data;
    const monthKey = buildMonthCacheKey(salaId, selectedDate);
    const dayKey = buildDayCacheKey(salaId, selectedDate);
    const cachedDay = availabilityCacheRef.current[dayKey];

    if (loadedMonthsRef.current.has(monthKey)) {
      const slots = cachedDay ?? [];
      setAgendaSlots(slots);
      setAgendaState('online');
      pruneUnavailableSelections(slots);
      return;
    }

    let active = true;
    setAgendaState('loading');

    const { startDate, endDate } = getMonthRange(selectedDate);
    getAvailabilityRange(salaId, startDate, endDate)
      .then((slotsByDate) => {
        if (!active) {
          return;
        }

        Object.entries(slotsByDate).forEach(([date, slots]) => {
          availabilityCacheRef.current[buildDayCacheKey(salaId, date)] = slots;
        });
        loadedMonthsRef.current.add(monthKey);

        const slots = availabilityCacheRef.current[dayKey] ?? [];
        setAgendaSlots(slots);
        setAgendaState('online');
        pruneUnavailableSelections(slots);
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

  function pruneUnavailableSelections(slots: AgendaSlot[]) {
    setData((current) => {
      const availableIds = new Set(slots.filter((slot) => slot.available).map((slot) => slot.id));
      const nextSelected = current.slotsSelecionados.filter((slot) => slot.data !== current.data || !slot.slotId || availableIds.has(slot.slotId));

      return nextSelected.length === current.slotsSelecionados.length ? current : applySelectedSlots(current, nextSelected);
    });
  }

  function updateCachedDay(salaId: string, date: string, slots: AgendaSlot[]) {
    availabilityCacheRef.current[buildDayCacheKey(salaId, date)] = slots;
    loadedMonthsRef.current.add(buildMonthCacheKey(salaId, date));
  }

  function handleWhatsappChange(value: string) {
    const masked = maskPhoneBR(value);
    setData((current) => ({ ...current, whatsapp: masked }));
    setFieldErrors((current) => (current.whatsapp ? { ...current, whatsapp: validatePhoneBR(masked) } : current));
  }

  function handleCrpChange(value: string) {
    const masked = maskCrp(value);
    setData((current) => ({ ...current, crp: masked }));
    setFieldErrors((current) => (current.crp ? { ...current, crp: validateCrp(masked) } : current));
  }

  function validateField(field: 'whatsapp' | 'crp') {
    const error = field === 'whatsapp' ? validatePhoneBR(data.whatsapp) : validateCrp(data.crp);
    setFieldErrors((current) => ({ ...current, [field]: error }));
  }

  function selectSala(id: RoomId) {
    onSelectSala(id);
    setData((current) => applySelectedSlots({ ...current, salaId: id }, []));
  }

  function selectPlan(plan: PlanoAgendamento) {
    onSelectPlan(plan);
    setData((current) => ({ ...current, plano: plan }));
  }

  function selectDate(date: string) {
    setData((current) => ({ ...current, data: date }));
  }

  function resetSummary() {
    setSummary(null);
    setCodigo('');
    setConfirmState('idle');
    setConfirmError(null);
    localStorage.removeItem(PENDING_STORAGE_KEY);
  }

  function toggleCalendarSlot(slot: CalendarSlot) {
    const slotKey = slot.api ? slot.id : `${data.data}-${slot.label}`;
    const active = data.slotsSelecionados.some((selected) => selected.slotId === slotKey || (!selected.slotId && selected.data === data.data && selected.horario === slot.label));

    if (!active && data.slotsSelecionados.length >= regraPlano.max) {
      setFormError(`O plano ${data.plano} permite selecionar no máximo ${regraPlano.max} horários.`);
      return;
    }

    if (!active && data.slotsSelecionados.length > 0 && data.slotsSelecionados.some((selected) => selected.data.slice(0, 7) !== data.data.slice(0, 7))) {
      setFormError('Escolha horários dentro do mesmo mês para fechar o pacote selecionado.');
      return;
    }

    setFormError(null);
    setData((current) => {
      const nextSelected = active
        ? current.slotsSelecionados.filter((selected) => selected.slotId !== slotKey && !(selected.data === current.data && selected.horario === slot.label))
        : [
            ...current.slotsSelecionados,
            {
              ...(slot.api ? { slotId: slot.id } : {}),
              data: current.data,
              horario: slot.label,
              label: `${formatDateLabel(current.data)} às ${slot.label}`,
            },
          ];

      return applySelectedSlots(current, nextSelected);
    });
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
      localStorage.removeItem(PENDING_STORAGE_KEY);

      if (data.salaId && data.data) {
        getAvailability(data.salaId, data.data)
          .then((slots) => {
            updateCachedDay(data.salaId!, data.data, slots);
            setAgendaSlots(slots);
          })
          .catch(() => undefined);
      }
    } catch (error) {
      setConfirmState('idle');
      setConfirmError(error instanceof Error ? error.message : 'Erro ao confirmar. Tente novamente.');
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const whatsappError = validatePhoneBR(data.whatsapp);
    const crpError = validateCrp(data.crp);
    setFieldErrors({ whatsapp: whatsappError, crp: crpError });

    if (whatsappError || crpError) {
      setFormError('Corrija os campos destacados em vermelho antes de continuar.');
      return;
    }

    if (!data.salaId || data.slotsSelecionados.length === 0) {
      setFormError('Escolha uma sala, data e pelo menos um horário livre antes de continuar.');
      return;
    }

    if (data.publicosAtendidos.length === 0) {
      setFormError('Selecione ao menos um público atendido.');
      return;
    }

    if (!data.abordagemTrabalho.trim()) {
      setFormError('Informe a abordagem de trabalho.');
      return;
    }

    if (data.slotsSelecionados.length < regraPlano.min || data.slotsSelecionados.length > regraPlano.max) {
      const faixa = regraPlano.min === regraPlano.max ? `${regraPlano.min} horário` : `de ${regraPlano.min} a ${regraPlano.max} horários`;
      setFormError(`O plano ${data.plano} exige ${faixa}. Você selecionou ${data.slotsSelecionados.length}.`);
      return;
    }

    if (!aceiteLegal) {
      setFormError('Para continuar, marque o aceite dos Termos de Uso e da Política de Privacidade.');
      return;
    }

    const aceite = buildConsentRecord();
    let bookingSummary: ResumoAgendamento = { ...createBookingSummary(data, selectedSala), aceite };

    if (regraPlano.bloqueioOnline && data.slotIds.length !== data.slotsSelecionados.length) {
      setFormError('Atualize a agenda e selecione horários livres antes de continuar.');
      return;
    }

    if (data.slotIds.length > 0 && regraPlano.bloqueioOnline) {
      const firstSlotId = data.slotIds[0];
      if (!firstSlotId) {
        setFormError('Atualize a agenda e selecione horários livres antes de continuar.');
        return;
      }

      try {
        const locked = await lockSlot({
          slotId: firstSlotId,
          slotIds: data.slotIds,
          clienteNome: data.nomeCompleto,
          clienteWhatsapp: data.whatsapp,
          plano: data.plano,
          clienteCrp: data.crp,
          publicosAtendidos: data.publicosAtendidos,
          abordagemTrabalho: data.abordagemTrabalho,
          aceite,
        });

        bookingSummary = {
          ...bookingSummary,
          slotId: locked.slot_id,
          slotIds: locked.slot_ids ?? data.slotIds,
          reservaId: locked.reserva_id,
          lockToken: locked.lock_token,
          lockedUntil: locked.locked_until,
          duracaoHoras: locked.duration_slots ?? data.slotsSelecionados.length,
        };
      } catch {
        setFormError('Esse horário acabou de ser bloqueado. Atualize a agenda e escolha outro horário.');
        setAgendaState('loading');
        try {
          const refreshedSlots = await getAvailability(data.salaId, data.data);
          updateCachedDay(data.salaId, data.data, refreshedSlots);
          setAgendaSlots(refreshedSlots);
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
      localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(persistable));
    }
  }

  return (
    <div id="cadastro" className="mt-12 scroll-mt-28 grid overflow-hidden rounded-3xl border border-brand-blue/15 shadow-hero transition duration-300 hover:scale-[1.01] dark:border-white/10 lg:grid-cols-[1.35fr_0.65fr]">
      <form onSubmit={submit} className="bg-white p-5 dark:bg-night-card sm:p-6 md:p-8">
        <h3 className="font-display text-2xl font-semibold text-ink dark:text-white">Cadastro para disponibilidade</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Escolha o plano, a sala, a data e o horário pretendido. A disponibilidade e o cadastro vêm antes do pagamento.</p>
        <fieldset className="mt-6">
          <legend className="mb-2 text-xs font-extrabold uppercase tracking-[0.1em] text-brand-blue dark:text-brand-sky">Sala escolhida</legend>
          <div className="grid gap-3 md:grid-cols-2">
            {salas.map((sala) => {
              const active = data.salaId === sala.id;
              return <button key={sala.id} type="button" onClick={() => selectSala(sala.id)} className={cn('rounded-xl border px-4 py-3 text-sm font-extrabold transition', active ? 'border-brand-blue bg-brand-blue text-white' : 'border-brand-blue/20 bg-brand-soft text-brand-blue hover:bg-white dark:border-white/15 dark:bg-night-soft dark:text-brand-sky dark:hover:bg-white/10')}>{sala.numero} · {sala.nome}</button>;
            })}
          </div>
        </fieldset>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block"><span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-brand-blue dark:text-brand-sky">Nome completo</span><input className="w-full rounded-xl border border-brand-blue/20 bg-brand-soft px-4 py-3 text-ink outline-none transition focus:border-brand-blue focus:bg-white dark:border-white/15 dark:bg-night-soft dark:text-white dark:placeholder:text-slate-500 dark:focus:border-brand-sky dark:focus:bg-night-soft" value={data.nomeCompleto} onChange={(event) => setData((current) => ({ ...current, nomeCompleto: event.target.value }))} placeholder="Seu nome" /></label>
          <label className="block">
            <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-brand-blue dark:text-brand-sky">WhatsApp</span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={15}
              className={cn(
                'w-full rounded-xl border bg-brand-soft px-4 py-3 text-ink outline-none transition focus:bg-white dark:bg-night-soft dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-night-soft',
                fieldErrors.whatsapp ? 'border-red-400 focus:border-red-500' : 'border-brand-blue/20 focus:border-brand-blue dark:border-white/15 dark:focus:border-brand-sky',
              )}
              value={data.whatsapp}
              onChange={(event) => handleWhatsappChange(event.target.value)}
              onBlur={() => validateField('whatsapp')}
              aria-invalid={Boolean(fieldErrors.whatsapp)}
              placeholder="(34) 99999-9999"
            />
            {fieldErrors.whatsapp ? <span className="mt-1.5 block text-xs font-bold text-red-600">{fieldErrors.whatsapp}</span> : null}
          </label>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[0.55fr_1fr]">
          <label className="block">
            <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-brand-blue dark:text-brand-sky">CRP</span>
            <input
              inputMode="numeric"
              maxLength={10}
              className={cn(
                'w-full rounded-xl border bg-brand-soft px-4 py-3 text-ink outline-none transition focus:bg-white dark:bg-night-soft dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-night-soft',
                fieldErrors.crp ? 'border-red-400 focus:border-red-500' : 'border-brand-blue/20 focus:border-brand-blue dark:border-white/15 dark:focus:border-brand-sky',
              )}
              value={data.crp}
              onChange={(event) => handleCrpChange(event.target.value)}
              onBlur={() => validateField('crp')}
              aria-invalid={Boolean(fieldErrors.crp)}
              placeholder="00/00000"
            />
            {fieldErrors.crp ? <span className="mt-1.5 block text-xs font-bold text-red-600">{fieldErrors.crp}</span> : null}
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-brand-blue dark:text-brand-sky">Abordagem de trabalho</span>
            <input
              className="w-full rounded-xl border border-brand-blue/20 bg-brand-soft px-4 py-3 text-ink outline-none transition focus:border-brand-blue focus:bg-white dark:border-white/15 dark:bg-night-soft dark:text-white dark:placeholder:text-slate-500 dark:focus:border-brand-sky dark:focus:bg-night-soft"
              value={data.abordagemTrabalho}
              onChange={(event) => setData((current) => ({ ...current, abordagemTrabalho: event.target.value }))}
              placeholder="TCC, psicanálise, humanista..."
            />
          </label>
        </div>
        <fieldset className="mt-5">
          <legend className="mb-2 text-xs font-extrabold uppercase tracking-[0.1em] text-brand-blue dark:text-brand-sky">Público atendido</legend>
          <div className="grid gap-2 md:grid-cols-3">
            {PUBLICOS_ATENDIDOS.map((publico) => {
              const active = data.publicosAtendidos.includes(publico);
              return (
                <button
                  key={publico}
                  type="button"
                  onClick={() => setData((current) => ({
                    ...current,
                    publicosAtendidos: active
                      ? current.publicosAtendidos.filter((item) => item !== publico)
                      : [...current.publicosAtendidos, publico],
                  }))}
                  className={cn('rounded-xl border px-3 py-3 text-left text-sm font-bold transition', active ? 'border-brand-blue bg-brand-blue text-white' : 'border-brand-blue/20 bg-brand-soft text-brand-blue dark:border-white/15 dark:bg-night-soft dark:text-brand-sky')}
                >
                  {publico}
                </button>
              );
            })}
          </div>
        </fieldset>
        <fieldset className="mt-5">
          <legend className="mb-2 text-xs font-extrabold uppercase tracking-[0.1em] text-brand-blue dark:text-brand-sky">Plano desejado</legend>
          <div className="grid gap-2 md:grid-cols-2">
            {planosDisponiveis.map((plano) => {
              const active = data.plano === plano;
              return <button key={plano} type="button" onClick={() => selectPlan(plano as PlanoAgendamento)} className={cn('rounded-xl border px-3 py-3 text-left text-sm font-bold transition', active ? 'border-[#E7A70E] bg-brand-yellow text-ink' : 'border-brand-blue/20 bg-brand-soft text-brand-blue dark:border-white/15 dark:bg-night-soft dark:text-brand-sky')}>{plano}</button>;
            })}
          </div>
        </fieldset>
        <p className="mt-3 rounded-xl border border-brand-blue/15 bg-brand-soft px-4 py-3 text-sm font-bold text-brand-blue dark:border-white/15 dark:bg-night-soft dark:text-brand-sky">
          Plano selecionado: marque {regraPlano.min === regraPlano.max ? `${regraPlano.min} horário` : `de ${regraPlano.min} a ${regraPlano.max} horários`} livres na agenda.
          <span className="mt-1 block text-xs text-slate-600 dark:text-slate-400">Cancelamentos ou remarcações devem ser solicitados com no mínimo 48h de antecedência.</span>
        </p>
        <fieldset className="mt-5">
          <legend className="mb-2 text-xs font-extrabold uppercase tracking-[0.1em] text-brand-blue dark:text-brand-sky">Data e horário pretendido</legend>
          <div className="rounded-2xl border border-brand-blue/15 bg-brand-soft p-4 dark:border-white/10 dark:bg-night-soft">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-blue dark:text-brand-sky"><CalendarDays size={18} /> Agenda do dia {formatDateLabel(data.data)}</div>
              <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-extrabold', agendaState === 'online' ? 'bg-[#DDFBE8] text-[#147A3B] dark:bg-[#12321F] dark:text-[#5BD98A]' : agendaState === 'loading' ? 'bg-white text-brand-blue dark:bg-night-card dark:text-brand-sky' : 'bg-white text-slate-500 dark:bg-night-card dark:text-slate-400')}>
                {agendaState === 'loading' ? <RefreshCw size={14} className="animate-spin" /> : null}
                {agendaState === 'online' ? 'Agenda online' : agendaState === 'loading' ? 'Carregando' : 'Modo local'}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-[minmax(0,280px)_1fr]">
              <AgendaCalendar selectedDate={data.data} onSelectDate={selectDate} />
              <div className="flex flex-col">
                <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
                  {calendarSlots.map((slot) => {
                    const active = slot.api
                      ? data.slotIds.includes(slot.id)
                      : data.slotsSelecionados.some((selected) => selected.data === data.data && selected.horario === slot.label);
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={!slot.available && !active}
                        onClick={() => toggleCalendarSlot(slot)}
                        className={cn(
                          'min-h-[64px] rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition',
                          active && 'border-brand-blue bg-brand-blue text-white dark:border-brand-sky',
                          !active && slot.available && 'border-brand-blue/20 bg-white text-brand-blue hover:border-brand-blue hover:bg-white dark:border-white/15 dark:bg-night-card dark:text-brand-sky dark:hover:border-brand-sky dark:hover:bg-night-card',
                          !slot.available && 'cursor-not-allowed border-red-200 bg-red-50 text-red-400 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400',
                        )}
                      >
                        <span className="block text-base">{slot.label}</span>
                        <span className="mt-1 block text-xs font-extrabold">{active ? 'Selecionado' : slot.available ? 'Livre' : slot.status === 'lock_temporario' ? 'Em espera' : 'Reservado'}</span>
                      </button>
                    );
                  })}
                </div>
                {agendaState === 'online' && agendaSlots.length === 0 ? <p className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-600 dark:bg-night-card dark:text-slate-300">Nenhum horário foi gerado para essa sala nesta data.</p> : null}
                <div className="mt-auto flex flex-wrap gap-2 pt-4 text-[11px] font-extrabold">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[#147A3B] dark:bg-night-card dark:text-[#5BD98A]"><span className="h-2 w-2 rounded-full bg-[#25A45B]" /> Livre</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-red-600 dark:bg-night-card dark:text-red-400"><span className="h-2 w-2 rounded-full bg-red-500" /> Ocupado</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-brand-blue dark:bg-night-card dark:text-brand-sky"><span className="h-2 w-2 rounded-full bg-brand-sky" /> Selecionado</span>
                </div>
              </div>
            </div>
          </div>
        </fieldset>
        <div className="mt-6 rounded-2xl border border-brand-blue/15 bg-brand-soft p-4 dark:border-white/10 dark:bg-night-soft sm:p-5">
          <h4 className="text-xs font-extrabold uppercase tracking-[0.1em] text-brand-blue dark:text-brand-sky">Confira sua solicitação</h4>
          <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <ConfirmationItem label="Sala" value={selectedSala ? `${selectedSala.numero} · ${selectedSala.nome}` : 'A escolher'} />
            <ConfirmationItem label="Plano" value={data.plano} />
            <ConfirmationItem label="Data e horários" value={data.horarios.length > 0 ? data.horarios.join(', ') : 'A escolher'} wide />
            <ConfirmationItem label="Nome" value={data.nomeCompleto.trim() || 'A preencher'} />
            <ConfirmationItem label="WhatsApp" value={data.whatsapp.trim() || 'A preencher'} />
            <ConfirmationItem label="CRP" value={data.crp.trim() || 'A preencher'} />
          </dl>
          <ul className="mt-4 space-y-1.5 border-t border-brand-blue/10 pt-3 text-xs leading-5 text-slate-600 dark:border-white/10 dark:text-slate-300">
            <li>Seus dados serão enviados para o WhatsApp da clínica para verificação e confirmação da reserva.</li>
            <li>Nenhum pagamento é feito no site: o PIX é combinado pelo WhatsApp após a confirmação.</li>
            <li>
              Cancelamentos e remarcações devem ser solicitados com no mínimo 48h de antecedência. Consulte as condições
              completas nos <Link to="/termos-de-uso#cancelamento" target="_blank" rel="noopener noreferrer" className="font-bold text-brand-blue underline dark:text-brand-sky">Termos de Uso</Link>.
            </li>
          </ul>
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-brand-blue/15 bg-white p-3 dark:border-white/10 dark:bg-night-card">
            <input
              type="checkbox"
              checked={aceiteLegal}
              onChange={(event) => {
                setAceiteLegal(event.target.checked);
                if (event.target.checked) {
                  setFormError(null);
                }
              }}
              aria-label="Aceito os Termos de Uso e a Política de Privacidade"
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-brand-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
            />
            <span className="text-xs leading-5 text-slate-600 dark:text-slate-300">
              Li e aceito os <Link to="/termos-de-uso" target="_blank" rel="noopener noreferrer" className="font-bold text-brand-blue underline dark:text-brand-sky">Termos de Uso</Link> e a{' '}
              <Link to="/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="font-bold text-brand-blue underline dark:text-brand-sky">Política de Privacidade</Link>. Entendo que meus
              dados serão usados para solicitar e confirmar a reserva, enviados para o WhatsApp da clínica e que
              cancelamentos/remarcações seguem a política informada.
            </span>
          </label>
        </div>
        {formError ? <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{formError}</p> : null}
        <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs font-bold text-slate-600 dark:text-slate-300"><Lock size={14} className="shrink-0 text-brand-blue dark:text-brand-sky" /> Ao continuar, sua solicitação será enviada para o WhatsApp da clínica. Nenhum pagamento é feito neste site.</p>
        <button
          type="submit"
          disabled={!aceiteLegal}
          className="mt-3 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] px-5 py-4 font-extrabold text-white shadow-whatsapp transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <Send size={19} /> Solicitar reserva no WhatsApp
        </button>
        {!aceiteLegal ? <p className="mt-2 text-center text-xs font-bold text-slate-500 dark:text-slate-400">Marque o aceite acima para habilitar o envio.</p> : null}
      </form>
      <aside className="relative flex flex-col bg-brand-navy p-5 text-white sm:p-7 md:p-8">
        <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-brand-yellow">Resumo da solicitação</div>
        {summary ? (
          <div className="mt-6 flex flex-1 flex-col justify-center gap-4">
            <div className={cn('grid h-14 w-14 place-items-center rounded-full text-ink', confirmState === 'done' ? 'bg-[#7CF29B]' : 'bg-brand-yellow')}>✓</div>
            <h4 className="font-display text-2xl font-semibold">{confirmState === 'done' ? 'Reserva confirmada!' : 'Solicitação enviada!'}</h4>
            {confirmState === 'done' ? (
              <p className="text-sm leading-7 text-white/85">Tudo certo, <strong>{summary.nome}</strong>! A <strong>{summary.sala}</strong> está garantida para <strong>{summary.horarios?.join(', ') || `${summary.data} às ${summary.horario}`}</strong> no plano <strong>{summary.plano}</strong>. Os horários já aparecem como reservados na agenda.</p>
            ) : (
              <>
                <p className="text-sm leading-7 text-white/85"><strong>{summary.nome}</strong>, seu pedido da <strong>{summary.sala}</strong> para <strong>{summary.horarios?.join(', ') || `${summary.data} às ${summary.horario}`}</strong> abriu no WhatsApp. Os horários ficam guardados por 30 minutos. Após o PIX, a equipe te envia um <strong>código de confirmação</strong>.</p>
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
            <SummaryItem label="Horários pretendidos" value={data.horarios.length > 0 ? data.horarios.join(', ') : 'A escolher'} />
            <SummaryItem label="Duração" value={data.slotsSelecionados.length > 0 ? `${data.slotsSelecionados.length} hora${data.slotsSelecionados.length > 1 ? 's' : ''}` : 'A escolher'} />
            <SummaryItem label="Plano desejado" value={data.plano} />
            <SummaryItem label="CRP" value={data.crp || 'A escolher'} />
            <SummaryItem label="Público atendido" value={data.publicosAtendidos.length > 0 ? data.publicosAtendidos.join(', ') : 'A escolher'} />
            <SummaryItem label="Abordagem" value={data.abordagemTrabalho || 'A escolher'} />
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

interface ConfirmationItemProps {
  label: string;
  value: string;
  wide?: boolean;
}

function ConfirmationItem({ label, value, wide = false }: ConfirmationItemProps) {
  return (
    <div className={cn(wide && 'sm:col-span-2')}>
      <dt className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="m-0 font-bold text-ink dark:text-white">{value}</dd>
    </div>
  );
}

function applySelectedSlots(data: DadosAgendamento, selectedSlots: HorarioSelecionado[]): DadosAgendamento {
  return {
    ...data,
    ...selectionFields(selectedSlots),
  };
}

function selectionFields(selectedSlots: HorarioSelecionado[]): Pick<DadosAgendamento, 'slotId' | 'slotIds' | 'slotsSelecionados' | 'horario' | 'horarios' | 'duracaoHoras'> {
  const sorted = [...selectedSlots].sort((a, b) => `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`));
  const slotIds = sorted.map((slot) => slot.slotId).filter((slotId): slotId is string => Boolean(slotId));
  const horarios = sorted.map((slot) => slot.label);

  return {
    slotId: slotIds[0] ?? null,
    slotIds,
    slotsSelecionados: sorted,
    horario: sorted[0]?.horario ?? null,
    horarios,
    duracaoHoras: sorted.length,
  };
}

interface CalendarSlot {
  id: string;
  label: string;
  labels: string[];
  slotIds: string[];
  status: AgendaSlot['status'] | 'local';
  available: boolean;
  api: boolean;
}

function getCalendarSlots(slots: AgendaSlot[], allowLocalFallback: boolean): CalendarSlot[] {
  if (slots.length > 0) {
    return slots.map((slot) => ({
      id: slot.id,
      label: formatSlotHour(slot.inicio),
      labels: [formatSlotHour(slot.inicio)],
      slotIds: [slot.id],
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
    labels: [horario],
    slotIds: [],
    status: 'local',
    available: true,
    api: false,
  }));
}

function buildDayCacheKey(salaId: string, date: string): string {
  return `${salaId}:${date}`;
}

function buildMonthCacheKey(salaId: string, date: string): string {
  return `${salaId}:${date.slice(0, 7)}`;
}

function getMonthRange(date: string): { startDate: string; endDate: string } {
  const [yearText, monthText] = date.split('-');
  const year = Number(yearText);
  const month = Number(monthText);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return { startDate: date, endDate: date };
  }

  const lastDay = new Date(year, month, 0).getDate();
  const monthValue = String(month).padStart(2, '0');

  return {
    startDate: `${year}-${monthValue}-01`,
    endDate: `${year}-${monthValue}-${String(lastDay).padStart(2, '0')}`,
  };
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

function maskPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length === 0) {
    return '';
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function validatePhoneBR(value: string): string | null {
  if (!value.trim()) {
    return 'Informe o WhatsApp para contato.';
  }

  // Aceita fixo (10 dígitos) ou celular (11 dígitos, começando com 9)
  if (!/^\(\d{2}\) (?:\d{4}|9\d{4})-\d{4}$/.test(value)) {
    return 'Telefone inválido. Use o formato (34) 99999-9999.';
  }

  return null;
}

function maskCrp(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 9);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function validateCrp(value: string): string | null {
  if (!value.trim()) {
    return 'Informe o CRP do profissional.';
  }

  // Região com 2 dígitos + registro com 4 a 7 dígitos (ex.: 04/12345)
  if (!/^\d{2}\/\d{4,7}$/.test(value)) {
    return 'CRP inválido. Use o formato 00/00000.';
  }

  return null;
}

function formatDateLabel(value: string): string {
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : 'selecionado';
}
