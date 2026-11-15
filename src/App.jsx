import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DAYS, TRIP, DATA_VERSION, PLACES } from './data/itineraryData.js';
import { nowInTrip, daysBetween } from './lib/time.js';
import { useLocalStorage, useMediaQuery } from './lib/storage.js';
import DayStrip from './components/DayStrip.jsx';
import DayView, { daySummary } from './components/DayView.jsx';
import PlaceDetail from './components/PlaceDetail.jsx';
import MarketsPanel from './components/MarketsPanel.jsx';
import PurchasesPanel from './components/PurchasesPanel.jsx';
import ChecklistPanel from './components/ChecklistPanel.jsx';
import MapView from './components/MapView.jsx';
import NearbyPanel from './components/NearbyPanel.jsx';
import Toast from './components/Toast.jsx';
import { useGeolocation } from './lib/useGeolocation.js';
import { geocode } from './lib/geocode.js';
import { distanceM } from './lib/geo.js';
import { itemKey } from './lib/places.js';
import BottomSheet from './components/BottomSheet.jsx';
import TabBar from './components/TabBar.jsx';
import Changelog from './components/Changelog.jsx';

const DESKTOP_TABS = [
  { id: 'roteiro', label: 'Roteiro' },
  { id: 'perto', label: 'Perto de mim' },
  { id: 'feiras', label: 'Feiras de Natal' },
  { id: 'compras', label: 'Compras' },
  { id: 'lista', label: 'Lista' },
];

function initialDay(today) {
  const i = DAYS.findIndex((d) => d.date === today);
  if (i >= 0) return i;
  return today > DAYS[DAYS.length - 1].date ? DAYS.length - 1 : 0;
}

function tripStatus(now) {
  if (now.date < TRIP.startDate) {
    const n = daysBetween(now.date, TRIP.startDate);
    return n === 1 ? 'Embarque amanhã' : `Faltam ${n} dias para o embarque`;
  }
  const i = DAYS.findIndex((d) => d.date === now.date);
  if (i >= 0) return `Dia ${i + 1} de ${DAYS.length}`;
  return now.date > TRIP.endDate ? 'Viagem concluída' : 'Em viagem';
}

