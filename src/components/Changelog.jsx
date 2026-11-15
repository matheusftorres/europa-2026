import { X } from 'lucide-react';
import { CHANGELOG, DATA_VERSION } from '../data/itineraryData.js';
import { ddmm } from '../lib/time.js';

export default function Changelog({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-night/60 sm:place-items-center" onClick={onClose} role="presentation">
      <div role="dialog" aria-modal="true" aria-label="Novidades" onClick={(e) => e.stopPropagation()}
        className="pb-safe w-full max-w-md rounded-t-[22px] bg-frost p-5 sm:rounded-[22px]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-cond text-[26px] font-semibold leading-tight text-ink">Novidades</h2>
            <p className="text-[13px] text-slate">Dados na versão {DATA_VERSION.number}, de {ddmm(DATA_VERSION.updatedAt)}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-slate hover:bg-rule/60" aria-label="Fechar"><X size={20} /></button>
        </div>
        <ol className="mt-3 max-h-[55dvh] space-y-4 overflow-y-auto">
          {CHANGELOG.map((c) => (
            <li key={c.version}>
              <h3 className="text-[14px] font-semibold text-ink">Versão {c.version} <span className="font-normal text-slate">({ddmm(c.date)})</span></h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-[14px] leading-snug text-ink/90">
                {c.items.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[13px] leading-snug text-slate">Mudou algo no roteiro ou comprou um ingresso? Conte na conversa do projeto e o app é atualizado.</p>
      </div>
    </div>
  );
}
