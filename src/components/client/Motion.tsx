'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect } from 'react';

declare global {
  interface Window { ym?: (id: number, action: string, ...args: unknown[]) => void }
}

const REVEAL =
  '.sec-head, .svc, .steps li, .doc-strip .photo, .doc-txt, .vtile, .rev, .cert, .free-card, .after-box, .price-note, ' +
  '.cta-card, .c-block, .lic, .vid, .route, .vnote, .facts li, .prose > div, .book > *, ' +
  '.x-svc li, .x-steps li, .x-doc-photo, .x-doc-txt, .x-tile, .x-facts li, .phead h1, .phead .lead';

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
    /* safety net: anything still hidden after 4 s is shown */
    const safety = window.setTimeout(() => els.forEach((el) => el.classList.add('in')), 4000);
    return () => { io.disconnect(); window.clearTimeout(safety); };
  }, [pathname]);

  /* premium layer: split headline, glass header, parallax, magnetic buttons, lazy video */
  useEffect(() => {
    const rm = reduceMotion();
    const cleanups: Array<() => void> = [];

    /* headline: every word rises out of its own mask */
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
      requestAnimationFrame(() => el.classList.add('split-in'));
    });

    /* header turns to frosted glass once the page moves */
    const hdr = document.querySelector('.hdr');
    let lastY = window.scrollY;
    const speedEls = rm ? [] : Array.from(document.querySelectorAll<HTMLElement>('[data-speed]'));
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        hdr?.classList.toggle('scrolled', y > 24);
        hdr?.classList.toggle('hide', y > 400 && y > lastY + 4);
        if (y < lastY - 4) hdr?.classList.remove('hide');
        lastY = y;
        const vh = window.innerHeight;
        for (const el of speedEls) {
          const r = el.parentElement?.getBoundingClientRect();
          if (!r || r.bottom < -200 || r.top > vh + 200) continue;
          const c = r.top + r.height / 2 - vh / 2;
          el.style.setProperty('--py', `${(c * Number(el.dataset.speed)).toFixed(1)}px`);
        }
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener('scroll', onScroll));

    /* magnetic primary buttons on precise pointers */
    if (!rm && window.matchMedia('(pointer: fine)').matches) {
      document.querySelectorAll<HTMLElement>('[data-magnetic], .btn-primary').forEach((b) => {
        const move = (e: PointerEvent) => {
          const r = b.getBoundingClientRect();
          b.style.setProperty('--mx', `${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px`);
          b.style.setProperty('--my', `${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px`);
        };
        const leave = () => { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); };
        b.addEventListener('pointermove', move);
        b.addEventListener('pointerleave', leave);
        cleanups.push(() => { b.removeEventListener('pointermove', move); b.removeEventListener('pointerleave', leave); });
      });
    }

    /* clinic videos play only while on screen */
    const vids = Array.from(document.querySelectorAll<HTMLVideoElement>('video[data-lazyplay]'));
    if (vids.length && 'IntersectionObserver' in window && !rm) {
      const vio = new IntersectionObserver((es) => {
        for (const e of es) {
          const v = e.target as HTMLVideoElement;
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
