'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect } from 'react';

declare global {
  interface Window { ym?: (id: number, action: string, ...args: unknown[]) => void }
}

const REVEAL =
  '.sec-head, .svc, .steps li, .doc-strip .photo, .doc-txt, .vtile, .rev, .cert, .free-card, .after-box, .price-note, ' +
  '.cta-card, .c-block, .lic, .vid, .route, .vnote, .facts li, .prose > div, .book > *';

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

  return null;
}
