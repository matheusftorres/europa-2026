import { PLACES, DAYS, CITIES, TRAINS, PURCHASES, FOOD, CATEGORIES, CHRISTMAS_MARKETS, CHECKLIST } from '../private/itineraryData.full.js';

const R = 6371000;
const rad = (d) => (d * Math.PI) / 180;
const dist = (a, b) => {
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

let errors = 0, warns = 0;
const err = (m) => { errors++; console.log('ERRO  ', m); };
const warn = (m) => { warns++; console.log('AVISO ', m); };

// 1. Campos obrigatórios e precisão das coordenadas
const maxRadius = { paris: 26000, munique: 9000, praga: 7000, 'kutna-hora': 4000, viena: 8000, salzburgo: 3000 };
const allowFar = new Set(['muc-aeroporto', 'bmw-museum']);
for (const [id, p] of Object.entries(PLACES)) {
  for (const f of ['name', 'city', 'category', 'address', 'lat', 'lng', 'osm', 'geocodeQuery'])
    if (p[f] === undefined || p[f] === null || p[f] === '') err(`${id}: campo ${f} ausente`);
  if (!CITIES[p.city]) err(`${id}: cidade desconhecida ${p.city}`);
  if (!/^(node|way|relation)\/\d+$/.test(p.osm)) err(`${id}: referência OSM inválida (${p.osm})`);
  const d = dist(p, CITIES[p.city].center);
  if (d > maxRadius[p.city] && !allowFar.has(id)) err(`${id}: ${Math.round(d)} m do centro de ${p.city} (suspeito)`);
}

// 2. Duplicidade de coordenadas entre locais diferentes
const seen = new Map();
for (const [id, p] of Object.entries(PLACES)) {
  const k = `${p.lat},${p.lng}`;
  if (seen.has(k)) warn(`${id} e ${seen.get(k)} têm a mesma coordenada`);
  seen.set(k, id);
}

// 3. Roteiro: referências, ordem dos horários e saltos entre itens
const used = new Set();
for (const day of DAYS) {
  let prev = null, prevTime = '00:00';
  for (const it of day.items) {
    const p = PLACES[it.placeId];
    if (!p) { err(`${day.date} ${it.time}: placeId inexistente ${it.placeId}`); continue; }
    used.add(it.placeId);
    if (!['MUST-SEE', 'NICE-TO-HAVE', 'PHOTO-OP', 'LOGISTICS', 'FOOD'].includes(it.priority)) err(`${day.date} ${it.time}: prioridade inválida`);
    if (it.time < prevTime) err(`${day.date}: horário fora de ordem (${prevTime} → ${it.time})`);
    if (it.trainId && !TRAINS.find((t) => t.id === it.trainId)) err(`${day.date}: trainId inexistente ${it.trainId}`);
    if (prev && prev.city === p.city && it.priority !== 'LOGISTICS') {
      const d = dist(prev, p);
      if (d > 3500) warn(`${day.date} ${it.time}: salto de ${(d / 1000).toFixed(1)} km desde o item anterior (${it.placeId}) — conferir transporte`);
    }
    prev = p; prevTime = it.time;
  }
}
for (const id of Object.keys(PLACES)) if (!used.has(id)) {
  const inFood = Object.values(FOOD).some((f) => f.places.includes(id));
  if (!inFood) warn(`${id} não aparece no roteiro nem na gastronomia (só no mapa)`);
}
for (const t of TRAINS) for (const k of ['from', 'to']) if (!PLACES[t[k]]) err(`trem ${t.id}: ${k} inexistente`);
for (const c of PURCHASES) if (c.placeId && !PLACES[c.placeId]) err(`compra ${c.id}: placeId inexistente`);
for (const [city, f] of Object.entries(FOOD)) for (const id of f.places) if (!PLACES[id]) err(`gastronomia ${city}: ${id} inexistente`);

// 4. Feiras de Natal
for (const [id, p] of Object.entries(PLACES)) {
  if (!CATEGORIES[p.category]) err(`${id}: categoria desconhecida ${p.category}`);
  if (p.category === 'christmas-market' && !p.xmas) err(`${id}: feira sem objeto xmas`);
  if (p.xmas) for (const f of ['event', 'season', 'hours', 'onTrip', 'source'])
    if (!p.xmas[f]) err(`${id}: xmas.${f} ausente`);
}
for (const m of CHRISTMAS_MARKETS) {
  const p = PLACES[m.placeId];
  if (!p) { err(`feira ${m.placeId} inexistente`); continue; }
  if (!p.xmas) err(`feira ${m.placeId} sem xmas`);
  for (const d of m.visits) {
    const day = DAYS.find((x) => x.date === d);
    if (!day || !day.items.some((it) => it.placeId === m.placeId)) err(`feira ${m.placeId}: visita em ${d} não está no roteiro`);
    if (p.xmas && !p.xmas.onTrip[d]) err(`feira ${m.placeId}: sem horário (onTrip) para ${d}`);
  }
}
for (const day of DAYS) for (const it of day.items) {
  const p = PLACES[it.placeId];
  if (p && p.xmas && /FEIRA DE NATAL/.test(it.description) && !CHRISTMAS_MARKETS.find((m) => m.placeId === it.placeId && m.visits.includes(day.date)))
    err(`${day.date} ${it.time}: visita à feira ${it.placeId} ausente de CHRISTMAS_MARKETS`);
}
const ids = new Set(); for (const c of CHECKLIST) { if (ids.has(c.id)) err(`checklist duplicado ${c.id}`); ids.add(c.id); }

console.log(`\nLocais: ${Object.keys(PLACES).length} | Dias: ${DAYS.length} | Itens: ${DAYS.reduce((s, d) => s + d.items.length, 0)} | Trens: ${TRAINS.length}`);
console.log(`Feiras de Natal: ${CHRISTMAS_MARKETS.length} | visitas no roteiro: ${CHRISTMAS_MARKETS.reduce((s, m) => s + m.visits.length, 0)}`);
console.log(`Locais com verificação pendente: ${Object.values(PLACES).filter((p) => p.verify).length}`);
console.log(`Erros: ${errors} | Avisos: ${warns}`);
process.exit(errors ? 1 : 0);
