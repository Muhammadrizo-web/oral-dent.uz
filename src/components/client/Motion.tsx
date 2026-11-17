'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect } from 'react';

declare global {
  interface Window { ym?: (id: number, action: string, ...args: unknown[]) => void }
}

const REVEAL =
  '.sec-head, .svc, .rev, .cert, .free-card, .after-box, .price-note, .c-block, .lic, .vid, .route, .vnote, ' +
  '.prose > div, .book > *, .doc-txt > *, .doc-strip .photo, .cta-card';

/*
 * The whole page tree (this component included) is re-mounted on every navigation,
 * because the root layout sits on the [[...slug]] segment. So "first page of the visit"
 * is tracked at module level, which lives for the whole visit.
 */
let booted = false;
let lastPath: string | null = null;

const reduceMotion = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
};

/**
 * Page-level behaviour that the demo had and the site keeps:
 * scroll reveal, analytics goals, remembered language.
 */
export default function Motion({ lang, isHome, homes, metrikaId }: {
  lang: string; isHome: boolean; homes: Record<string, string>; metrikaId: number;
}) {
  const pathname = usePathname();
  const router = useRouter();

  /* a returning visitor who chose another language lands on that language's home page */
  useEffect(() => {
    if (booted) return;
    booted = true;
    /* the intro veil plays once; later page changes must not replay it */
    if (document.documentElement.classList.contains('intro')) {
      window.setTimeout(() => document.documentElement.classList.remove('intro'), 3200);
    }
    try {
      const saved = localStorage.getItem('od-lang');
      const fromOutside = !document.referrer || !document.referrer.startsWith(location.origin);
      if (saved && saved !== lang && isHome && fromOutside && homes[saved]) router.replace(homes[saved]);
    } catch { /* storage may be blocked */ }
  }, [lang, isHome, homes, router]);

  /* remember the language the visitor picks; phone/Telegram goals */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      const langLink = el?.closest<HTMLElement>('.lang a[data-lang]');
      if (langLink) {
        try {
          localStorage.setItem('od-lang', langLink.dataset.lang ?? '');
          /* same page in another language: keep the reader where they were */
          const to = new URL((langLink as HTMLAnchorElement).href).pathname;
          sessionStorage.setItem('od-scroll', JSON.stringify({ to, y: Math.round(window.scrollY) }));
        } catch { /* storage may be blocked */ }
      }
      const goal = el?.closest<HTMLElement>('[data-goal]')?.dataset.goal;
      if (goal && metrikaId && window.ym) window.ym(metrikaId, 'reachGoal', goal);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [metrikaId]);

  /* Metrika counts the first page itself; later client-side navigations are sent as hits */
  useEffect(() => {
    if (lastPath === null || lastPath === pathname) { lastPath = pathname; return; }
    lastPath = pathname;
    if (metrikaId && window.ym) window.ym(metrikaId, 'hit', location.href, { referer: document.referrer });
  }, [pathname, metrikaId]);

  /* after a language switch, restore the scroll position before the page is painted */
  useLayoutEffect(() => {
    try {
      const keep = JSON.parse(sessionStorage.getItem('od-scroll') ?? 'null') as { to: string; y: number } | null;
      if (!keep) return;
      sessionStorage.removeItem('od-scroll');
      if (keep.to === pathname) window.scrollTo(0, keep.y);
    } catch { /* ignore */ }
  }, [pathname]);

  /* scroll reveal: sections and cards rise in as they enter the screen */
  useEffect(() => {
    const root = document.documentElement;
    if (reduceMotion() || !('IntersectionObserver' in window)) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(REVEAL));
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    for (const el of els) {
      let i = 0;
      let p = el.previousElementSibling;
      while (p && i < 5) { if (p.matches(REVEAL)) i++; p = p.previousElementSibling; }
      el.style.setProperty('--i', String(i));
      el.classList.add('rv');
      io.observe(el);
    }
    root.classList.add('rv-ready');
    /* safety net: anything already on (or above) the screen after 3 s is shown, whatever the observer did */
    const safety = window.setTimeout(() => els.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
    }), 3000);
    return () => { io.disconnect(); window.clearTimeout(safety); };
  }, [pathname]);

  /* motion layer: split headlines, header backing, page progress, magnetic buttons, lazy video */
  useEffect(() => {
    const rm = reduceMotion();
    const root = document.documentElement;
    const cleanups: Array<() => void> = [];

    /* headlines: every word rises out of its own mask */
    document.querySelectorAll<HTMLElement>('[data-split]:not([data-split-done])').forEach((el) => {
      el.dataset.splitDone = '1';
      let i = 0;
      const walk = (node: Node) => {
        for (const ch of Array.from(node.childNodes)) {
          if (ch.nodeType === 3) {
            const parts = (ch.textContent ?? '').split(/(\s+)/);
            const frag = document.createDocumentFragment();
            for (const w of parts) {
              if (!w) continue;
              if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); continue; }
              const o = document.createElement('span'); o.className = 'w';
              const n = document.createElement('span'); n.textContent = w;
              n.style.setProperty('--wi', String(i++));
              o.appendChild(n); frag.appendChild(o);
            }
            ch.replaceWith(frag);
          } else if (ch.nodeType === 1) walk(ch);
        }
      };
      walk(el);
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('split-in')));
    });

    /* header gets a solid backing once the page moves (it never hides: nothing jumps under the pointer) */
    const hdr = document.querySelector('.hdr');
    let ticking = false;
    const frame = () => {
      const y = window.scrollY;
      const max = Math.max(1, root.scrollHeight - window.innerHeight);
      root.style.setProperty('--sp', Math.min(1, y / max).toFixed(4));
      hdr?.classList.toggle('scrolled', y > 24);
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    frame();
    window.addEventListener('scroll', onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener('scroll', onScroll));

    /* the brand mark leans away from the pointer: the picture drifts, the arc turns a little */
    const marks = rm ? [] : Array.from(document.querySelectorAll<HTMLElement>('.mark'));
    if (marks.length && window.matchMedia('(pointer: fine)').matches) {
      let px = 0, py = 0, pending = false;
      const apply = () => {
        pending = false;
        for (const m of marks) { m.style.setProperty('--px', px.toFixed(3)); m.style.setProperty('--py', py.toFixed(3)); }
      };
      const onMove = (e: PointerEvent) => {
        px = (e.clientX / window.innerWidth) * 2 - 1;
        py = (e.clientY / window.innerHeight) * 2 - 1;
        if (!pending) { pending = true; requestAnimationFrame(apply); }
      };
      window.addEventListener('pointermove', onMove, { passive: true });
      cleanups.push(() => window.removeEventListener('pointermove', onMove));
    }

    /* clinic videos play only while on screen */
    const vids = Array.from(document.querySelectorAll<HTMLVideoElement>('video[data-lazyplay]'));
    if (vids.length && 'IntersectionObserver' in window && !rm) {
      const vio = new IntersectionObserver((es) => {
        for (const e of es) {
          const v = e.target as HTMLVideoElement;
          if (root.classList.contains('fp')) continue; // full-screen home: FullPage plays only the current page
          if (e.isIntersecting) { v.play().catch(() => {}); } else v.pause();
        }
      }, { threshold: 0.35 });
      vids.forEach((v) => vio.observe(v));
      cleanups.push(() => vio.disconnect());
    }

    return () => cleanups.forEach((f) => f());
  }, [pathname]);

  return null;
}
