import { Check } from 'lucide-react';
import { CHECKLIST } from '../data/itineraryData.js';

export default function ChecklistPanel({ checked, onToggle }) {
  const groups = [...new Set(CHECKLIST.map((c) => c.group))];
  const done = CHECKLIST.filter((c) => checked[c.id]).length;
  return (
    <div className="px-4 pb-8 pt-2">
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-rule" aria-hidden="true">
          <div className="h-full bg-pine transition-[width]" style={{ width: `${(done / CHECKLIST.length) * 100}%` }} />
        </div>
        <span className="text-[13px] text-slate tnum">{done} de {CHECKLIST.length}</span>
      </div>
      {groups.map((g) => (
        <section key={g} className="mt-4">
          <h3 className="font-cond text-[19px] font-semibold text-ink">{g}</h3>
          <ul>
            {CHECKLIST.filter((c) => c.group === g).map((c) => {
              const on = Boolean(checked[c.id]);
              return (
                <li key={c.id}>
                  <label className="flex cursor-pointer items-start gap-3 py-2">
                    <input type="checkbox" className="peer sr-only" checked={on} onChange={() => onToggle(c.id)} />
                    <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md ring-1 peer-focus-visible:ring-2 peer-focus-visible:ring-beeswax ${on ? 'bg-pine text-snow ring-pine' : 'bg-snow ring-rule'}`}>
                      {on && <Check size={13} strokeWidth={3} />}
                    </span>
                    <span className={`text-[14px] leading-snug ${on ? 'text-slate line-through decoration-slate/50' : 'text-ink'}`}>{c.text}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
