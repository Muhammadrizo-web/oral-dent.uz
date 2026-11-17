import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { SITE, S, SERVICE, TG_URL, dict, num, pagePath, type Lang } from '@/content/i18n';
import { StatusPill } from '../client/Live';
import Roll from '../Roll';
import { Icon, LangSwitch, Price } from '../ui';
import { a, statusLabels } from './shared';

const pad = (n: number) => String(n).padStart(2, '0');
/** 4.5 → «4,5» in Uzbek and Russian, «4.5» elsewhere */
const rate = (v: number, lang: Lang) => (lang === 'ru' || lang === 'uz' ? v.toFixed(1).replace('.', ',') : v.toFixed(1));

/** The brand mark — arc + dot — with a picture or video inside the dot. */
function Mark({ children, over, className = '' }: { children?: ReactNode; over?: ReactNode; className?: string }) {
  return (
    <div className={`mark ${className}`}>
      <svg className="mark-arc" viewBox="-110 -110 220 220" aria-hidden="true">
        <path d="M61.1 -84.1A104 104 0 0 1 -61.1 84.1" pathLength={1} />
      </svg>
      <div className="mark-dot">{children}</div>
      {over}
      <span className="mark-end" data-dot aria-hidden="true" />
    </div>
  );
}

/**
 * Home: eight quiet full-screen pages. On large screens one wheel step = one screen (FullPage);
 * elsewhere they stack and scroll normally. Elements marked .a enter when their slide becomes active.
 */
