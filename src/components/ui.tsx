import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import ill from '@/content/ill.json';
import Rail from './client/Rail';
import { a } from './pages/shared';
import { SITE, dict, num, pagePath, type Lang, type PageKey, type Service } from '@/content/i18n';

const ILL = ill as Record<string, string>;

export function Ill({ name, className = 'ill' }: { name: string; className?: string }) {
  return <svg className={className} viewBox="0 0 96 96" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ILL[name] ?? '' }} />;
}

export function Icon({ id, style, className = 'ico' }: { id: string; style?: CSSProperties; className?: string }) {
  return (
    <svg className={className} style={style} aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  );
}

export function Price({ p, lang }: { p: number | null; lang: Lang }) {
  const t = dict(lang);
  if (p === 0) return <span className="price free"><b>{t.free}</b></span>;
  if (p === null) return <span className="price after"><b>{t.afterDx}</b></span>;
  return (
    <span className="price">
      {t.priceFrom ? <small>{t.priceFrom}</small> : null}
      <b>{num(p, lang)}</b>
      <small>{t.priceCur}</small>
    </span>
  );
}

export function TgIcon() {
  return <Icon id="i-send" />;
}

/** One full-screen page of the site (see FullPage). */
export function Slide({ id, tone = 'paper', label, className = '', children }: { id: string; tone?: string; label: string; className?: string; children: ReactNode }) {
  return (
    <section className={`fp-slide ${className}`} id={id} data-tone={tone} data-label={label}>
      <div className="fp-in wrap">{children}</div>
    </section>
  );
}

/** Breadcrumbs, the page title and its lead — the opening of every inner page. */
export function PageHead({ lang, crumb, h1, lead }: { lang: Lang; crumb: string; h1: string; lead?: string }) {
  const t = dict(lang);
  return (
    <div className="phead">
      <nav className="crumbs a" style={a(0)} aria-label="Breadcrumb">
        <Link href={pagePath('home', lang)}>{t.navHome}</Link>
        <span aria-hidden="true">/</span>
        <span>{crumb}</span>
      </nav>
      <h1 data-split>{h1}<span className="dot-at" data-dot aria-hidden="true" /></h1>
      {lead ? <p className="lead a" style={a(2)}>{lead}</p> : null}
    </div>
  );
}

/** Patient reviews: the count and ratings, then the reviews in a row that scrolls sideways. */
export function Reviews({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <Rail className="revs a" prev={t.railPrev ?? '←'} next={t.railNext ?? '→'}>
      {SITE.reviews.map((r) => (
        <article className="rev" key={r.text}>
          <blockquote>{t[r.text]}</blockquote>
          <footer>
            <span><b>{t[r.author]}</b> · {t[r.source]}</span>
            {r.date ? <span>{r.date}</span> : null}
          </footer>
        </article>
      ))}
    </Rail>
  );
}

export function ServiceCard({ sv, lang }: { sv: Service; lang: Lang }) {
  const t = dict(lang);
  return (
    <article className="svc">
      <h3>{t[`s_${sv.id}`]}</h3>
      <p>{t[`d_${sv.id}`]}</p>
      <div className="svc-foot">
        <Price p={sv.p} lang={lang} />
        <Link className="linkbtn" href={`${pagePath('booking', lang)}?s=${sv.id}`}>{t.book}</Link>
      </div>
    </article>
  );
}

export function LangSwitch({ lang, page }: { lang: Lang; page: PageKey }) {
  const t = dict(lang);
  return (
    <div className="lang" role="group" aria-label={t.langLabel}>
      {(['uz', 'ru', 'en', 'zh'] as const).map((l) => (
        <Link key={l} href={pagePath(page, l)} hrefLang={SITE.html_lang[l]} lang={SITE.html_lang[l]}
          aria-current={l === lang ? 'true' : undefined} scroll={false} data-lang={l}>
          {SITE.lang_names[l]}
        </Link>
      ))}
    </div>
  );
}
