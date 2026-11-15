import { forwardRef } from 'react';
import { Route, Radar, TreePine, Ticket, ListChecks } from 'lucide-react';

export const TABS = [
  { id: 'roteiro', label: 'Roteiro', Icon: Route },
  { id: 'perto', label: 'Perto', Icon: Radar },
  { id: 'feiras', label: 'Feiras', Icon: TreePine },
  { id: 'compras', label: 'Compras', Icon: Ticket },
  { id: 'lista', label: 'Lista', Icon: ListChecks },
];

const TabBar = forwardRef(function TabBar({ tab, onTab }, ref) {
  return (
    <nav ref={ref} className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-snow" aria-label="Seções">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {TABS.map(({ id, label, Icon }) => {
          const on = tab === id;
          return (
            <li key={id}>
              <button type="button" onClick={() => onTab(id)} aria-current={on ? 'page' : undefined}
                className={`flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${on ? 'text-night' : 'text-slate'}`}>
                <span className={`grid h-7 w-12 place-items-center rounded-full ${on ? (id === 'feiras' ? 'bg-beeswax-soft text-[#7a5300]' : 'bg-frost') : ''}`}>
                  <Icon size={19} strokeWidth={on ? 2.2 : 1.75} />
                </span>
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
});
export default TabBar;
