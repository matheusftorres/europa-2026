// Todas as cidades da viagem (inclusive Paris) usam o mesmo fuso em dez/jan: CET (UTC+1).
export const TRIP_TZ = 'Europe/Vienna';

/** Data (AAAA-MM-DD) e minutos do dia no fuso da viagem. `override` permite simular um horário. */
export function nowInTrip(override) {
  const d = override ? new Date(override) : new Date();
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: TRIP_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(d).map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

export const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

export const ddmm = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

export function daysBetween(fromIso, toIso) {
  const a = Date.UTC(+fromIso.slice(0, 4), +fromIso.slice(5, 7) - 1, +fromIso.slice(8, 10));
  const b = Date.UTC(+toIso.slice(0, 4), +toIso.slice(5, 7) - 1, +toIso.slice(8, 10));
  return Math.round((b - a) / 86400000);
}

/** Formata "21:55" como "21h55" e "10:00" como "10h". */
export const hourLabel = (hhmm) => { const [h, m] = hhmm.split(':'); return m === '00' ? `${+h}h` : `${+h}h${m}`; };

export function durationLabel(min) {
  if (!min) return null;
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}
