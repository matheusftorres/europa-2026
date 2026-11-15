import { PURCHASES, REDACTED } from '../data/itineraryData.js';
import { PURCHASE_STATUS } from '../lib/places.js';

const TONE = {
  pendente: 'bg-wine text-snow',
  'reservado-pagar-depois': 'bg-beeswax text-night',
  'comprar-no-dia': 'bg-night-3 text-snow',
  comprado: 'bg-pine-soft text-pine',
};

export default function PurchasesPanel({ onSelectPlace }) {
  const groups = Object.entries(PURCHASE_STATUS)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([status, meta]) => ({ status, meta, items: PURCHASES.filter((p) => p.status === status) }))
    .filter((g) => g.items.length);
  return (
    <div className="px-4 pb-8 pt-2">
      {REDACTED && <p className="mb-2 text-[13px] leading-snug text-slate">Os códigos de reserva aparecem como ••• neste site, por segurança. Eles estão no e-mail ou no PDF de cada compra.</p>}
      {groups.map((g) => (
        <section key={g.status} className="mt-2 first:mt-0">
          <h3 className="flex items-center gap-2 py-1.5">
            <span className={`rounded px-1.5 py-0.5 text-[12px] font-semibold ${TONE[g.status]}`}>{g.meta.label}</span>
            <span className="text-[13px] text-slate">{g.items.length}</span>
          </h3>
          <ul className="divide-y divide-rule">
            {g.items.map((c) => (
              <li key={c.id} className="py-2.5">
                <button type="button" disabled={!c.placeId} onClick={() => c.placeId && onSelectPlace(c.placeId)} className="w-full text-left disabled:cursor-default">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-[15px] font-semibold leading-tight text-ink">{c.title}</span>
                    {c.amount && <span className="shrink-0 text-right text-[13px] text-ink">{c.amount}</span>}
                  </span>
                  {c.ref && <span className="mt-0.5 block text-[13px] text-slate">Ref. {c.ref}</span>}
                  {c.action && <span className="mt-1 block text-[13px] leading-snug text-wine">{c.action}</span>}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
