/**
 * Rota a pé entre as paradas do dia, pelo OSRM do FOSSGIS (routing.openstreetmap.de, perfil a pé).
 * Uso leve: uma consulta por dia/cidade, guardada no aparelho. Sem internet, o mapa liga as paradas em linha reta.
 */
const ENDPOINT = 'https://routing.openstreetmap.de/routed-foot/route/v1/driving/';
const CACHE_PREFIX = 'europa26:route:';

export async function footRoute(points) {
  if (points.length < 2) return null;
  const coords = points.map((p) => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join(';');
  const key = CACHE_PREFIX + coords;
  try { const hit = localStorage.getItem(key); if (hit) return JSON.parse(hit); } catch { /* sem cache */ }
  const res = await fetch(`${ENDPOINT}${coords}?overview=full&geometries=geojson&steps=false`);
  if (!res.ok) throw new Error(`OSRM ${res.status}`);
  const json = await res.json();
  const r = json.routes?.[0];
  if (!r) throw new Error('Sem rota');
  const out = { distance: r.distance, duration: r.duration, line: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]) };
  try { localStorage.setItem(key, JSON.stringify(out)); } catch { /* cheio: segue sem guardar */ }
  return out;
}
