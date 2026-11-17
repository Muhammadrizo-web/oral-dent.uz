'use client';

import { useEffect, useRef, useState } from 'react';

const DUR = 820; // ms: the cross-fade (globals.css, html.fp .fp-slide) plus a short settle
const QUIET = 170; // ms of wheel silence needed before the next step (swallows trackpad inertia)

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Full-screen slides for every page. Labels for the side dots come from each slide's data-label.
 * A slide taller than the window scrolls inside first; the next wheel step after it reaches its edge moves on.
 * Large screens: one wheel step / key / swipe = one screen, nothing scrolls natively, so nothing can jump.
 * Phones, short windows or reduced motion: ordinary scrolling,
 * and every slide plays its entrance once when it comes into view. The markup is the same in both modes.
 */
export default function FullPage({ hint }: { hint: string }) {
  const [cur, setCur] = useState(0);
  const [labels, setLabels] = useState<string[]>([]);
  const [on, setOn] = useState(false);
  const curRef = useRef(0);
  const lock = useRef(0);
  const lastWheel = useRef(0);

  useEffect(() => {
    const root = document.documentElement;
    const slides = Array.from(document.querySelectorAll<HTMLElement>('.fp-slide'));
    if (!slides.length) return;
    const raf0 = requestAnimationFrame(() => setLabels(slides.map((s) => s.dataset.label ?? '')));
    root.classList.add('fp-ready');
    /* a slide whose content is taller than the window scrolls inside itself */
    const box = (i: number) => slides[i]?.querySelector<HTMLElement>('.fp-in') ?? null;
    const canScroll = (i: number, dir: number) => {
      const b = box(i);
      if (!b || b.scrollHeight <= b.clientHeight + 2) return false;
      return dir > 0 ? b.scrollTop + b.clientHeight < b.scrollHeight - 2 : b.scrollTop > 2;
    };
    let innerAt = 0; // last time a wheel step was spent scrolling inside a slide
    const busy = () => !!document.querySelector('.lightbox:not([hidden])') || root.classList.contains('menu-open');
    const sideways = (e: WheelEvent) => Math.abs(e.deltaX) > Math.abs(e.deltaY)
      && e.target instanceof Element && !!e.target.closest('.rail-track');
    let reduce = false;
    try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { /* ignore */ }
    const mq = matchMedia('(min-width: 1024px) and (min-height: 660px)');
    let enabled = false;
    let io: IntersectionObserver | null = null;

    /* only the current page plays video; everything else is paused (this is what kept the old version smooth-less) */
    const media = (i: number) => {
      slides.forEach((s, k) => s.querySelectorAll('video').forEach((v) => {
        if (k === i && enabled) { v.play().catch(() => { /* autoplay refused: poster stays */ }); } else if (!v.paused) v.pause();
      }));
    };
    const changed = () => window.dispatchEvent(new Event('fp:change'));

    /* the brand's orange dot travels along an arc to its place on the next screen */
    const dotEl = document.querySelector<HTMLElement>('.fp-dot');
    let at: { x: number; y: number } | null = null;
    const target = (i: number) => {
      const a = slides[i]?.querySelector<HTMLElement>('[data-dot]');
      if (!a) return null;
      const r = a.getBoundingClientRect();
      let dy = 0;
      for (let p: HTMLElement | null = a; p && p !== slides[i]; p = p.parentElement) {
        if (p.classList.contains('a')) { const m = /\s(-?[\d.]+)px/.exec(getComputedStyle(p).translate); if (m) dy += Number(m[1]); }
      }
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 - dy };
    };
    const fly = (i: number, animate: boolean) => {
      if (!dotEl || !enabled) return;
      const to = target(i);
      if (!to) { dotEl.style.opacity = '0'; return; }
      const tf = (p: { x: number; y: number }, sc = 1) => `translate3d(${p.x}px,${p.y}px,0) translate(-50%,-50%) scale(${sc})`;
      dotEl.getAnimations().forEach((an) => an.cancel());
      if (animate && at) {
        const mid = { x: (at.x + to.x) / 2, y: Math.min(at.y, to.y) - Math.min(220, Math.abs(to.x - at.x) * 0.25 + 90) };
        dotEl.animate([{ transform: tf(at) }, { transform: tf(mid, 1.8), offset: 0.5 }, { transform: tf(to) }],
          { duration: 1100, easing: 'cubic-bezier(.65,0,.35,1)' });
      }
      dotEl.style.transform = tf(to);
      dotEl.style.opacity = '1';
      at = to;
    };

    const paint = (i: number) => {
      slides.forEach((s, k) => {
        s.classList.toggle('is-active', k === i);
        s.classList.toggle('is-past', k < i);
        s.setAttribute('aria-hidden', k === i ? 'false' : 'true');
      });
      root.dataset.tone = slides[i]?.dataset.tone ?? 'paper';
      media(i);
      changed();
      requestAnimationFrame(() => fly(i, true));
    };

    const go = (i: number) => {
      if (!enabled) return;
      const n = Math.max(0, Math.min(slides.length - 1, i));
      const now = performance.now();
      if (n === curRef.current || now < lock.current) return;
      const down = n > curRef.current;
      root.dataset.dir = down ? 'down' : 'up';
      curRef.current = n;
      lock.current = now + DUR;
      setCur(n);
      const b = box(n);
      if (b) b.scrollTop = down ? 0 : b.scrollHeight;
      paint(n);
      const id = slides[n]?.id;
      if (id) history.replaceState(null, '', n === 0 ? location.pathname + location.search : `#${id}`);
    };

    /* ---- input ---- */
    const onWheel = (e: WheelEvent) => {
      if (!enabled || e.ctrlKey || busy() || sideways(e)) return;
      const now = performance.now();
      const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : 0;
      /* the slide still has content in that direction: let it scroll natively */
      if (d && canScroll(curRef.current, d) && now >= lock.current) { innerAt = now; lastWheel.current = now; return; }
      e.preventDefault();
      const quiet = now - lastWheel.current > QUIET;
      lastWheel.current = now;
      if (!quiet || now < lock.current || now - innerAt < 450) return;
      if (Math.abs(d) < 4) return;
      go(curRef.current + (d > 0 ? 1 : -1));
    };
    const onKey = (e: KeyboardEvent) => {
      if (!enabled || e.altKey || e.metaKey || e.ctrlKey || busy()) return;
      const t = e.target instanceof HTMLElement ? e.target : null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const k = e.key;
      let to: number | null = null;
      if (k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey && t?.tagName !== 'BUTTON' && t?.tagName !== 'A')) to = curRef.current + 1;
      else if (k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey)) to = curRef.current - 1;
      else if (k === 'Home') to = 0;
      else if (k === 'End') to = slides.length - 1;
      if (to === null) return;
      e.preventDefault();
      const dir = to > curRef.current ? 1 : -1;
      const b = box(curRef.current);
      if ((k === 'ArrowDown' || k === 'ArrowUp' || k === 'PageDown' || k === 'PageUp' || k === ' ') && b && canScroll(curRef.current, dir)) {
        b.scrollBy({ top: dir * b.clientHeight * 0.8, behavior: 'smooth' });
        return;
      }
      go(to);
    };
    let ty = 0;
    let tx = 0;
    let tUp = false;
    let tDown = false;
    let tRail = false;
    const onTouchStart = (e: TouchEvent) => {
      ty = e.touches[0]?.clientY ?? 0; tx = e.touches[0]?.clientX ?? 0;
      tUp = canScroll(curRef.current, -1); tDown = canScroll(curRef.current, 1);
      tRail = e.target instanceof Element && !!e.target.closest('.rail-track');
    };
    const onTouchMove = (e: TouchEvent) => { if (enabled && !tUp && !tDown && !tRail && !busy()) e.preventDefault(); };
    const onTouchEnd = (e: TouchEvent) => {
      if (!enabled || busy()) return;
      const dy = ty - (e.changedTouches[0]?.clientY ?? ty);
      const dx = tx - (e.changedTouches[0]?.clientX ?? tx);
      if (Math.abs(dy) > 50 && Math.abs(dy) > Math.abs(dx) && !(dy > 0 ? tDown : tUp)) go(curRef.current + (dy > 0 ? 1 : -1));
    };
    /* in-page links (#plan, #book …) move to their slide */
    const onClick = (e: MouseEvent) => {
      if (!enabled) return;
      const a = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      if (!a) return;
      const k = slides.findIndex((s) => `#${s.id}` === a.getAttribute('href'));
      if (k < 0) return;
      e.preventDefault();
      lock.current = 0;
      go(k);
    };
    /* keyboard focus that lands inside another slide brings that slide in */
    const onFocus = (e: FocusEvent) => {
      if (!enabled) return;
      const s = e.target instanceof Element ? e.target.closest<HTMLElement>('.fp-slide') : null;
      const k = s ? slides.indexOf(s) : -1;
      if (k >= 0 && k !== curRef.current) { lock.current = 0; go(k); }
    };

    /* ---- modes ---- */

    const enable = () => {
      io?.disconnect(); io = null;
      root.classList.add('fp');
      window.scrollTo(0, 0);
      enabled = true;
      setOn(true);
      const fromHash = slides.findIndex((s) => `#${s.id}` === location.hash);
      const start = fromHash > 0 ? fromHash : Math.min(curRef.current, slides.length - 1);
      curRef.current = start;
      setCur(start);
      root.dataset.dir = 'down';
      paint(start);
    };

    const flow = () => {
      enabled = false;
      setOn(false);
      root.classList.remove('fp');
      delete root.dataset.tone;
      slides.forEach((s) => { s.classList.remove('is-past'); s.removeAttribute('aria-hidden'); });
      if (!('IntersectionObserver' in window)) { slides.forEach((s) => s.classList.add('is-active')); return; }
      io = new IntersectionObserver((es) => {
        for (const en of es) if (en.isIntersecting) { en.target.classList.add('is-active'); io?.unobserve(en.target); changed(); }
      }, { threshold: 0.18 });
      slides.forEach((s) => io?.observe(s));
    };

    const decide = () => { if (mq.matches && !reduce) enable(); else flow(); };
    decide();
    let rz = 0;
    const onResize = () => { window.clearTimeout(rz); rz = window.setTimeout(() => { if (mq.matches && !reduce) { if (!enabled) enable(); else fly(curRef.current, false); } }, 200); };
    mq.addEventListener?.('change', decide);
    window.addEventListener('resize', onResize);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    document.addEventListener('click', onClick);
    document.addEventListener('focusin', onFocus);
    const nav = (e: Event) => { const d = (e as CustomEvent<number>).detail; lock.current = 0; go(d); };
    window.addEventListener('fp:go', nav);

    return () => {
      cancelAnimationFrame(raf0);
      mq.removeEventListener?.('change', decide);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('click', onClick);
      document.removeEventListener('focusin', onFocus);
      window.removeEventListener('fp:go', nav);
      window.clearTimeout(rz);
      io?.disconnect();
      root.classList.remove('fp', 'fp-ready');
      delete root.dataset.tone;
      delete root.dataset.dir;
    };
  }, []);

  const goTo = (i: number) => window.dispatchEvent(new CustomEvent('fp:go', { detail: i }));

  return (
    <div className="fp-ui" hidden={!on}>
      <nav className="fp-dots" aria-label="Oral Dent">
        {labels.map((l, i) => (
          <button key={i} type="button" aria-current={i === cur ? 'true' : undefined} onClick={() => goTo(i)}>
            <span className="lb">{l}</span>
          </button>
        ))}
      </nav>
      <span className="fp-dot" aria-hidden="true" />
      <div className="fp-count" aria-hidden="true">
        <span className="now">{pad(cur + 1)}</span>
        <span className="bar"><i style={{ transform: `scaleX(${(cur + 1) / Math.max(1, labels.length)})` }} /></span>
        <span>{pad(labels.length)}</span>
      </div>
      <button type="button" className="fp-next" aria-label={hint} hidden={cur >= labels.length - 1} onClick={() => goTo(cur + 1)}>
        <span>{hint}</span><i aria-hidden="true">↓</i>
      </button>
    </div>
  );
}
