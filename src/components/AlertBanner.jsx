import { CircleAlert } from 'lucide-react';

export default function AlertBanner({ children }) {
  if (!children) return null;
  return (
    <div className="mx-4 mt-3 flex gap-2.5 rounded-lg border-l-[3px] border-wine bg-snow px-3 py-2.5 text-[14px] leading-snug text-ink">
      <CircleAlert size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-wine" aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}
