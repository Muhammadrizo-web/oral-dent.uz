import Image from 'next/image';
import Link from 'next/link';
import { NAV, NAV_KEY, S, TG_URL, dict, pagePath, type Lang, type PageKey } from '@/content/i18n';
import Header from './client/Header';
import { Icon, LangSwitch } from './ui';
import { a } from './pages/shared';

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

/** The last slide of every inner page: the booking call, then the site map and every way to reach the clinic. */
export function SiteFooter({ lang, page }: { lang: Lang; page: PageKey }) {
  const t = dict(lang);
  const links: PageKey[] = ['services', 'doctor', 'clinic', 'reviews', 'booking', 'contacts'];
  return (
    <footer className="fp-slide foot" id="end" data-tone="mint" data-label={t.navContacts ?? ''}>
      <div className="fp-in wrap">
        <div className="foot-cta">
          <div>
            <h2 data-split>{t.ctaH}<span className="dot-at" data-dot aria-hidden="true" /></h2>
            <p className="a" style={a(2)}>{t.ctaP}</p>
          </div>
          <div className="foot-act a" style={a(3)}>
            <Link className="btn btn-primary" href={pagePath('booking', lang)}><span>{t.ctaMain}</span><span className="arr" aria-hidden="true">→</span></Link>
            <p className="foot-or">{t.orCall} <a href={`tel:${S.phone}`} data-goal="tel">{S.phone_display}</a></p>
          </div>
        </div>
        <div className="grid a" style={a(4)}>
          <div className="fcol fbrand">
            <Image className="logo-l" src="/brand/logo.png" alt="Oral Dent" width={104} height={44} quality={80} />
            <Image className="logo-d" src="/brand/logo-light.png" alt="" width={104} height={44} quality={80} />
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
            <a className="num" href={`tel:${S.phone}`} data-goal="tel">{S.phone_display}</a>
            {S.instagram ? <a href={`https://www.instagram.com/${S.instagram}/`} target="_blank" rel="noopener">Instagram · @{S.instagram}</a> : null}
            <span>{t.cAddr}</span>
            <span>{t.licShort}</span>
          </div>
        </div>
        <div className="bottom a" style={a(5)}>
          <span>{t.foot}</span>
          <span className="legal">
            <Link href={pagePath('privacy', lang)}>{t.footPrivacy}</Link>
            <span>{t.footBy}</span>
          </span>
        </div>
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
