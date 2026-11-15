/**
 * Gera src/data/itineraryData.js (versão PÚBLICA, que vai para o repositório e para o site)
 * a partir de private/itineraryData.full.js (versão completa, que fica só no projeto do Claude).
 * Remove códigos de reserva, números de pedido/bilhete e o nome do titular.
 */
import { writeFileSync } from 'node:fs';
import * as full from '../private/itineraryData.full.js';

const MASK = '•••';
const KEEP_KEYS = new Set(['osm', 'source', 'geocodeQuery', 'id', 'placeId', 'trainId', 'baseHotel', 'city', 'category', 'from', 'to', 'date', 'time', 'priority', 'status']);
const PATTERNS = [
  /\b\d{4} \d{4} \d{4} \d{4}\b/g,          // reserva ÖBB
  /\b\d{3}-\d{4}-\d{4}\b/g,                 // bilhete WESTbahn
  /\b[A-Z0-9]{3}-[A-Z0-9]{3}\b/g,           // código WESTbahn
  // Localizadores e códigos alfanuméricos (Air France, DB, GetYourGuide): 6 a 14 caracteres maiúsculos
  // com letras e números. Números de voo (duas letras + 3 ou 4 dígitos, ex. AF1122) são preservados.
  /\b(?![A-Z]{2}\d{3,4}\b)(?=[A-Z0-9]*\d)(?=(?:[A-Z0-9]*[A-Z]){2})[A-Z0-9]{6,14}\b/g,
  /\b\d{6,}\b/g,                            // pedidos e ingressos (DB, Sedlec, Sisi Pass, Belvedere)
];
const NAMES = [[/Titular: [A-ZÀ-Ý][a-zà-ÿ]+/g, 'Titular: quem fez a compra']];

let count = 0;
function clean(value, key) {
  if (typeof value === 'string') {
    if (KEEP_KEYS.has(key) || /^https?:\/\//.test(value)) return value;
    let s = value;
    for (const re of PATTERNS) s = s.replace(re, () => { count++; return MASK; });
    for (const [re, rep] of NAMES) s = s.replace(re, () => { count++; return rep; });
    return s;
  }
  if (Array.isArray(value)) return value.map((v) => clean(v, key));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, clean(v, k)]));
  return value;
}

const out = ['// GERADO por scripts/redact.mjs a partir da versão completa. Não editar à mão.',
  '// Códigos de reserva e números de pedido foram trocados por "•••" (estão no e-mail/PDF de cada compra).', '',
  'export const REDACTED = true;', ''];
for (const [name, value] of Object.entries(full)) {
  out.push(`export const ${name} = ${JSON.stringify(clean(value, name), null, 2)};`, '');
}
writeFileSync(new URL('../src/data/itineraryData.js', import.meta.url), out.join('\n'));
console.log(`Versão pública gerada: ${count} trechos ocultados.`);