export default function App() {
  const [now, setNow] = useState(() => nowInTrip());
  useEffect(() => { const t = setInterval(() => setNow(nowInTrip()), 60000); return () => clearInterval(t); }, []);
  const desktop = useMediaQuery('(min-width: 900px)');

  const [dayIdx, setDayIdx] = useState(() => initialDay(now.date));
  const [tab, setTab] = useState('roteiro');
  const [placeId, setPlaceId] = useState(null);
  const [snap, setSnap] = useState('half');
  const [showLog, setShowLog] = useState(false);
  const [checkins, setCheckins] = useLocalStorage('europa26:checkins', {});
  const [checked, setChecked] = useLocalStorage('europa26:checklist', {});
  const [seenVersion, setSeenVersion] = useLocalStorage('europa26:dataVersion', 0);
  const [autoCheckin, setAutoCheckin] = useLocalStorage('europa26:autocheckin', true);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);
  const [, setGeoTick] = useState(0);
  const gps = useGeolocation();

  // Locais novos sem coordenada: busca no Nominatim (1 por segundo) e guarda no aparelho.
  useEffect(() => {
    let alive = true;
    (async () => {
      for (const p of Object.values(PLACES)) {
        if (p.lat != null || !p.geocodeQuery) continue;
        try { const r = await geocode(p.geocodeQuery); if (r && alive) { p.lat = r.lat; p.lng = r.lng; setGeoTick((t) => t + 1); } } catch { /* sem rede */ }
      }
    })();
    return () => { alive = false; };
  }, []);

  // Check-in automático: a menos de 60 m de uma parada de hoje (precisão do GPS até 80 m).
  const prompted = useRef(new Set());
  useEffect(() => {
    if (!autoCheckin || !gps.pos || gps.pos.accuracy > 80) return;
    const todayDay = DAYS.find((d) => d.date === now.date);
    if (!todayDay) return;
    for (const it of todayDay.items) {
      if (it.priority === 'LOGISTICS') continue;
      const k = itemKey(todayDay.date, it);
      const p = PLACES[it.placeId];
      if (!p || p.lat == null || checkins[k] || prompted.current.has(k)) continue;
      if (distanceM(gps.pos, p) <= 60) {
        prompted.current.add(k);
        setCheckins((c) => ({ ...c, [k]: { at: new Date().toISOString(), auto: true } }));
        setToast({ text: `Check-in automático: ${p.name}.`, action: { label: 'Desfazer', run: () => setCheckins((c) => { const n = { ...c }; delete n[k]; return n; }) } });
        break;
      }
    }
  }, [gps.pos, autoCheckin, now.date, checkins, setCheckins]);
  const tabbar = useRef(null);
  const mobileHeader = useRef(null);
  const [headerH, setHeaderH] = useState(160);
  useEffect(() => {
    const el = mobileHeader.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setHeaderH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [desktop]);
  const [tabbarH, setTabbarH] = useState(56);
  useEffect(() => { if (tabbar.current) setTabbarH(tabbar.current.offsetHeight); }, [desktop]);

  const day = DAYS[dayIdx];
  const isToday = day.date === now.date;
  const status = useMemo(() => tripStatus(now), [now]);
  const hasNews = seenVersion < DATA_VERSION.number;

  const selectPlace = (id) => { setPlaceId(id); if (!desktop && snap === 'peek') setSnap('half'); };
  const goToDay = (date) => { const i = DAYS.findIndex((d) => d.date === date); if (i >= 0) { setDayIdx(i); setTab('roteiro'); } };
  const toggleCheckin = (k) => setCheckins((c) => { const n = { ...c }; if (n[k]) delete n[k]; else n[k] = { at: new Date().toISOString(), auto: false }; return n; });
  const toggleChecked = (id) => setChecked((c) => ({ ...c, [id]: !c[id] }));
  const openLog = () => { setShowLog(true); setSeenVersion(DATA_VERSION.number); };
  const changeTab = (t) => {
    // No iPhone, tocar de novo na aba já aberta recolhe o painel para mostrar o mapa.
    if (!desktop && t === tab && !placeId) { setSnap(snap === 'peek' ? 'half' : 'peek'); return; }
    setTab(t); setPlaceId(null);
    if (!desktop && snap === 'peek') setSnap('half');
  };

  const panel = (t) => {
    if (placeId) return <PlaceDetail placeId={placeId} onClose={() => setPlaceId(null)} onGoToDay={(d) => { goToDay(d); setPlaceId(null); }} />;
    if (t === 'feiras') return <MarketsPanel today={now.date} onSelectPlace={selectPlace} />;
    if (t === 'compras') return <PurchasesPanel onSelectPlace={selectPlace} />;
    if (t === 'lista') return <ChecklistPanel checked={checked} onToggle={toggleChecked} />;
    if (t === 'perto') return <NearbyPanel gps={gps} now={now} onSelectPlace={selectPlace} autoCheckin={autoCheckin} onToggleAuto={() => setAutoCheckin((v) => !v)} />;
    return (
      <DayView day={day} isToday={isToday} nowMinutes={now.minutes} selectedPlaceId={placeId}
        onSelectPlace={selectPlace} checkins={checkins} onToggleCheckin={toggleCheckin} userPos={gps.pos} />
    );
  };

  const newsButton = (dark) => (
    <button type="button" onClick={openLog}
      className={`relative shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold ${dark ? 'bg-night-2 text-snow' : 'bg-snow text-ink ring-1 ring-rule'}`}>
      Novidades
      {hasNews && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-beeswax ring-2 ring-night" aria-label="há novidades" />}
    </button>
  );

  if (desktop) {
    return (
      <div className="grid h-dvh grid-cols-[minmax(400px,460px)_1fr]">
        <aside className="flex min-h-0 flex-col bg-frost">
          <header className="flex items-end justify-between gap-3 px-4 pb-1 pt-4">
            <div>
              <h1 className="font-cond text-[34px] font-bold leading-none text-ink">Europa 26/27</h1>
              <p className="mt-1 text-[13px] text-slate">{status}</p>
            </div>
            {newsButton(false)}
          </header>
          <DayStrip selected={dayIdx} onSelect={(i) => { setDayIdx(i); setTab('roteiro'); }} today={now.date} />
          <nav className="flex gap-1 border-b border-rule px-4" aria-label="Seções">
            {DESKTOP_TABS.map((t) => (
              <button key={t.id} type="button" onClick={() => changeTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}
                className={`-mb-px border-b-2 px-2.5 py-2 text-[14px] font-semibold ${tab === t.id ? 'border-night text-ink' : 'border-transparent text-slate hover:text-ink'}`}>
                {t.label}
              </button>
            ))}
          </nav>
          <div key={`${tab}|${placeId}|${dayIdx}`} className="min-h-0 flex-1 overflow-y-auto">{panel(tab)}</div>
        </aside>
        <main className="relative min-h-0">
          <MapView day={day} selectedPlaceId={placeId} onSelectPlace={selectPlace} gps={gps} />
        </main>
        <Changelog open={showLog} onClose={() => setShowLog(false)} />
        <Toast toast={toast} onClose={closeToast} bottom={24} />
      </div>
    );
  }

  const topInset = headerH;
  return (
    <div className="relative h-dvh overflow-hidden">
      <div className="absolute inset-0">
        <MapView day={day} selectedPlaceId={placeId} onSelectPlace={selectPlace} gps={gps} insetTop={topInset} insetBottom={tabbarH + (snap === 'peek' ? 148 : Math.round(window.innerHeight * 0.52))} />
      </div>
      <header ref={mobileHeader} className="pt-safe absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-night via-night/90 to-transparent pb-3">
        <div className="flex items-center justify-between gap-3 px-4 pt-2">
          <div className="min-w-0">
            <h1 className="font-cond text-[26px] font-bold leading-none text-snow">Europa 26/27</h1>
            <p className="mt-0.5 truncate text-[12px] text-snow/65">{status}</p>
          </div>
          {newsButton(true)}
        </div>
        <DayStrip selected={dayIdx} onSelect={(i) => { setDayIdx(i); setPlaceId(null); }} today={now.date} dark />
      </header>
      <BottomSheet snap={snap} onSnap={setSnap} bottomOffset={tabbarH} contentKey={`${tab}|${placeId}|${dayIdx}`}
        header={snap === 'peek' && !placeId ? <p className="px-4 pb-1 pt-2 text-[13px] text-slate">{daySummary(day)}. Puxe para ver mais.</p> : null}>
        {panel(tab)}
      </BottomSheet>
      <TabBar ref={tabbar} tab={tab} onTab={changeTab} />
      <Changelog open={showLog} onClose={() => setShowLog(false)} />
      <Toast toast={toast} onClose={closeToast} bottom={tabbarH + 12} />
    </div>
  );
}
