import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '../../../utils/cn';
import { getTodayInSaoPaulo } from '../../../utils/formatDate';

interface AgendaCalendarProps {
  selectedDate: string;
  highlightedDates?: Record<string, number>;
  onSelectDate: (date: string) => void;
}

const weekDayLabels = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export function AgendaCalendar({ selectedDate, highlightedDates = {}, onSelectDate }: AgendaCalendarProps) {
  const today = getTodayInSaoPaulo();
  const [view, setView] = useState(() => toMonthView(selectedDate || today));

  const days = useMemo(() => buildMonthDays(view.year, view.month), [view]);
  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(view.year, view.month - 1, 1)),
    [view],
  );

  const todayView = toMonthView(today);
  const canGoPrevious = view.year > todayView.year || (view.year === todayView.year && view.month > todayView.month);

  function goPrevious() {
    if (!canGoPrevious) {
      return;
    }

    setView((current) => (current.month === 1 ? { year: current.year - 1, month: 12 } : { ...current, month: current.month - 1 }));
  }

  function goNext() {
    setView((current) => (current.month === 12 ? { year: current.year + 1, month: 1 } : { ...current, month: current.month + 1 }));
  }

  return (
    <div className="rounded-xl border border-brand-blue/15 bg-white p-3 dark:border-white/10 dark:bg-night-card">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={goPrevious}
          disabled={!canGoPrevious}
          aria-label="Mês anterior"
          className="grid h-8 w-8 place-items-center rounded-full border border-brand-blue/15 bg-brand-soft text-brand-blue transition hover:bg-brand-bg disabled:cursor-not-allowed disabled:opacity-35 dark:border-white/10 dark:bg-night-soft dark:text-brand-sky dark:hover:bg-white/10"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="font-display text-sm font-semibold capitalize text-ink dark:text-white">{monthLabel}</span>
        <button
          type="button"
          onClick={goNext}
          aria-label="Próximo mês"
          className="grid h-8 w-8 place-items-center rounded-full border border-brand-blue/15 bg-brand-soft text-brand-blue transition hover:bg-brand-bg dark:border-white/10 dark:bg-night-soft dark:text-brand-sky dark:hover:bg-white/10"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDayLabels.map((label) => (
          <span key={label} className="py-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {label}
          </span>
        ))}
        {days.map((day, index) => {
          if (day === null) {
            return <span key={`empty-${index}`} aria-hidden="true" />;
          }

          const disabled = day < today;
          const selected = day === selectedDate;
          const isToday = day === today;
          const selectedCount = highlightedDates[day] ?? 0;
          const highlighted = selectedCount > 0;

          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(day)}
              aria-pressed={selected}
              aria-label={`Selecionar dia ${day.slice(8, 10)}`}
              className={cn(
                'relative grid h-9 place-items-center rounded-lg text-xs font-bold transition',
                selected && 'bg-brand-blue text-white shadow-brand',
                !selected && highlighted && !disabled && 'bg-white text-brand-blue ring-2 ring-inset ring-brand-yellow shadow-[0_0_0_3px_rgba(250,204,21,0.22)] dark:bg-night-card dark:text-brand-sky',
                !selected && !highlighted && !disabled && 'text-brand-blue hover:bg-brand-soft dark:text-brand-sky dark:hover:bg-night-soft',
                !selected && isToday && 'ring-1 ring-inset ring-brand-yellow',
                selected && highlighted && 'ring-2 ring-inset ring-brand-yellow',
                disabled && 'cursor-not-allowed text-slate-300 dark:text-slate-600',
              )}
            >
              <span>{Number(day.slice(8, 10))}</span>
              {highlighted ? (
                <span className={cn('absolute right-0.5 top-0.5 grid h-3.5 min-w-3.5 place-items-center rounded-full px-0.5 text-[9px] leading-none', selected ? 'bg-brand-yellow text-ink' : 'bg-brand-blue text-white dark:bg-brand-sky dark:text-ink')}>
                  {selectedCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function buildMonthDays(year: number, month: number): Array<string | null> {
  const firstWeekDay = new Date(year, month - 1, 1).getDay();
  const totalDays = new Date(year, month, 0).getDate();
  const days: Array<string | null> = Array.from({ length: firstWeekDay }, () => null);

  for (let day = 1; day <= totalDays; day += 1) {
    days.push(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  }

  return days;
}

function toMonthView(date: string): { year: number; month: number } {
  const [year, month] = date.split('-').map(Number);
  const fallback = new Date();

  return {
    year: year || fallback.getFullYear(),
    month: month || fallback.getMonth() + 1,
  };
}
