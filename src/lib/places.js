import { PLACES, DAYS, CITIES } from '../data/itineraryData.js';

export const PRIORITY = {
  'MUST-SEE': { label: 'Imperdível' },
  'NICE-TO-HAVE': { label: 'Se der tempo' },
  'PHOTO-OP': { label: 'Foto rápida' },
  LOGISTICS: { label: 'Logística' },
  FOOD: { label: 'Comida' },
};

export const PURCHASE_STATUS = {
  pendente: { label: 'Pendente', order: 0 },
  'reservado-pagar-depois': { label: 'Reservado, pagar depois', order: 1 },
  'comprar-no-dia': { label: 'Comprar no dia', order: 2 },
  comprado: { label: 'Comprado', order: 3 },
};

const PREFIXES = [
  { re: /^FEIRA DE NATAL:\s*/, flag: 'market' },
  { re: /^NATAL NO CASTELO:\s*/, flag: 'market' },
  { re: /^OPCIONAL:\s*/, flag: 'optional' },
];

/** Separa os marcadores do texto ("FEIRA DE NATAL:", "OPCIONAL:") e devolve o texto limpo. */
export function parseItem(item) {
  let text = item.description || '';
  const flags = { market: false, optional: false };
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of PREFIXES) if (p.re.test(text)) { text = text.replace(p.re, ''); flags[p.flag] = true; changed = true; }
  }
  if (item.priority === 'NICE-TO-HAVE' && /opcional/i.test(item.description)) flags.optional = true;
  return { text: text.charAt(0).toUpperCase() + text.slice(1), ...flags };
}

export const itemKey = (date, item) => `${date}|${item.time}|${item.placeId}`;

export function mapsLinks(p) {
  const q = encodeURIComponent(p.name);
  return {
    apple: `https://maps.apple.com/?q=${q}&ll=${p.lat},${p.lng}`,
    google: `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`,
    osm: `https://www.openstreetmap.org/${p.osm}`,
  };
}

/** Em quais dias e horários um local aparece no roteiro. */
export function visitsOf(placeId) {
  const out = [];
  for (const d of DAYS) for (const it of d.items) if (it.placeId === placeId) out.push({ date: d.date, time: it.time });
  return out;
}

export const cityName = (id) => CITIES[id]?.name ?? id;
export const placeOf = (id) => PLACES[id];
