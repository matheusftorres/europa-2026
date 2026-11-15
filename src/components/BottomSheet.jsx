import { useEffect, useRef, useState } from 'react';

/** Painel deslizante do iPhone: três alturas (resumo, meia tela, tela cheia), arrastando pela alça. */
export default function BottomSheet({ snap, onSnap, bottomOffset, header, contentKey, children }) {
  const [vh, setVh] = useState(() => window.innerHeight);
  const [drag, setDrag] = useState(null);
  const start = useRef(null);
  useEffect(() => { const on = () => setVh(window.innerHeight); window.addEventListener('resize', on); return () => window.removeEventListener('resize', on); }, []);

  const heights = { peek: 148, half: Math.round(vh * 0.52), full: Math.max(vh - bottomOffset - 64, 300) };
  const height = drag ?? heights[snap];

  const onDown = (e) => { start.current = { y: e.clientY, h: heights[snap] }; e.currentTarget.setPointerCapture(e.pointerId); };
  const onMove = (e) => {
    if (!start.current) return;
    const h = start.current.h + (start.current.y - e.clientY);
    setDrag(Math.min(Math.max(h, 96), heights.full));
  };
  const onUp = (e) => {
    if (!start.current) return;
    const moved = Math.abs(start.current.y - e.clientY);
    const h = drag ?? heights[snap];
    start.current = null; setDrag(null);
    if (moved < 6) { onSnap(snap === 'peek' ? 'half' : snap === 'half' ? 'full' : 'half'); return; }
    const nearest = Object.entries(heights).sort((a, b) => Math.abs(a[1] - h) - Math.abs(b[1] - h))[0][0];
    onSnap(nearest);
  };

  return (
    <section
      className={`fixed inset-x-0 z-20 flex flex-col rounded-t-[22px] bg-frost shadow-[0_-8px_30px_rgba(10,16,35,0.35)] ${drag == null ? 'transition-[height] duration-300 ease-out' : ''}`}
      style={{ bottom: bottomOffset, height }}
      aria-label="Painel"
    >
      <div
        className="shrink-0 cursor-grab touch-none select-none pt-2 active:cursor-grabbing"
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        role="button" tabIndex={0} aria-label="Arrastar painel"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSnap(snap === 'full' ? 'half' : 'full'); }}
      >
        <div className="mx-auto h-1.5 w-10 rounded-full bg-rule" />
        {header}
      </div>
      <div key={contentKey} className={`min-h-0 flex-1 overscroll-contain ${snap === 'peek' && drag == null ? 'overflow-hidden' : 'overflow-y-auto'}`}>{children}</div>
    </section>
  );
}
