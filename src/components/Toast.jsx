import { useEffect } from 'react';

export default function Toast({ toast, onClose, bottom }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onClose, 7000);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  return (
    <div role="status" className="fixed inset-x-3 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-xl bg-night px-4 py-3 text-snow shadow-lg" style={{ bottom }}>
      <p className="flex-1 text-[14px] leading-snug">{toast.text}</p>
      {toast.action && (
        <button type="button" onClick={() => { toast.action.run(); onClose(); }} className="shrink-0 text-[14px] font-semibold text-beeswax">{toast.action.label}</button>
      )}
    </div>
  );
}
