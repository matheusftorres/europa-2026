import { PLACES, CHRISTMAS_MARKETS, CHRISTMAS_MARKETS_CLOSED } from '../data/itineraryData.js';
import { cityName } from '../lib/places.js';
import { ddmm } from '../lib/time.js';

export default function MarketsPanel({ today, onSelectPlace }) {
  const list = [...CHRISTMAS_MARKETS].sort((a, b) => (a.visits[0] ?? '9') .localeCompare(b.visits[0] ?? '9'));
  return (
    <div className="px-4 pb-8 pt-2">
      <p className="text-[14px] leading-snug text-slate">
        As feiras ficam mais bonitas depois que escurece, por volta das 16h. Toque numa feira para ver endereço, horários e fonte.
      </p>
      <ul className="mt-3 divide-y divide-rule">
        {list.map((m) => {
          const p = PLACES[m.placeId];
          const openToday = p.xmas.onTrip[today];
          return (
            <li key={m.placeId} className="py-3">
              <button type="button" onClick={() => onSelectPlace(m.placeId)} className="w-full text-left">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-[15px] font-semibold leading-tight text-ink">{p.xmas.event}</span>
                  <span className="shrink-0 text-[12px] text-slate">{cityName(p.city)}</span>
                </span>
                <span className="mt-0.5 block text-[13px] text-slate">{p.xmas.season}</span>
                {openToday && <span className="mt-1 inline-block rounded bg-beeswax px-1.5 py-0.5 text-[12px] font-semibold text-night">Hoje: {openToday}</span>}
                <span className="mt-1.5 flex flex-wrap gap-1.5">
                  {m.visits.length === 0 && <span className="rounded bg-frost px-1.5 py-0.5 text-[13px] ring-1 ring-rule">Opcional, fora do roteiro</span>}
                  {m.visits.map((d) => (
                    <span key={d} className="rounded bg-beeswax-soft px-1.5 py-0.5 text-[13px] text-ink">
                      <span className="font-cond tnum font-semibold">{ddmm(d)}</span> {p.xmas.onTrip[d]}
                    </span>
                  ))}
                </span>
                {p.verify && <span className="mt-1.5 block text-[12px] leading-snug text-warn">A confirmar: {p.verify}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <h3 className="mt-5 font-cond text-[20px] font-semibold text-ink">Fechadas quando passaremos</h3>
      <ul className="mt-1 divide-y divide-rule text-[14px]">
        {CHRISTMAS_MARKETS_CLOSED.map((c) => (
          <li key={c.name} className="flex items-baseline justify-between gap-3 py-2">
            <span className="text-ink">{c.name} <span className="text-slate">({cityName(c.city)})</span></span>
            <span className="shrink-0 text-[13px] text-slate">{/^só/.test(c.closes) ? c.closes : `até ${c.closes}`}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
