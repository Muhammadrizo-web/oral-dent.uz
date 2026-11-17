import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import ill from '@/content/ill.json';
import { Count } from './client/Live';
import { SITE, S, TG_URL, dict, num, pagePath, type Lang, type PageKey, type Service } from '@/content/i18n';

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

export function PageHead({ lang, crumb, h1, lead }: { lang: Lang; crumb: string; h1: string; lead?: string }) {
  const t = dict(lang);
  return (
    <div className="phead">
      <div className="wrap">
        <nav className="crumbs x-in" aria-label="Breadcrumb">
          <Link href={pagePath('home', lang)}>{t.navHome}</Link>
          <span aria-hidden="true">/</span>
          <span>{crumb}</span>
        </nav>
        <h1 data-split>{h1}</h1>
        {lead ? <p className="lead x-in" style={{ ['--d' as string]: '.45s' }}>{lead}</p> : null}
      </div>
    </div>
  );
}

export function Cta({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <div className="cta">
      <div className="wrap">
        <div className="cta-card" data-scrub>
          <svg className="orb" viewBox="0 0 220 220" aria-hidden="true"><use href="#mk" /></svg>
          <div className="cta-txt">
            <h2>{t.ctaH}</h2>
            <p className="t">{t.ctaP}</p>
          </div>
          <div className="cta-act">
            <Link className="btn btn-ink" data-magnetic href={pagePath('booking', lang)}>
              <span>{t.ctaMain}</span><span className="arr" aria-hidden="true">→</span>
            </Link>
            <a className="btn btn-line" href={TG_URL} target="_blank" rel="noopener" data-goal="tg"><TgIcon /><span>Telegram</span></a>
            <p className="cta-phone">{t.orCall} <a href={`tel:${S.phone}`} data-goal="tel">{S.phone_display}</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Reviews({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <div className="revs">
      <article className="rev stat">
        <svg className="mk" viewBox="0 0 220 220" aria-hidden="true"><use href="#mk" /></svg>
        <span className="big"><Count to={S.rev_count} /><span>+</span></span>
        <p>{t.revStatP}</p>
        <div className="links">
          <a href={S.yandex_reviews} target="_blank" rel="noopener">{t.revLink}</a>
          <a href={S.gis} target="_blank" rel="noopener">{t.revLink2}</a>
        </div>
      </article>
      {SITE.reviews.map((r) => (
        <article className="rev" key={r.text}>
          <blockquote>{t[r.text]}</blockquote>
          <footer>
            <span><b>{t[r.author]}</b> · {t[r.source]}</span>
            <span>{r.date}</span>
          </footer>
        </article>
      ))}
    </div>
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

export function DoctorPhoto({ lang, eager = false }: { lang: Lang; eager?: boolean }) {
  const t = dict(lang);
  return (
    <div className="photo">
      <Image src="/brand/doctor.jpg" alt={t.docName ?? ''} width={640} height={640}
        sizes="(max-width: 820px) 340px, 440px" quality={80} loading={eager ? 'eager' : 'lazy'} />
      <span className="photo-dot" aria-hidden="true" />
    </div>
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
