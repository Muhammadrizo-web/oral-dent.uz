'use client';

import { useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

/** Runs in <head> before the first paint, so the page never flashes the wrong theme. */
export const THEME_BOOT = `(function(){try{var d=document.documentElement,s=localStorage.getItem('od-theme');
var t=s==='dark'||s==='light'?s:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
d.dataset.theme=t;d.style.colorScheme=t;
if(!sessionStorage.getItem('od-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('intro');sessionStorage.setItem('od-intro','1')}
}catch(e){document.documentElement.dataset.theme='light'}})();`;

const read = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => { listeners.add(fn); return () => listeners.delete(fn); };

function apply(next: Theme) {
  const d = document.documentElement;
  d.dataset.theme = next;
  d.style.colorScheme = next;
  try { localStorage.setItem('od-theme', next); } catch { /* storage may be blocked */ }
  listeners.forEach((fn) => fn());
}

type VTDoc = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

/** Light/dark switch. The new theme opens as a circle from the button (View Transitions), plain swap elsewhere. */
export default function ThemeToggle({ label }: { label: string }) {
  const theme = useSyncExternalStore(subscribe, read, () => 'light' as Theme);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next: Theme = read() === 'dark' ? 'light' : 'dark';
    const doc = document as VTDoc;
    let reduce = false;
    try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { /* ignore */ }
    if (!doc.startViewTransition || reduce) { apply(next); return; }
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.documentElement.classList.add('vt-theme');
    const vt = doc.startViewTransition(() => apply(next));
    vt.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' },
      ).finished.finally(() => document.documentElement.classList.remove('vt-theme'));
    }).catch(() => document.documentElement.classList.remove('vt-theme'));
  };

  return (
    <button type="button" className="theme-t" aria-label={label} aria-pressed={theme === 'dark'} onClick={toggle} suppressHydrationWarning>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.25" className="ring" />
        <path d="M12 3.75a8.25 8.25 0 0 1 0 16.5z" className="half" />
      </svg>
    </button>
  );
}
