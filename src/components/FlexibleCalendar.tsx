import React from 'react';
import { Calendar } from 'lucide-react';
import { FLEXIBLE_CALENDAR_PRICES } from '../data/deals';

interface FlexibleCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const FlexibleCalendar: React.FC<FlexibleCalendarProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  return (
    <section
      aria-label="Flexible Dates Fare Calendar"
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-[#0B1F3A] dark:text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <span>Flexible Dates Price Calendar (Dec 2026)</span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Select a departure date to preview lowest available round-trip fare ranges. Tuesdays &amp; Wednesdays show steepest savings.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
          <span className="font-medium text-emerald-700 dark:text-emerald-400">
            Lowest ($184–$198)
          </span>
          <span className="text-slate-400" aria-hidden="true">·</span>
          <span>Good ($212–$254)</span>
          <span className="text-slate-400" aria-hidden="true">·</span>
          <span className="text-amber-700 dark:text-amber-400">Peak ($312+)</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
        {FLEXIBLE_CALENDAR_PRICES.map((entry) => {
          const isSelected = selectedDate === entry.date;
          const tierStyles =
            entry.tier === 'cheapest'
              ? 'border-emerald-300 dark:border-emerald-700/70 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
              : entry.tier === 'peak'
              ? 'border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B1526] text-slate-800 dark:text-slate-200';

          return (
            <button
              key={entry.date}
              type="button"
              onClick={() => onSelectDate(isSelected ? '' : entry.date)}
              aria-pressed={isSelected}
              className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${tierStyles} ${
                isSelected ? 'ring-2 ring-sky-500 ring-offset-1 dark:ring-offset-[#0F1D32]' : 'hover:border-sky-400'
              }`}
            >
              <div className="text-xs font-medium opacity-80">{entry.dayLabel}</div>
              <div className="mt-1 text-base font-bold font-mono-tabular">
                ${entry.price}
              </div>
              <div className="mt-0.5 text-[11px] opacity-80">
                {entry.tier === 'cheapest'
                  ? 'Lowest'
                  : entry.tier === 'peak'
                  ? 'Peak'
                  : 'Standard'}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
