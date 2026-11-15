import { PLACES, CHRISTMAS_MARKETS } from '../data/itineraryData.js';
import { cityName } from '../lib/places.js';
import { ddmm } from '../lib/time.js';
import AlertBanner from './AlertBanner.jsx';
import Timeline from './Timeline.jsx';

export function daySummary(day) {
  const markets = CHRISTMAS_MARKETS.filter((m) => m.visits.includes(day.date)).length;
  const stops = day.items.filter((it) => it.priority !== 'LOGISTICS').length;
  const parts = [`${stops} ${stops === 1 ? 'parada' : 'paradas'}`];
  if (markets) parts.push(`${markets} ${markets === 1 ? 'feira de Natal' : 'feiras de Natal'}`);
  return parts.join(', ');
}

export function DayTitle({ day }) {
  const hotel = day.baseHotel ? PLACES[day.baseHotel]?.name : null;
  return (
    <div className="px-4 pt-2">
      <p className="text-[13px] text-slate">
        <span className="font-cond tnum text-[15px] font-semibold text-ink">{day.weekday} {ddmm(day.date)}</span>
        {' '}em {cityName(day.city)}{hotel ? `, dormindo no ${hotel}` : ''}
      </p>
      <h2 className="font-cond text-[26px] font-semibold leading-[1.1] text-ink">{day.title}</h2>
      <p className="text-[13px] text-slate">{daySummary(day)}</p>
    </div>
  );
}

export default function DayView({ day, ...rest }) {
  return (
    <div>
      <DayTitle day={day} />
      <AlertBanner>{day.holidayAlert}</AlertBanner>
      <Timeline day={day} {...rest} />
    </div>
  );
}
