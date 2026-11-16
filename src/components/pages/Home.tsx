import Image from 'next/image';
import Link from 'next/link';
import { SITE, S, SERVICE, TG_URL, dict, num, pagePath, type Lang } from '@/content/i18n';
import { Count, StatusPill } from '../client/Live';
import { Cta, Icon, Ill, Price, Reviews } from '../ui';
import { statusLabels } from './shared';

const pad = (n: number) => String(n).padStart(2, '0');

export default function Home({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const plan = SITE.plan.map(SERVICE);
  const total = plan.reduce((a, s) => a + (s.p ?? 0), 0);
  const caption = Object.fromEntries(SITE.videos);
  const heroVid = SITE.home_videos[1] ?? SITE.home_videos[0];
  const trust = [t.trust1, t.trust3, t.trust4, t.fact3 ? `7 ${t.fact3}` : '', t.planTitle].filter(Boolean) as string[];

  return (
    <>
      {/* ───────────── HERO ───────────── */}
      <section className="x-hero">
        <div className="x-glow" aria-hidden="true" />
        <div className="wrap x-hero-in">
          <div className="x-copy">
            <span className="eyebrow x-in" style={{ ['--d' as string]: '.05s' }}>{t.heroEyebrow}</span>
            <h1 className="x-title" data-split dangerouslySetInnerHTML={{ __html: t.heroH1 ?? '' }} />
            <p className="lead x-in" style={{ ['--d' as string]: '.75s' }}>{t.heroLead}</p>
            <div className="btn-row x-in" style={{ ['--d' as string]: '.9s' }}>
              <Link className="btn btn-primary" data-magnetic href={pagePath('booking', lang)}>
                <span>{t.ctaMain}</span><span className="arr" aria-hidden="true">→</span>
              </Link>
              <a className="btn btn-quiet" href={TG_URL} target="_blank" rel="noopener" data-goal="tg">
                <Icon id="i-send" /><span>{t.tgBtn}</span>
              </a>
            </div>
            <div className="x-meta x-in" style={{ ['--d' as string]: '1.05s' }}>
              <span className="x-status"><StatusPill labels={statusLabels(lang)} /></span>
              <a href={`tel:${S.phone}`} data-goal="tel">{S.phone_display}</a>
            </div>
          </div>

          <div className="x-visual">
            <div className="x-portal" data-speed="-0.06">
              <video src={`/media/${heroVid}.mp4`} poster={`/media/${heroVid}.jpg`} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
              <span className="x-portal-shade" />
            </div>
            <span className="x-dot" data-speed="0.12" aria-hidden="true" />

            <div className="x-plan" data-speed="0.05">
              <div className="x-plan-hd">
                <div><b>{t.planTitle}</b><small>{t.planMeta}</small></div>
                <span className="chip">{t.planChip}</span>
              </div>
              <ul>
                {plan.map((sv) => (
                  <li key={sv.id}>
                    <span className="nm">{t[`s_${sv.id}`]}</span>
                    {sv.p === 0 ? <span className="pv free">{t.free}</span> : (
                      <span className="pv">{num(sv.p ?? 0, lang)} <small>{t.priceCur}</small></span>
                    )}
                  </li>
                ))}
              </ul>
              <div className="x-plan-total">
                <span>{t.planTotal}</span>
                <strong>{t.priceFrom ? <small>{t.priceFrom} </small> : null}{num(total, lang)} <small>{t.priceCur}</small></strong>
              </div>
            </div>
          </div>
        </div>
        <div className="x-scroll" aria-hidden="true"><span /></div>
      </section>

      {/* ───────────── MARQUEE ───────────── */}
      <div className="x-marquee" aria-hidden="true">
        <div className="x-track">
          {[0, 1].map((k) => (
            <div className="x-row" key={k}>
              {trust.map((s, i) => <span key={i}>{s}<i /></span>)}
            </div>
          ))}
        </div>
      </div>

      {/* ───────────── FACTS ───────────── */}
      <section className="x-facts" aria-label="Oral Dent">
        <div className="wrap">
          <ul>
            <li><span className="big">0<small>{t.cur}</small></span><span className="lb">{t.fact1}</span></li>
            <li><span className="big"><Count to={18} /><small>{t.yrs}</small></span><span className="lb">{t.fact2}</span></li>
            <li><span className="big"><Count to={7} /></span><span className="lb">{t.fact3}</span></li>
            <li><span className="big">{t.fact4big}</span><span className="lb">{t.fact4}</span></li>
          </ul>
        </div>
      </section>

      {/* ───────────── SERVICES ───────────── */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head row">
            <div><span className="eyebrow">{t.homeSvcEyebrow}</span><h2>{t.homeSvcH2}</h2></div>
            <Link className="x-link" href={pagePath('services', lang)}>{t.allSvc}</Link>
          </div>
          <ul className="x-svc">
            {SITE.featured.map((id, i) => {
              const sv = SERVICE(id);
              return (
                <li key={id}>
                  <Link href={`${pagePath('booking', lang)}?s=${sv.id}`}>
                    <span className="n">{pad(i + 1)}</span>
                    <span className="ic"><Ill name={sv.ill} /></span>
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

      {/* ───────────── HOW ───────────── */}
      <section className="sec x-how">
        <div className="wrap">
          <div className="sec-head"><span className="eyebrow">{t.howEyebrow}</span><h2>{t.howH2}</h2></div>
          <ol className="x-steps">
            {[1, 2, 3].map((n) => (
              <li key={n}>
                <span className="n">{pad(n)}</span>
                <h3>{t[`st${n}t`]}</h3>
                <p>{t[`st${n}d`]}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────── DOCTOR ───────────── */}
      <section className="sec x-doc">
        <div className="wrap x-doc-in">
          <div className="x-doc-photo">
            <div className="frame" data-speed="-0.05">
              <Image src="/brand/doctor.jpg" alt={t.docName ?? ''} width={640} height={640}
                sizes="(max-width: 820px) 90vw, 460px" quality={85} />
            </div>
          </div>
          <div className="x-doc-txt">
            <span className="eyebrow">{t.docEyebrow}</span>
            <h2 className="name">{t.docName}</h2>
            <p className="role">{t.docRole}</p>
            <p className="lead">{t.docLead}</p>
            <Link className="x-link" href={pagePath('doctor', lang)}>{t.docMore}</Link>
          </div>
        </div>
      </section>

      {/* ───────────── CLINIC ───────────── */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head row">
            <div><span className="eyebrow">{t.clinicEyebrow}</span><h2>{t.clinicH2}</h2><p className="lead">{t.clinicP}</p></div>
            <Link className="x-link" href={pagePath('clinic', lang)}>{t.clinicMore}</Link>
          </div>
          <div className="x-reel">
            {SITE.home_videos.map((id, i) => (
              <Link className="x-tile" href={pagePath('clinic', lang)} key={id}>
                <span className="pic">
                  <video data-lazyplay src={`/media/${id}.mp4`} poster={`/media/${id}.jpg`} muted loop playsInline preload="none" aria-hidden="true" />
                </span>
                <span className="cap"><i>{pad(i + 1)}</i>{t[caption[id] ?? '']}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── REVIEWS ───────────── */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head row">
            <div><span className="eyebrow">{t.revEyebrow}</span><h2>{t.revH2}</h2></div>
            <Link className="x-link" href={pagePath('reviews', lang)}>{t.revMore}</Link>
          </div>
          <Reviews lang={lang} />
        </div>
      </section>

      <Cta lang={lang} />
    </>
  );
}
