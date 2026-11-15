import { useMemo, useState } from 'react';
import { Navigation } from 'lucide-react';
import { PLACES, DAYS } from '../data/itineraryData.js';
import { distanceM, bearingDeg, cardinal, formatDistance, walkLabel } from '../lib/geo.js';
import { toMin } from '../lib/time.js';
import CategoryIcon from './CategoryIcon.jsx';

const RADIUS = [500, 1000, 2000, 5000];

/** Radar "ao meu redor": o próximo item de hoje e tudo o que está perto, por distância. */
export default function NearbyPanel({ gps, now, onSelectPlace, autoCheckin, onToggleAuto }) {
  const [radius, setRadius] = useState(1000);
  const [onlyMarkets, setOnlyMarkets] = useState(false);
  const today = DAYS.find((d) => d.date === now.date);

  const next = useMemo(() => {
    if (!today || !gps.pos) return null;
    const it = today.items.find((x) => toMin(x.time) >= now.minutes - 15 && x.priority !== 'LOGISTICS') ?? null;
    if (!it) return null;
    const p = PLACES[it.placeId];
    return { it, p, d: distanceM(gps.pos, p) };
  }, [today, gps.pos, now.minutes]);

  const list = useMemo(() => {
    if (!gps.pos) return [];
    return Object.entries(PLACES)
      .filter(([, p]) => p.lat != null && (!onlyMarkets || p.xmas))
      .map(([id, p]) => ({ id, p, d: distanceM(gps.pos, p), b: bearingDeg(gps.pos, p) }))
      .filter((x) => x.d <= radius)
      .sort((a, b) => a.d - b.d);
  }, [gps.pos, radius, onlyMarkets]);

  if (!gps.enabled || !gps.pos) {
    return (
      <div className="px-4 pb-8 pt-3">
        <h2 className="font-cond text-[24px] font-semibold leading-tight text-ink">Perto de mim</h2>
        <p className="mt-1 text-[14px] leading-snug text-ink/85">
          Mostra o que está ao seu redor, a distância até a próxima parada de hoje e faz o check-in sozinho quando vocês chegam a um local do roteiro.
        </p>
        {gps.error ? (
          <p className="mt-3 rounded-lg bg-warn-soft px-3 py-2 text-[13px] leading-snug text-warn">{gps.error}</p>
        ) : gps.enabled ? (
          <p className="mt-3 text-[14px] text-slate">Procurando sua posição…</p>
        ) : null}
        {!gps.enabled && (
          <button type="button" onClick={gps.start} className="mt-4 rounded-full bg-night px-4 py-2.5 text-[15px] font-semibold text-snow">Ativar localização</button>
        )}
        <p className="mt-3 text-[12px] leading-snug text-slate">A posição é usada só neste aparelho e não é enviada a ninguém.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-8 pt-3">
      {next && (
        <button type="button" onClick={() => onSelectPlace(next.it.placeId)} className="w-full rounded-xl bg-night px-4 py-3 text-left text-snow">
          <span className="text-[12px] text-snow/70">Próxima parada, às {next.it.time}</span>
          <span className="mt-0.5 block text-[17px] font-semibold leading-tight">{next.p.name}</span>
          <span className="mt-1 block font-cond text-[22px] font-semibold text-beeswax">{formatDistance(next.d)} · {walkLabel(next.d)}</span>
        </button>
      )}
      {!next && today && <p className="text-[14px] text-slate">Nenhuma parada restante hoje.</p>}

      <div className="mt-4 flex flex-wrap items-center gap-1.5" role="group" aria-label="Raio">
        {RADIUS.map((r) => (
          <button key={r} type="button" onClick={() => setRadius(r)} aria-pressed={radius === r}
            className={`rounded-full px-3 py-1 text-[13px] font-semibold ${radius === r ? 'bg-night text-snow' : 'bg-snow text-ink ring-1 ring-rule'}`}>
            {formatDistance(r)}
          </button>
        ))}
        <button type="button" onClick={() => setOnlyMarkets((v) => !v)} aria-pressed={onlyMarkets}
          className={`rounded-full px-3 py-1 text-[13px] font-semibold ${onlyMarkets ? 'bg-beeswax text-night' : 'bg-snow text-ink ring-1 ring-rule'}`}>
          Só feiras
        </button>
      </div>

      {list.length === 0 ? (
        <p className="mt-4 text-[14px] leading-snug text-slate">Nada do roteiro num raio de {formatDistance(radius)}. Aumente o raio acima.</p>
      ) : (
        <ul className="mt-2 divide-y divide-rule">
          {list.map(({ id, p, d, b }) => {
            const openToday = p.xmas?.onTrip?.[now.date];
            return (
              <li key={id}>
                <button type="button" onClick={() => onSelectPlace(id)} className="flex w-full items-center gap-3 py-2.5 text-left">
                  <CategoryIcon category={p.category} size={17} className="shrink-0 text-slate" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-ink">{p.name}</span>
                    <span className="block text-[13px] text-slate">
                      {walkLabel(d)}, para o {cardinal(b)}
                    </span>
                    {openToday && <span className="mt-0.5 inline-block rounded bg-beeswax-soft px-1.5 text-[12px] font-semibold text-[#7a5300]">Feira hoje: {openToday}</span>}
                  </span>
                  <span className="flex shrink-0 flex-col items-end">
                    <span className="font-cond tnum text-[18px] font-semibold text-ink">{formatDistance(d)}</span>
                    <Navigation size={14} className="text-slate" style={{ transform: `rotate(${b}deg)` }} aria-hidden="true" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-rule pt-3">
        <label htmlFor="auto-checkin" className="text-[14px] leading-snug text-ink">
          Check-in automático
          <span className="block text-[12px] text-slate">Marca a parada quando vocês chegam a menos de 60 m dela.</span>
        </label>
        <input id="auto-checkin" type="checkbox" checked={autoCheckin} onChange={onToggleAuto} className="h-5 w-5 accent-[var(--color-pine)]" />
      </div>
      <button type="button" onClick={gps.stop} className="mt-3 text-[13px] text-slate underline underline-offset-2">Desligar localização</button>
    </div>
  );
}
