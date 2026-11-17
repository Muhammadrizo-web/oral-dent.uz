'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/** A horizontal row that scrolls left and right: by trackpad, touch, drag-free arrows or keyboard. */
export default function Rail({ children, prev, next, className = '' }: { children: ReactNode; prev: string; next: string; className?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const check = () => setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
    check();
    el.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => { el.removeEventListener('scroll', check); window.removeEventListener('resize', check); };
  }, []);

  const move = (dir: number) => {
    const el = track.current;
    if (!el) return;
    const item = el.firstElementChild as HTMLElement | null;
    const step = item ? item.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || '0') : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * Math.max(step, el.clientWidth * 0.6), behavior: 'smooth' });
  };

  return (
    <div className={`rail ${className}`}>
      <div className="rail-track" ref={track} tabIndex={0}>{children}</div>
      <div className="rail-nav">
        <button type="button" aria-label={prev} disabled={edge.start} onClick={() => move(-1)}>←</button>
        <button type="button" aria-label={next} disabled={edge.end} onClick={() => move(1)}>→</button>
      </div>
    </div>
  );
}
