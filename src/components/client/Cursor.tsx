'use client';

import { useEffect, useRef } from 'react';

/**
 * Cursor for mouse users: a small dot that follows exactly and a little tooth that flies after it,
 * leaning into the motion. Over links and buttons the tooth turns orange; over [data-cursor="…"] it shows that word.
 * Over text fields the system cursor returns. Off on touch screens and with reduced motion.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let ok = false;
    try { ok = matchMedia('(pointer: fine) and (hover: hover)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { /* ignore */ }
    const d = dot.current;
    const r = ring.current;
    const l = label.current;
    if (!ok || !d || !r || !l) return;
    const root = document.documentElement;
    root.classList.add('has-cur');

    let x = -100, y = -100, rx = -100, ry = -100, tilt = 0;
    let raf = 0;
    let shown = false;
    /* the tooth trails the pointer and leans into the motion, like something carried through the air */
    const tick = () => {
      const dx = x - rx;
      const dy = y - ry;
      rx += dx * 0.16;
      ry += dy * 0.16;
      tilt += (Math.max(-28, Math.min(28, dx * 0.6)) - tilt) * 0.18;
      r.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      r.style.setProperty('--tilt', `${tilt.toFixed(2)}deg`);
      raf = Math.abs(dx) + Math.abs(dy) + Math.abs(tilt) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY;
      d.style.transform = `translate3d(${x}px,${y}px,0)`;
      if (!shown) { shown = true; rx = x; ry = y; root.classList.add('cur-on'); }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const over = (e: PointerEvent) => {
      const t = e.target instanceof Element ? e.target : null;
      const word = t?.closest<HTMLElement>('[data-cursor]')?.dataset.cursor ?? '';
      const field = !!t?.closest('input, textarea, select, [contenteditable="true"]');
      const link = !!t?.closest('a, button, label, summary, [role="button"], .tooth');
      l.textContent = word;
      root.classList.toggle('cur-word', !!word);
      root.classList.toggle('cur-link', link && !word);
      root.classList.toggle('cur-field', field);
    };
    const leave = () => { shown = false; root.classList.remove('cur-on'); };
    const down = () => root.classList.add('cur-down');
    const up = () => root.classList.remove('cur-down');

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    window.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointerup', up, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      root.classList.remove('has-cur', 'cur-on', 'cur-word', 'cur-link', 'cur-field', 'cur-down');
    };
  }, []);

  return (
    <div className="cur" aria-hidden="true">
      <div className="cur-ring" ref={ring}>
        <svg className="cur-tooth" viewBox="0 0 24 24">
          <path d="M12 5.2C10.7 4.1 9.4 3.4 7.8 3.4 5.3 3.4 3.6 5.3 3.6 7.9c0 2.1.9 3.4 1.5 5.3.6 2 .8 4.6 1.6 6.3.4.9 1.4 1 1.9.2.8-1.2.9-3.3 1.6-4.7.3-.6.9-1 1.8-1s1.5.4 1.8 1c.7 1.4.8 3.5 1.6 4.7.5.8 1.5.7 1.9-.2.8-1.7 1-4.3 1.6-6.3.6-1.9 1.5-3.2 1.5-5.3 0-2.6-1.7-4.5-4.2-4.5-1.6 0-2.9.7-4.2 1.8z" />
          <path className="shine" d="M7.4 6.6c-.9.4-1.4 1.2-1.5 2.2" />
        </svg>
        <span ref={label} />
      </div>
      <div className="cur-dot" ref={dot} />
    </div>
  );
}
