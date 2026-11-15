import { useState } from 'react';
import { Check, ChevronDown, Camera, TrainFront } from 'lucide-react';
import { PLACES, TRAINS } from '../data/itineraryData.js';
import { PRIORITY, parseItem, itemKey } from '../lib/places.js';
import { durationLabel, toMin } from '../lib/time.js';
import { distanceM, formatDistance } from '../lib/geo.js';
import CategoryIcon from './CategoryIcon.jsx';

/** O nó da "linha do trem": a forma diz a prioridade; dourado é feira de Natal. */
function Node({ priority, market, done }) {
  if (done) return <span className="grid h-5 w-5 place-items-center rounded-full bg-pine text-snow"><Check size={12} strokeWidth={3} /></span>;
  if (market) return <span className="h-5 w-5 rounded-full border-[3px] border-beeswax bg-night shadow-[0_0_0_3px_var(--color-beeswax-soft)]" />;
  if (priority === 'MUST-SEE') return <span className="h-4 w-4 rounded-full bg-wine" />;
  if (priority === 'NICE-TO-HAVE') return <span className="h-4 w-4 rounded-full border-2 border-slate bg-frost" />;
  if (priority === 'PHOTO-OP') return <span className="grid h-4 w-4 place-items-center rounded-full bg-frost text-slate"><Camera size={11} strokeWidth={2} /></span>;
  if (priority === 'FOOD') return <span className="h-3.5 w-3.5 rotate-45 rounded-[3px] bg-slate" />;
  return <span className="h-3 w-3 rounded-[3px] bg-rule ring-2 ring-frost" />;
}

function TrainLegs({ train }) {
  return (
    <div className="mt-2 rounded-lg bg-snow px-3 py-2 text-[13px]">
      <p className="text-slate">{train.operator}{train.booking ? `, ${train.booking}` : ''}</p>
      <ol className="mt-1.5 space-y-1.5">
        {train.legs.map((l, i) => (
          <li key={i} className="grid grid-cols-[auto_1fr] gap-x-2">
            <span className="font-cond tnum text-[15px] font-semibold">{l.dep}–{l.arr}</span>
            <span><strong className="font-semibold">{l.train}</strong> {l.from} → {l.to}{l.seats ? `. ${l.seats}` : ''}{l.note ? `. ${l.note}` : ''}</span>
          </li>
        ))}
      </ol>
      <p className="mt-1.5 text-slate">{train.price}. {train.notes}</p>
    </div>
  );
}

export default function Timeline({ day, isToday, nowMinutes, selectedPlaceId, onSelectPlace, checkins, onToggleCheckin, userPos }) {
  const [openTrain, setOpenTrain] = useState(null);
  // Item "em andamento" ou o próximo, só no dia de hoje.
  let currentIdx = -1;
  if (isToday) {
    currentIdx = day.items.findIndex((it, i) => {
      const start = toMin(it.time);
      const next = day.items[i + 1] ? toMin(day.items[i + 1].time) : 24 * 60;
      return nowMinutes < next && (nowMinutes >= start || i === 0);
    });
  }

  return (
    <ol className="relative px-4 pb-6 pt-2">
      <span className="absolute bottom-6 left-[89px] top-5 w-[2px] bg-rule" aria-hidden="true" />
      {day.items.map((it, i) => {
        const place = PLACES[it.placeId];
        const { text, market, optional } = parseItem(it);
        const key = itemKey(day.date, it);
        const done = Boolean(checkins[key]);
        const selected = selectedPlaceId === it.placeId;
        const train = it.trainId ? TRAINS.find((t) => t.id === it.trainId) : null;
        const isNow = i === currentIdx;
        return (
          <li key={key} className="relative grid grid-cols-[56px_28px_1fr] gap-x-1 py-2">
            <div className="pt-[1px] text-right">
              <span className={`font-cond tnum text-[22px] font-semibold leading-none ${optional ? 'text-slate' : 'text-ink'}`}>{it.time}</span>
              {isNow && <span className="mt-1 block text-[11px] font-semibold text-wine">agora</span>}
            </div>
            <div className="relative z-10 flex justify-center pt-0.5"><Node priority={it.priority} market={market} done={done} /></div>
            <div className={`min-w-0 rounded-lg px-2 py-1 -my-1 ${selected ? 'bg-snow ring-1 ring-night-3/30' : ''} ${optional ? 'opacity-90' : ''}`}>
              <div className="flex items-start gap-2">
                <button type="button" onClick={() => onSelectPlace(it.placeId)} className="min-w-0 flex-1 text-left">
                  <span className="flex items-center gap-1.5 text-[15px] font-semibold leading-tight text-ink">
                    <CategoryIcon category={place?.category} size={15} className="shrink-0 text-slate" />
                    <span className="truncate">{place?.name ?? it.placeId}</span>
                  </span>
                  <span className="mt-0.5 block text-[14px] leading-snug text-ink/85">{text}</span>
                </button>
                {it.priority !== 'LOGISTICS' && (
                  <button
                    type="button"
                    onClick={() => onToggleCheckin(key)}
                    aria-pressed={done}
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold transition-colors ${done ? 'bg-pine-soft text-pine' : 'bg-frost text-slate ring-1 ring-rule hover:text-ink'}`}
                  >
                    {done ? 'Feito' : 'Check-in'}
                  </button>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-slate">
                {market && <span className="rounded bg-beeswax-soft px-1.5 py-0.5 font-semibold text-[#7a5300]">Feira de Natal</span>}
                {optional && <span className="rounded bg-frost px-1.5 py-0.5 ring-1 ring-rule">Opcional</span>}
                <span>{PRIORITY[it.priority]?.label}</span>
                {durationLabel(it.durationMin) && <span>{durationLabel(it.durationMin)}</span>}
                {isToday && userPos && place && !done && distanceM(userPos, place) < 15000 && (
                  <span className="font-semibold text-night-3">a {formatDistance(distanceM(userPos, place))}</span>
                )}
                {checkins[key]?.auto && <span className="text-pine">check-in automático</span>}
                {train && (
                  <button type="button" onClick={() => setOpenTrain(openTrain === key ? null : key)} aria-expanded={openTrain === key}
                    className="inline-flex items-center gap-1 rounded bg-night px-1.5 py-0.5 font-semibold text-snow">
                    <TrainFront size={12} /> Trem <ChevronDown size={12} className={openTrain === key ? 'rotate-180' : ''} />
                  </button>
                )}
              </div>
              {it.verify && <p className="mt-1.5 rounded bg-warn-soft px-2 py-1 text-[12px] leading-snug text-warn">A confirmar: {it.verify}</p>}
              {train && openTrain === key && <TrainLegs train={train} />}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
