import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Polyline, Circle, CircleMarker, useMap } from 'react-leaflet';
import { LocateFixed, Moon, Sun, Layers } from 'lucide-react';
import { PLACES } from '../data/itineraryData.js';
import { cityName, parseItem } from '../lib/places.js';
import { footRoute } from '../lib/routing.js';
import { formatDistance } from '../lib/geo.js';

const TILES = {
  night: { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', label: 'Mapa claro' },
  day: { url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', label: 'Mapa escuro' },
};
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

function pinIcon({ n, market, selected, optional, dim }) {
  const size = selected ? 34 : 26;
  const cls = ['pin', market ? 'pin--market' : '', selected ? 'pin--on' : '', optional ? 'pin--opt' : '', dim ? 'pin--dim' : ''].join(' ');
  return L.divIcon({ className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2], html: `<span class="${cls}" style="width:${size}px;height:${size}px">${n ?? ''}</span>` });
}

/** Enquadra a cidade do dia e acompanha a seleção, respeitando o espaço ocupado pelos painéis. */
function Camera({ points, selected, pad, follow, user }) {
  const map = useMap();
  const key = points.map((p) => `${p.lat},${p.lng}`).join('|');
  useEffect(() => {
    if (!points.length) return;
    const b = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(b, { paddingTopLeft: [pad.left, pad.top], paddingBottomRight: [pad.right, pad.bottom], maxZoom: 16, animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, pad.top, pad.bottom, pad.left, pad.right]);
  useEffect(() => {
    if (selected) map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 16), { duration: 0.6 });
  }, [selected, map]);
  useEffect(() => {
    if (follow && user) map.panTo([user.lat, user.lng], { animate: true });
  }, [follow, user, map]);
  return null;
}

export default function MapView({ day, selectedPlaceId, onSelectPlace, gps, insetTop = 0, insetBottom = 0, insetLeft = 0 }) {
  const [style, setStyle] = useState(() => { try { return localStorage.getItem('europa26:mapstyle') || 'night'; } catch { return 'night'; } });
  const [showAll, setShowAll] = useState(false);
  const [follow, setFollow] = useState(false);
  const [route, setRoute] = useState(null);
  const [routeState, setRouteState] = useState('idle');
  useEffect(() => { try { localStorage.setItem('europa26:mapstyle', style); } catch { /* ok */ } }, [style]);

  const cities = useMemo(() => [...new Set(day.items.map((it) => PLACES[it.placeId]?.city).filter(Boolean))], [day]);
  const defaultCity = useMemo(() => {
    const first = day.items.find((it) => it.priority !== 'LOGISTICS');
    return (first && PLACES[first.placeId]?.city) || day.city;
  }, [day]);
  const [city, setCity] = useState(defaultCity);
  useEffect(() => {
    const sel = PLACES[selectedPlaceId];
    setCity(sel && cities.includes(sel.city) ? sel.city : cities.includes(defaultCity) ? defaultCity : cities[0]);
  }, [day, selectedPlaceId, cities, defaultCity]);

  const stops = useMemo(() => {
    const seen = new Map();
    day.items.forEach((it) => {
      const p = PLACES[it.placeId];
      if (!p || p.city !== city || p.lat == null) return;
      const { market, optional } = parseItem(it);
      if (!seen.has(it.placeId)) seen.set(it.placeId, { id: it.placeId, p, n: seen.size + 1, market: market || p.category === 'christmas-market', optional, logistics: true });
      if (it.priority !== 'LOGISTICS') seen.get(it.placeId).logistics = false;
    });
    return [...seen.values()];
  }, [day, city]);

  // Rota a pé: só os passeios (sem hotel, estação e aeroporto), na ordem do roteiro.
  const walkPts = useMemo(() => {
    const out = [];
    day.items.forEach((it) => {
      const p = PLACES[it.placeId];
      if (!p || p.city !== city || it.priority === 'LOGISTICS') return;
      const last = out[out.length - 1];
      if (!last || last.id !== it.placeId) out.push({ id: it.placeId, lat: p.lat, lng: p.lng });
    });
    return out;
  }, [day, city]);

  useEffect(() => {
    let alive = true;
    setRoute(null);
    if (walkPts.length < 2) { setRouteState('idle'); return undefined; }
    setRouteState('loading');
    footRoute(walkPts).then((r) => { if (alive) { setRoute(r); setRouteState('ok'); } }).catch(() => { if (alive) setRouteState('offline'); });
    return () => { alive = false; };
  }, [walkPts]);

  const framePts = (() => { const core = stops.filter((s) => !s.logistics); return (core.length >= 2 ? core : stops).map((s) => s.p); })();
  const selected = PLACES[selectedPlaceId];
  const others = showAll ? Object.entries(PLACES).filter(([id, p]) => p.city === city && !stops.find((s) => s.id === id)) : [];
  const pad = { top: insetTop + 56, bottom: insetBottom + 24, left: insetLeft + 32, right: 32 };

  return (
    <div className={`map-shell relative h-full w-full ${style === 'night' ? 'map-night' : 'map-day'}`}>
      <MapContainer center={[framePts[0]?.lat ?? 48.2, framePts[0]?.lng ?? 16.37]} zoom={14} zoomControl={false} className="h-full w-full" attributionControl={false}>
        <TileLayer key={style} url={TILES[style].url} attribution={ATTRIBUTION} subdomains="abcd" maxZoom={20} />
        <Camera points={framePts} selected={selected && selected.city === city ? selected : null} pad={pad} follow={follow} user={gps.pos} />
        {route ? (
          <Polyline positions={route.line} pathOptions={{ color: style === 'night' ? '#e3a72f' : '#8e2c3a', weight: 4, opacity: 0.75 }} />
        ) : walkPts.length > 1 && (
          <Polyline positions={walkPts.map((p) => [p.lat, p.lng])} pathOptions={{ color: '#8a96b8', weight: 2, dashArray: '4 8', opacity: 0.8 }} />
        )}
        {others.map(([id, p]) => (
          <Marker key={id} position={[p.lat, p.lng]} icon={pinIcon({ n: '', dim: true, market: p.category === 'christmas-market' })} eventHandlers={{ click: () => onSelectPlace(id) }} title={p.name} />
        ))}
        {stops.map((s) => (
          <Marker key={s.id} position={[s.p.lat, s.p.lng]} zIndexOffset={s.id === selectedPlaceId ? 1000 : s.market ? 500 : 0}
            icon={pinIcon({ n: s.n, market: s.market, selected: s.id === selectedPlaceId, optional: s.optional })}
            eventHandlers={{ click: () => onSelectPlace(s.id) }} title={`${s.n}. ${s.p.name}`} keyboard />
        ))}
        {gps.pos && (
          <>
            <Circle center={[gps.pos.lat, gps.pos.lng]} radius={gps.pos.accuracy} pathOptions={{ color: '#4c8dff', weight: 1, fillOpacity: 0.12 }} />
            <CircleMarker center={[gps.pos.lat, gps.pos.lng]} radius={7} pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#2f7bff', fillOpacity: 1 }} />
          </>
        )}
      </MapContainer>

      {/* Controles */}
      <div className="pointer-events-none absolute inset-x-0 z-[500] flex items-start justify-between gap-2 px-3" style={{ top: insetTop + 10, left: insetLeft }}>
        <div className="pointer-events-auto flex flex-wrap gap-1.5">
          {cities.length > 1 && cities.map((c) => (
            <button key={c} type="button" onClick={() => setCity(c)} aria-pressed={c === city}
              className={`rounded-full px-3 py-1.5 text-[13px] font-semibold shadow ${c === city ? 'bg-beeswax text-night' : 'bg-night-2 text-snow'}`}>{cityName(c)}</button>
          ))}
          {routeState === 'ok' && route && (
            <span className="rounded-full bg-night/85 px-3 py-1.5 text-[13px] text-snow shadow">Percurso a pé: {formatDistance(route.distance)}</span>
          )}
          {routeState === 'offline' && <span className="rounded-full bg-night/85 px-3 py-1.5 text-[13px] text-snow/80 shadow">Sem rota agora: paradas ligadas em linha reta</span>}
        </div>
        <div className="pointer-events-auto flex flex-col gap-1.5">
          <button type="button" onClick={() => { if (!gps.enabled) gps.start(); setFollow((f) => !gps.enabled || !f); }} aria-pressed={follow}
            className={`grid h-10 w-10 place-items-center rounded-full shadow ${follow && gps.enabled ? 'bg-[#2f7bff] text-snow' : 'bg-snow text-ink'}`}
            aria-label={gps.enabled ? (follow ? 'Parar de seguir minha posição' : 'Seguir minha posição') : 'Mostrar minha localização'}>
            <LocateFixed size={19} />
          </button>
          <button type="button" onClick={() => setStyle(style === 'night' ? 'day' : 'night')} className="grid h-10 w-10 place-items-center rounded-full bg-snow text-ink shadow" aria-label={TILES[style].label}>
            {style === 'night' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button type="button" onClick={() => setShowAll((v) => !v)} aria-pressed={showAll}
            className={`grid h-10 w-10 place-items-center rounded-full shadow ${showAll ? 'bg-night text-beeswax' : 'bg-snow text-ink'}`} aria-label="Mostrar todos os locais da cidade">
            <Layers size={18} />
          </button>
        </div>
      </div>
      <p className="absolute right-2 z-[500] rounded bg-snow/80 px-1.5 py-0.5 text-[10px] text-ink" style={{ bottom: insetBottom + 6 }}>
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">OpenStreetMap</a>
        {' '}© <a href="https://carto.com/attributions" target="_blank" rel="noreferrer" className="underline">CARTO</a>
        {routeState === 'ok' ? <> · rota <a href="https://routing.openstreetmap.de/about.html" target="_blank" rel="noreferrer" className="underline">FOSSGIS OSRM</a></> : null}
      </p>
      {gps.error && (
        <p className="absolute left-3 right-16 z-[500] rounded-lg bg-snow px-3 py-2 text-[13px] leading-snug text-ink shadow" style={{ top: insetTop + 58 }}>{gps.error}</p>
      )}
    </div>
  );
}
