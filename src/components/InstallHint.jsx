import { useState } from 'react';
import { Share, SquarePlus, X, Copy } from 'lucide-react';

/** iPhone/iPad aberto no navegador (e não pelo ícone da Tela de Início). */
function detect() {
  if (typeof window === 'undefined') return null;
  const ua = navigator.userAgent || '';
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = navigator.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches;
  if (!ios || standalone) return null;
  const otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|GSA\/|Instagram|FBAN|FBAV|Line\//.test(ua);
  return otherBrowser ? 'other' : 'safari';
}

export default function InstallHint() {
  const [mode] = useState(detect);
  const [open, setOpen] = useState(() => { try { return !sessionStorage.getItem('europa26:installHint'); } catch { return true; } });
  const [copied, setCopied] = useState(false);
  if (!mode || !open) return null;
  const close = () => { try { sessionStorage.setItem('europa26:installHint', '1'); } catch { /* ok */ } setOpen(false); };
  const url = window.location.href.split('#')[0];

  return (
    <div className="fixed inset-0 z-[1000] flex items-end bg-night/60 p-3 pb-safe" role="dialog" aria-modal="true" aria-labelledby="install-title">
      <div className="w-full rounded-2xl bg-snow p-5 text-ink shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <h2 id="install-title" className="font-cond text-[22px] font-bold leading-tight">Instale o app no iPhone</h2>
          <button type="button" onClick={close} className="-m-2 p-2 text-slate" aria-label="Fechar"><X size={20} /></button>
        </div>
        {mode === 'other' ? (
          <>
            <p className="mt-2 text-[15px] leading-snug">Este navegador não instala o app. Copie o endereço e abra no <b>Safari</b>.</p>
            <button type="button" onClick={() => { navigator.clipboard?.writeText(url).then(() => setCopied(true)).catch(() => {}); }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-night py-3 text-[15px] font-semibold text-snow">
              <Copy size={17} /> {copied ? 'Endereço copiado' : 'Copiar endereço'}
            </button>
          </>
        ) : (
          <>
            <p className="mt-2 text-[15px] leading-snug">Pelo Safari, o app não abre em tela cheia nem tem uso sem internet garantido. Instale uma vez:</p>
            <ol className="mt-3 space-y-2.5 text-[15px] leading-snug">
              <li className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-night-2 text-snow"><Share size={15} /></span>
                <span>Toque em <b>Compartilhar</b> (no iOS 26, dentro do menu <b>•••</b> ao lado do endereço).</span></li>
              <li className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-night-2 text-snow"><SquarePlus size={15} /></span>
                <span>Role e toque em <b>Adicionar à Tela de Início</b>, com <b>Abrir como App Web</b> ligado.</span></li>
              <li className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-beeswax font-semibold text-night">3</span>
                <span>Feche o Safari e abra pelo ícone <b>Europa 26/27</b>.</span></li>
            </ol>
          </>
        )}
        <button type="button" onClick={close} className="mt-4 w-full py-2 text-[14px] text-slate underline">Continuar no navegador</button>
      </div>
    </div>
  );
}
