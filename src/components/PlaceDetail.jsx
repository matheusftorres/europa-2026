import { X, ExternalLink } from 'lucide-react';
import { PLACES } from '../data/itineraryData.js';
import { mapsLinks, visitsOf, cityName } from '../lib/places.js';
import { ddmm } from '../lib/time.js';
import CategoryIcon from './CategoryIcon.jsx';

function Row({ label, children }) {
  if (!children) return null;
  return (
    <div className="grid grid-cols-[84px_1fr] gap-x-3 py-1.5 text-[14px] leading-snug">
      <dt className="text-slate">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}

export default function PlaceDetail({ placeId, onClose, onGoToDay }) {
  const p = PLACES[placeId];
  if (!p) return null;
  const links = mapsLinks(p);
  const visits = visitsOf(placeId);
  return (
    <article className="px-4 pb-6 pt-1" aria-label={p.name}>
      <header className="flex items-start gap-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-night text-beeswax">
          <CategoryIcon category={p.category} size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-cond text-[24px] font-semibold leading-tight text-ink">{p.name}</h2>
          <p className="text-[13px] text-slate">{cityName(p.city)}</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-full p-1.5 text-slate hover:bg-rule/60 hover:text-ink" aria-label="Fechar detalhes">
          <X size={20} />
        </button>
      </header>

      {p.xmas && (
        <section className="mt-3 border-l-[3px] border-beeswax bg-beeswax-soft/60 px-3 py-2.5 text-[14px] leading-snug">
          <h3 className="font-semibold text-ink">{p.xmas.event}</h3>
          <p className="mt-0.5 text-ink/85">Temporada: {p.xmas.season}</p>
          <p className="mt-0.5 text-ink/85">{p.xmas.hours}</p>
          {Object.keys(p.xmas.onTrip).length > 0 && (
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {Object.entries(p.xmas.onTrip).map(([d, h]) => (
                <li key={d} className="rounded bg-snow px-1.5 py-0.5 text-[13px]"><span className="font-cond tnum font-semibold">{ddmm(d)}</span> {h}</li>
              ))}
            </ul>
          )}
          <a className="mt-1.5 inline-flex items-center gap-1 text-[13px] text-slate underline underline-offset-2" href={p.xmas.source} target="_blank" rel="noreferrer">
            Fonte oficial <ExternalLink size={12} />
          </a>
        </section>
      )}

      <dl className="mt-3 divide-y divide-rule">
        <Row label="Endereço">{p.address}</Row>
        <Row label="Horário">{p.hours}</Row>
        <Row label="Preço">{p.price}</Row>
        <Row label="Notas">{p.notes}</Row>
        <Row label="No roteiro">
          {visits.length > 0 && (
            <span className="flex flex-wrap gap-1.5">
              {visits.map((v) => (
                <button key={`${v.date}${v.time}`} type="button" onClick={() => onGoToDay?.(v.date)} className="rounded bg-frost px-1.5 py-0.5 ring-1 ring-rule hover:bg-rule/50">
                  <span className="font-cond tnum font-semibold">{ddmm(v.date)}</span> às {v.time}
                </button>
              ))}
            </span>
          )}
        </Row>
      </dl>

      {p.verify && <p className="mt-3 rounded-lg bg-warn-soft px-3 py-2 text-[13px] leading-snug text-warn">A confirmar: {p.verify}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <a href={links.apple} target="_blank" rel="noreferrer" className="rounded-full bg-night px-3.5 py-2 text-[14px] font-semibold text-snow hover:bg-night-2">Abrir no Apple Mapas</a>
        <a href={links.google} target="_blank" rel="noreferrer" className="rounded-full bg-snow px-3.5 py-2 text-[14px] font-semibold text-ink ring-1 ring-rule hover:bg-rule/40">Abrir no Google Maps</a>
        <a href={links.osm} target="_blank" rel="noreferrer" className="rounded-full px-3 py-2 text-[13px] text-slate underline underline-offset-2">Ver no OpenStreetMap</a>
      </div>
    </article>
  );
}
