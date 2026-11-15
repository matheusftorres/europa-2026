const R = 6371000;
const rad = (d) => (d * Math.PI) / 180;

export function distanceM(a, b) {
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function bearingDeg(a, b) {
  const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat));
  const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

const DIRS = ['norte', 'nordeste', 'leste', 'sudeste', 'sul', 'sudoeste', 'oeste', 'noroeste'];
export const cardinal = (deg) => DIRS[Math.round(deg / 45) % 8];

export function formatDistance(m) {
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  return `${(m / 1000).toFixed(m < 10000 ? 1 : 0).replace('.', ',')} km`;
}

/** Caminhada a 4,5 km/h, arredondada para 5 min. */
export function walkLabel(m) {
  const min = Math.max(1, Math.round((m / 4500) * 60));
  if (min < 60) return `${min < 10 ? min : Math.round(min / 5) * 5} min a pé`;
  const h = Math.floor(min / 60), r = Math.round((min % 60) / 5) * 5;
  return r ? `${h}h${String(r).padStart(2, '0')} a pé` : `${h}h a pé`;
}