export default function Home({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const plan = SITE.plan.map(SERVICE);
  const total = plan.reduce((s, x) => s + (x.p ?? 0), 0);
  const caption = Object.fromEntries(SITE.videos);
  return (
    <>

      {/* 01 — the promise */}
      <section className="fp-slide s-hero" id="start" data-label={t.navHome ?? ''} data-tone="paper">
        <div className="fp-in wrap">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="kicker a" style={a(0)}>{t.heroEyebrow}</p>
              <h1 className="hero-h" data-split dangerouslySetInnerHTML={{ __html: t.heroH1 ?? '' }} />
              <p className="lead a" style={a(3)}>{t.heroLead}</p>
              <div className="btn-row a" style={a(4)}>
                <Link className="btn btn-primary" href={pagePath('booking', lang)}>
                  <span>{t.ctaMain}</span><span className="arr" aria-hidden="true">→</span>
                </Link>
                <a className="btn btn-quiet" href={TG_URL} target="_blank" rel="noopener" data-goal="tg"><Icon id="i-send" /><span>Telegram</span></a>
              </div>
              <ul className="hero-proof a" style={a(5)}>
                <li><b>★ {rate(S.rating_yandex, lang)}</b><span>{t.yandex}</span></li>
                <li><b>★ {rate(S.rating_gis, lang)}</b><span>{t.gis2}</span></li>
                <li><b>{S.rev_count}+</b><span>{t.revStatP}</span></li>
              </ul>
              <div className="hero-meta a" style={a(6)}>
                <StatusPill labels={statusLabels(lang)} />
                <a href={`tel:${S.phone}`} data-goal="tel">{S.phone_display}</a>
              </div>
            </div>
            <Mark className="hero-mark" over={
              <>
                {/* the doctor stands in the brand dot; his head rises past its edge */}
                <div className="hero-pop" aria-hidden="true">
                  <Image src="/brand/doctor-cut.webp" alt="" width={640} height={620} priority sizes="(max-width: 1023px) 70vw, 34vw" quality={80} />
                </div>
                <div className="hero-tag hero-tag-doc">
                  <b>{t.docName}</b>
                  <span><Roll value="18" /> {t.statExp}</span>
                </div>
                <div className="hero-tag hero-tag-free">
                  <b>0 <small>{t.cur}</small></b>
                  <span>{t.fact1}</span>
                </div>
              </>
            } />
          </div>
        </div>
      </section>

      {/* 02 — the plan, priced before treatment, and the numbers behind it */}
      <section className="fp-slide s-plan" id="plan" data-label={t.planTitle ?? ''} data-tone="soft">
        <div className="fp-in wrap">
          <div className="plan-copy">
            <p className="kicker a" style={a(0)}>{t.planChip} · {t.planMeta}</p>
            <h2 className="disp" data-split>{t.planTitle}</h2>
            <p className="lead a" style={a(2)}>{t.planNote}</p>
          </div>
          <ul className="nums a" style={a(3)}>
            <li><b>0<small>{t.cur}</small></b><span>{t.fact1}</span></li>
            <li><b><Roll value="18" /><small>{t.yrs}</small></b><span>{t.fact2}</span></li>
            <li><b><Roll value="7" /></b><span>{t.fact3}</span></li>
            <li><b>{t.fact4big}</b><span>{t.fact4}</span></li>
          </ul>
          <div className="bill">
            <ul>
              {plan.map((sv, i) => (
                <li key={sv.id} className="a" style={a(2 + i)}>
                  <span className="nm"><i>{pad(i + 1)}</i>{t[`s_${sv.id}`]}</span>
                  {sv.p === 0 ? <span className="pv free">{t.free}</span> : (
                    <span className="pv">{num(sv.p ?? 0, lang)}<small> {t.priceCur}</small></span>
                  )}
                </li>
              ))}
            </ul>
            <div className="bill-total a" style={a(6)}>
              <span>{t.planTotal}</span>
              <strong>{t.priceFrom ? <small>{t.priceFrom} </small> : null}<Roll className="accent" value={num(total, lang)} /><small> {t.priceCur}</small><span className="dot-at" data-dot aria-hidden="true" /></strong>
            </div>
          </div>
        </div>
      </section>

      {/* 04 — services */}
      <section className="fp-slide s-svc" id="services" data-label={t.navServices ?? ''} data-tone="paper">
        <div className="fp-in wrap">
          <div className="s-head">
            <div><p className="kicker a" style={a(0)}>{t.homeSvcEyebrow}</p><h2 className="disp" data-split>{t.homeSvcH2}<span className="dot-at" data-dot aria-hidden="true" /></h2></div>
            <Link className="x-link a" style={a(2)} href={pagePath('services', lang)}>{t.allSvc}</Link>
          </div>
          <ul className="rows">
            {SITE.featured.map((id, i) => {
              const sv = SERVICE(id);
              return (
                <li key={id} className="a" style={a(2 + i)}>
                  <Link href={`${pagePath('booking', lang)}?s=${sv.id}`}>
                    <span className="n">{pad(i + 1)}</span>
                    <span className="tt"><b>{t[`s_${sv.id}`]}</b><small>{t[`d_${sv.id}`]}</small></span>
                    <Price p={sv.p} lang={lang} />
                    <span className="go" aria-hidden="true">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 05 — the first visit */}
      <section className="fp-slide s-how" id="visit" data-label={t.howEyebrow ?? ''} data-tone="soft">
        <div className="fp-in wrap">
          <div className="s-head"><div><p className="kicker a" style={a(0)}>{t.howEyebrow}</p><h2 className="disp" data-split>{t.howH2}<span className="dot-at" data-dot aria-hidden="true" /></h2></div></div>
          <ol className="steps3">
            {[1, 2, 3].map((n) => (
              <li key={n} className="a" style={{ ...a(2 + n), ['--i' as string]: n - 1 }}>
                <span className="n">{pad(n)}</span>
                <h3>{t[`st${n}t`]}</h3>
                <p>{t[`st${n}d`]}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 06 — the doctor */}
      <section className="fp-slide s-doc" id="doctor" data-label={t.navDoctor ?? ''} data-tone="mint">
        <div className="fp-in wrap">
          <Mark className="doc-mark">
            <Image src="/brand/doctor.jpg" alt={t.docName ?? ''} width={640} height={640} sizes="(max-width: 1023px) 80vw, 42vh" quality={80} />
          </Mark>
          <div className="doc-copy">
            <p className="kicker a" style={a(0)}>{t.docEyebrow}</p>
            <h2 className="disp" data-split>{t.docName}</h2>
            <p className="role a" style={a(2)}>{t.docRole}</p>
            <p className="lead a" style={a(3)}>{t.docLead}</p>
            <div className="doc-nums a" style={a(4)}>
              <div><b><Roll value="18" /></b><span>{t.statExp}</span></div>
              <div><b><Roll value="7" /></b><span>{t.statCerts}</span></div>
            </div>
            <Link className="x-link a" style={a(5)} href={pagePath('doctor', lang)}>{t.docMore}</Link>
          </div>
        </div>
      </section>

      {/* 07 — the clinic */}
      <section className="fp-slide s-clinic" id="clinic" data-label={t.navClinic ?? ''} data-tone="paper">
        <div className="fp-in wrap">
          <div className="s-head">
            <div><p className="kicker a" style={a(0)}>{t.clinicEyebrow}</p><h2 className="disp" data-split>{t.clinicH2}<span className="dot-at" data-dot aria-hidden="true" /></h2></div>
            <div className="s-head-r a" style={a(2)}><p className="muted">{t.clinicP}</p><Link className="x-link" href={pagePath('clinic', lang)}>{t.clinicMore}</Link></div>
          </div>
          <div className="films fp-free">
            {SITE.home_videos.map((id, i) => (
              <Link className="film a" style={a(3 + i)} href={pagePath('clinic', lang)} key={id} data-cursor={t.play}>
                <span className="pic">
                  <video data-lazyplay src={`/media/${id}.mp4`} poster={`/media/${id}.jpg`} muted loop playsInline preload="none" aria-hidden="true" />
                </span>
                <span className="cap"><i>{pad(i + 1)}</i>{t[caption[id] ?? '']}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 08 — patients */}
      <section className="fp-slide s-rev" id="reviews" data-label={t.navReviews ?? ''} data-tone="soft">
        <div className="fp-in wrap">
          <div className="rev-big">
            <p className="kicker a" style={a(0)}>{t.revEyebrow}</p>
            <b className="a" style={a(1)}><Roll value={String(S.rev_count)} /><em>+<span className="dot-at" data-dot aria-hidden="true" /></em></b>
            <p className="a" style={a(2)}>{t.revStatP}</p>
            <div className="rev-links a" style={a(3)}>
              <a href={S.yandex_reviews} target="_blank" rel="noopener">{t.revLink}</a>
              <a href={S.gis} target="_blank" rel="noopener">{t.revLink2}</a>
              <Link href={pagePath('reviews', lang)}>{t.revMore}</Link>
            </div>
          </div>
          <div className="quotes">
            {/* three on the home screen (one from each source and the longest); all of them on the reviews page */}
            {SITE.reviews.filter((r) => ['rev1', 'rev3', 'rev5'].includes(r.text)).map((r, i) => (
              <figure key={r.text} className="a" style={a(2 + i)}>
                <blockquote>{t[r.text]}</blockquote>
                <figcaption><b>{t[r.author]}</b> · {t[r.source]}{r.date ? ` · ${r.date}` : ''}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 08 — book, with everything needed to get here */}
      <section className="fp-slide s-book" id="book" data-label={t.ctaShort ?? ''} data-tone="orange">
        <div className="fp-in wrap">
          <div className="book-head">
            <div>
              <p className="kicker a" style={a(0)}>{t.ctaShort}</p>
              <h2 className="disp" data-split>{t.ctaH}<span className="dot-at" data-dot aria-hidden="true" /></h2>
              <p className="a" style={a(2)}>{t.ctaP}</p>
            </div>
            <div className="book-act a" style={a(3)}>
              <Link className="btn btn-primary" href={pagePath('booking', lang)}><span>{t.ctaMain}</span><span className="arr" aria-hidden="true">→</span></Link>
              <a className="btn btn-quiet" href={`tel:${S.phone}`} data-goal="tel"><Icon id="i-phone" /><span>{S.phone_display}</span></a>
            </div>
          </div>
          <div className="book-foot a" style={a(4)}>
            <div><span className="lbl">{t.cAddrLbl}</span><span>{t.cAddr}</span><span className="dim">{t.cLandmark}</span></div>
            <div><span className="lbl">{t.cHoursLbl}</span><span>{t.trust2}</span><span className="dim">{t.cSun}: {t.cSunH}</span></div>
            <div><span className="lbl">{t.navContacts}</span><a href={TG_URL} target="_blank" rel="noopener" data-goal="tg">@{S.telegram}</a><a href={`tel:${S.phone}`} data-goal="tel">{S.phone_display}</a>{S.instagram ? <a href={`https://www.instagram.com/${S.instagram}/`} target="_blank" rel="noopener">Instagram · @{S.instagram}</a> : null}</div>
            <div><span className="lbl">{t.licLbl}</span><span>{t.licShort}</span><Link className="dim" href={pagePath('privacy', lang)}>{t.footPrivacy}</Link></div>
            <div className="book-lang"><LangSwitch lang={lang} page="home" /><span className="dim">{t.foot}</span></div>
          </div>
        </div>
      </section>
    </>
  );
}
