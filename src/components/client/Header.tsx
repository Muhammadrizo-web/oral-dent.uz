'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import ThemeToggle from './Theme';

export interface NavItem { href: string; label: string; current: boolean }

interface Props {
  homeHref: string;
  bookingHref: string;
  menuLabel: string;
  ctaShort: string;
  ctaMain: string;
  themeLabel: string;
  nav: NavItem[];
  langSwitch: ReactNode;
}

/** Header with the phone/tablet menu. Closes on navigation and on Escape. */
export default function Header({ homeHref, bookingHref, menuLabel, ctaShort, ctaMain, themeLabel, nav, langSwitch }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const burger = useRef<HTMLButtonElement>(null);
  const [lastPath, setLastPath] = useState(pathname);

  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  /* the open menu covers the screen: the page under it must not scroll */
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open);
    return () => document.documentElement.classList.remove('menu-open');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        burger.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`hdr${open ? ' is-open' : ''}`} id="top">
      <div className="wrap hdr-in">
        <Link className="brand" href={homeHref} aria-label="Oral Dent">
          <Image className="logo-l" src="/brand/logo.png" alt="Oral Dent" width={91} height={38} preload quality={80} />
          <Image className="logo-d" src="/brand/logo-light.png" alt="" width={91} height={38} quality={80} />
        </Link>
        <nav className="nav" aria-label={menuLabel}>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} aria-current={n.current ? 'page' : undefined}>{n.label}</Link>
          ))}
        </nav>
        <div className="hdr-r">
          {langSwitch}
          <ThemeToggle label={themeLabel} />
          <Link className="btn btn-primary btn-sm hdr-cta" href={bookingHref}>{ctaShort}</Link>
          <button ref={burger} className="burger" type="button" aria-expanded={open} aria-controls="mnav"
            aria-label={menuLabel} onClick={() => setOpen((v) => !v)}>
            <span />
          </button>
        </div>
      </div>
      <div className="mnav" id="mnav" hidden={!open}>
        <div className="wrap">
          {nav.map((n) => (
            <Link key={n.href} className="l" href={n.href} aria-current={n.current ? 'page' : undefined}><span>{n.label}</span><i aria-hidden="true">→</i></Link>
          ))}
          {langSwitch}
          <Link className="btn btn-primary" style={{ width: '100%' }} href={bookingHref}>{ctaMain}</Link>
        </div>
      </div>
    </header>
  );
}
