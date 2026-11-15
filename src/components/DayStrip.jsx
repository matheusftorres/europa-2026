import { useEffect, useRef } from 'react';
import { DAYS, CHRISTMAS_MARKETS } from '../data/itineraryData.js';
import { ddmm } from '../lib/time.js';
import { cityName } from '../lib/places.js';

const marketDays = new Set(CHRISTMAS_MARKETS.flatMap((m) => m.visits));

/** Faixa de dias, rolável na horizontal. O ponto dourado marca dia com feira de Natal. */
export default function DayStrip({ selected, onSelect, today, dark = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current?.querySelector('[aria-current="date"]') || ref.current?.querySelector('[aria-pressed="true"]');
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [selected]);

  return (
    <div ref={ref} className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 py-2" role="group" aria-label="Dias da viagem">
      {DAYS.map((d, i) => {
        const on = i === selected;
        const isToday = d.date === today;
        return (
          <button
            key={d.date}
            type="button"
            onClick={() => onSelect(i)}
            aria-pressed={on}
            aria-current={isToday ? 'date' : undefined}
            className={[
              'relative flex min-w-[58px] shrink-0 flex-col items-start rounded-xl px-2.5 py-1.5 text-left transition-colors',
              on ? 'bg-night text-snow' : dark ? 'bg-night-2/70 text-snow/80 hover:bg-night-2' : 'bg-snow text-ink hover:bg-rule/50',
            ].join(' ')}
          >
            <span className={`text-[11px] leading-none ${on ? 'text-beeswax' : dark ? 'text-snow/60' : 'text-slate'}`}>
              {d.weekday}{isToday ? ', hoje' : ''}
            </span>
            <span className="font-cond tnum text-[19px] font-semibold leading-tight">{ddmm(d.date)}</span>
            <span className={`max-w-[84px] truncate text-[11px] leading-none ${on ? 'text-snow/75' : dark ? 'text-snow/55' : 'text-slate'}`}>
              {cityName(d.city)}
            </span>
            {marketDays.has(d.date) && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-beeswax" aria-label="tem feira de Natal" />
            )}
          </button>
        );
      })}
    </div>
  );
}
