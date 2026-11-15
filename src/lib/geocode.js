/**
 * Reserva via Nominatim (OpenStreetMap) para locais sem coordenada no arquivo de dados
 * (por exemplo, um local novo acrescentado às pressas). Respeita 1 consulta por segundo e guarda o resultado.
 */
const CACHE_PREFIX = 'europa26:geo:';
let last = 0;

export async function geocode(query) {
  const key = CACHE_PREFIX + query;
  try { const hit = localStorage.getItem(key); if (hit) return JSON.parse(hit); } catch { /* sem cache */ }
  const wait = Math.max(0, last + 1100 - Date.now());
  if (wait) await new Promise((r) => setTimeout(r, wait));
  last = Date.now();
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=pt&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const [hit] = await res.json();
  const out = hit ? { lat: Number(hit.lat), lng: Number(hit.lon) } : null;
  try { if (out) localStorage.setItem(key, JSON.stringify(out)); } catch { /* sem cache */ }
  return out;
}
