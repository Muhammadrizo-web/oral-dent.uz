import Image from 'next/image';
import Link from 'next/link';
import { NAV, NAV_KEY, S, TG_URL, dict, pagePath, type Lang, type PageKey } from '@/content/i18n';
import Header from './client/Header';
import { Icon, LangSwitch } from './ui';

/** Site header: server-rendered labels, client-side menu toggle. */
export function SiteHeader({ lang, page }: { lang: Lang; page: PageKey }) {
  const t = dict(lang);
  const nav = NAV.map((p) => ({ href: pagePath(p, lang), label: t[NAV_KEY[p]] ?? '', current: p === page }));
  return (
    <Header
      homeHref={pagePath('home', lang)}
      bookingHref={pagePath('booking', lang)}
      menuLabel={t.menu ?? 'Menu'}
      ctaShort={t.ctaShort ?? ''}
      ctaMain={t.ctaMain ?? ''}
      themeLabel={t.themeLabel ?? 'Theme'}
      nav={nav}
      langSwitch={<LangSwitch lang={lang} page={page} />}
    />
  );
}

export function SiteFooter({ lang, page }: { lang: Lang; page: PageKey }) {
  const t = dict(lang);
  const links: PageKey[] = ['services', 'doctor', 'clinic', 'reviews', 'booking', 'contacts'];
  return (
    <footer className="foot on-dark">
      <div className="wrap foot-cta">
        <Link className="foot-big" href={pagePath('booking', lang)}>
          <span>{t.ctaShort}</span>
          <svg viewBox="0 0 220 220" aria-hidden="true"><use href="#mk" /></svg>
        </Link>
        <a className="foot-tel num" href={`tel:${S.phone}`} data-goal="tel">{S.phone_display}</a>
      </div>
      <div className="wrap grid">
        <div className="fcol fbrand">
          <Image src="/brand/logo-light.png" alt="Oral Dent" width={104} height={44} quality={80} />
          <p>{t.footTag}</p>
          <LangSwitch lang={lang} page={page} />
        </div>
        <div className="fcol">
          <p className="fh">{t.footNav}</p>
          <nav aria-label={t.footNav}>
            {links.map((p) => <Link key={p} href={pagePath(p, lang)}>{t[NAV_KEY[p]]}</Link>)}
          </nav>
        </div>
        <div className="fcol">
          <p className="fh">{t.navContacts}</p>
          <a href={TG_URL} target="_blank" rel="noopener" data-goal="tg">@{S.telegram}</a>
          <span>{t.cAddr}</span>
          <span>{t.licShort}</span>
        </div>
      </div>
      <div className="wrap bottom">
        <span>{t.foot}</span>
        <span className="legal">
          <Link href={pagePath('privacy', lang)}>{t.footPrivacy}</Link>
          <span>{t.footBy}</span>
        </span>
      </div>
    </footer>
  );
}

export function MobileBar({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <div className="mbar">
      <a className="btn btn-ghost" href={`tel:${S.phone}`} aria-label={`${t.call}: ${S.phone_display}`} data-goal="tel"><Icon id="i-phone" /></a>
      <a className="btn btn-tg" href={TG_URL} target="_blank" rel="noopener" aria-label="Telegram" data-goal="tg"><Icon id="i-send" /></a>
      <Link className="btn btn-primary" href={pagePath('booking', lang)}>{t.ctaShort}</Link>
    </div>
  );
}
