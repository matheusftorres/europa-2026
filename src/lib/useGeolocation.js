import { useCallback, useEffect, useRef, useState } from 'react';

const MESSAGES = {
  1: 'A localização foi negada. No iPhone: Ajustes > Privacidade e Segurança > Serviços de Localização > Safari (ou o app) > "Ao Usar o App".',
  2: 'Não foi possível obter a posição agora. Tente ao ar livre ou confira se a localização está ligada.',
  3: 'A localização demorou a responder. Tente de novo.',
};

/** GPS contínuo (watchPosition). Só liga quando o usuário pede, e o pedido fica lembrado no aparelho. */
export function useGeolocation() {
  const [enabled, setEnabled] = useState(() => { try { return localStorage.getItem('europa26:gps') === 'on'; } catch { return false; } });
  const [pos, setPos] = useState(null);
  const [error, setError] = useState(null);
  const watch = useRef(null);

  useEffect(() => {
    try { localStorage.setItem('europa26:gps', enabled ? 'on' : 'off'); } catch { /* ok */ }
    if (!enabled) { setPos(null); return undefined; }
    if (!('geolocation' in navigator)) { setError('Este navegador não oferece localização.'); return undefined; }
    watch.current = navigator.geolocation.watchPosition(
      (p) => { setError(null); setPos({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy, at: p.timestamp }); },
      (e) => setError(MESSAGES[e.code] ?? 'Localização indisponível.'),
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 },
    );
    return () => { if (watch.current != null) navigator.geolocation.clearWatch(watch.current); };
  }, [enabled]);

  const start = useCallback(() => setEnabled(true), []);
  const stop = useCallback(() => setEnabled(false), []);
  return { enabled, pos, error, start, stop };
}
