'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

const noop = () => () => {};

/* ---------- clinic videos: tap to play, one at a time, pause when scrolled away ---------- */

export interface VideoItem { id: string; caption: string }

export function ClinicVideos({ items, play, pause }: { items: VideoItem[]; play: string; pause: string }) {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const [playing, setPlaying] = useState<number | null>(null);

  useEffect(() => {
    const vids = refs.current.filter((v): v is HTMLVideoElement => !!v);
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        const v = en.target as HTMLVideoElement;
        if (!en.isIntersecting && !v.paused) v.pause();
      }
    }, { threshold: 0.15 });
    vids.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  const toggle = (i: number) => {
    const v = refs.current[i];
    if (!v) return;
    if (v.paused) {
      refs.current.forEach((o, j) => { if (o && j !== i && !o.paused) o.pause(); });
      v.play().catch(() => { /* autoplay policy: user can tap again */ });
    } else {
      v.pause();
    }
  };

  return (
    <div className="vgrid">
      {items.map((v, i) => (
        <figure className="vid" key={v.id}>
          <div className={`vbox${playing === i ? ' playing' : ''}`}>
            <video ref={(el) => { refs.current[i] = el; }} muted loop playsInline preload="none"
              poster={`/media/${v.id}.webp`} width={480} height={854}
              onPlay={() => setPlaying(i)} onPause={() => setPlaying((p) => (p === i ? null : p))}>
              <source src={`/media/${v.id}.mp4`} type="video/mp4" />
            </video>
            <button type="button" className="vplay" aria-label={`${playing === i ? pause : play}: ${v.caption}`} onClick={() => toggle(i)}>
              <span />
            </button>
          </div>
          <figcaption>{v.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}

/* ---------- lightbox for certificates and the licence ---------- */

/** Opens any element with data-full="/img/x.webp" data-cap="caption" on the page. */
export function Lightbox({ closeLabel }: { closeLabel: string }) {
  const [shot, setShot] = useState<{ src: string; cap: string } | null>(null);
  const last = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setShot(null);
    document.body.style.overflow = '';
    last.current?.focus();
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-full]') : null;
      if (!el) return;
      last.current = el;
      setShot({ src: el.dataset.full ?? '', cap: el.dataset.cap ?? '' });
      document.body.style.overflow = 'hidden';
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    if (!shot) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { e.preventDefault(); closeBtn.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shot, close]);

  /* rendered into <body>, so it sits above the header and the full-screen slides */
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!mounted) return null;
  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={shot?.cap} hidden={!shot}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <button ref={closeBtn} type="button" className="lb-x" aria-label={closeLabel} onClick={close}>×</button>
      {shot ? (
        // eslint-disable-next-line @next/next/no-img-element -- full-size scan opened on demand, already optimised WebP
        <img src={shot.src} alt={shot.cap} />
      ) : null}
      <p>{shot?.cap}</p>
    </div>,
    document.body,
  );
}
