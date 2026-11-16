'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

/* ---------- clinic status in Tashkent time: Mon–Sat 8–20, Sunday by appointment ---------- */

type StatusKey = 'trust2' | 'stOpen' | 'stSun' | 'stEarly' | 'stSat' | 'stNight';

function tashkentNow(): { wd: number; h: number } {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tashkent', weekday: 'short', hour: 'numeric', hour12: false })
    .formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return { wd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')), h: Number(get('hour')) % 24 };
}

function statusKey(): StatusKey {
  try {
    const { wd, h } = tashkentNow();
    if (wd >= 1 && wd <= 6 && h >= 8 && h < 20) return 'stOpen';
    if (wd === 0) return 'stSun';
    if (h < 8) return 'stEarly';
    if (wd === 6) return 'stSat';
    return 'stNight';
  } catch {
    return 'trust2';
  }
}

const noSubscribe = () => () => {};

/** Status text; the server renders the plain hours, the browser swaps in "open now / closed". */
export function StatusPill({ labels, as = 'span', style }: {
  labels: Record<StatusKey, string>; as?: 'span' | 'p'; style?: React.CSSProperties;
}) {
  const key = useSyncExternalStore(noSubscribe, statusKey, () => 'trust2' as StatusKey);
  const Tag = as;
  return (
    <Tag className={`pill${key === 'stOpen' ? ' open' : ''}`} style={style}>
      <span>{labels[key]}</span>
    </Tag>
  );
}

/** Opening-hours rows; today's row is bold. */
export function HoursRows({ rows }: { rows: { days: number[]; label: string; value: string }[] }) {
  const wd = useSyncExternalStore(noSubscribe, () => { try { return tashkentNow().wd; } catch { return -1; } }, () => -1);
  return (
    <>
      {rows.map((r) => (
        <div key={r.label} className={`c-row${r.days.includes(wd) ? ' today' : ''}`}>
          <span>{r.label}</span>
          <span>{r.value}</span>
        </div>
      ))}
    </>
  );
}

/* ---------- count-up numbers (the static number is the resting state) ---------- */

export function Count({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el || !to) return;
    let reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { /* ignore */ }
    if (reduce || !('IntersectionObserver' in window)) return;
    let raf = 0;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const t0 = performance.now();
      const dur = 900;
      const step = (ts: number) => {
        const k = Math.min(1, (ts - t0) / dur);
        setVal(Math.round(to * (1 - Math.pow(1 - k, 3))));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      setVal(0);
      raf = requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span className="count" ref={ref}>{val}</span>;
}

/* ---------- copy phone number ---------- */

export function CopyPhone({ phone, copy, copied }: { phone: string; copy: string; copied: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="copy" onClick={async () => {
      try {
        await navigator.clipboard.writeText(phone);
        setDone(true);
        window.setTimeout(() => setDone(false), 2200);
      } catch { /* clipboard blocked: the number stays visible to copy by hand */ }
    }}>
      {done ? copied : copy}
    </button>
  );
}
