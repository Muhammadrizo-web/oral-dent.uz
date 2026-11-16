import Image from 'next/image';
import Link from 'next/link';
import { SITE, S, SERVICE, TG_URL, dict, num, pagePath, type Lang } from '@/content/i18n';
import { Count, StatusPill } from '../client/Live';
import { Cta, DoctorPhoto, Icon, Ill, Reviews, ServiceCard } from '../ui';
import { statusLabels } from './shared';

export default function Home({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const plan = SITE.plan.map(SERVICE);
  const total = plan.reduce((a, s) => a + (s.p ?? 0), 0);
  const caption = Object.fromEntries(SITE.videos);

  return (
    <>
      <section className="hero">
        <svg className="orbits" viewBox="-300 -300 600 600" aria-hidden="true">
          <g fill="none" stroke="#0A7563" strokeOpacity=".13" strokeWidth="1.3"><circle r="90" /><circle r="150" /><circle r="210" /><circle r="270" /></g>
        </svg>
        <div className="wrap hero-in">
          <div className="hero-txt">
            <span className="eyebrow">{t.heroEyebrow}</span>
            <h1 dangerouslySetInnerHTML={{ __html: t.heroH1 ?? '' }} />
            <p className="lead">{t.heroLead}</p>
            <div className="btn-row">
              <Link className="btn btn-primary" href={pagePath('booking', lang)}>{t.ctaMain}</Link>
              <a className="btn btn-tg" href={TG_URL} target="_blank" rel="noopener" data-goal="tg"><Icon id="i-send" /><span>{t.tgBtn}</span></a>
            </div>
            <p className="or"><span>{t.orCall}</span> <a href={`tel:${S.phone}`} data-goal="tel">{S.phone_display}</a></p>
            <ul className="trust">
              <li><Icon id="i-scan" /><span>{t.trust1}</span></li>
              <li><Icon id="i-clock" /><StatusPill labels={statusLabels(lang)} /></li>
              <li><Icon id="i-tooth" /><span>{t.trust3}</span></li>
              <li><Icon id="i-shield" /><span>{t.trust4}</span></li>
            </ul>
          </div>
          <div className="hero-card">
            <svg className="hero-mark" viewBox="-110 -110 220 220" aria-hidden="true">
              <path className="a" d="M45.47 -62.58A77.35 77.35 0 0 1 -45.47 62.58" fill="none" stroke="#EF7F1A" strokeWidth="45.3" />
              <circle className="d" r="40" fill="#EF7F1A" />
            </svg>
            <div className="plan">
              <div className="plan-hd"><div><b>{t.planTitle}</b><small>{t.planMeta}</small></div><span className="chip">{t.planChip}</span></div>
              <ul className="plan-rows">
                {plan.map((sv) => (
                  <li key={sv.id}>
                    <Ill name={sv.ill} />
                    <span className="nm">{t[`s_${sv.id}`]}</span>
                    {sv.p === 0 ? (
                      <span className="pv free">{t.free}</span>
                    ) : (
                      <span className="pv">{t.priceFrom ? <><small>{t.priceFrom}</small>{' '}</> : null}{num(sv.p ?? 0, lang)} <small>{t.priceCur}</small></span>
                    )}
                  </li>
                ))}
              </ul>
              <div className="plan-total">
                <span>{t.planTotal}</span>
                <strong>{t.priceFrom ? <><small>{t.priceFrom}</small>{' '}</> : null}{num(total, lang)} <small>{t.priceCur}</small></strong>
              </div>
              <p className="plan-note">{t.planNote}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="facts on-dark" aria-label="Oral Dent">
        <div className="wrap">
          <ul>
            <li><span className="big"><span className="count">0</span><small>{t.cur}</small></span><span className="lb">{t.fact1}</span></li>
            <li><span className="big"><Count to={18} /><small>{t.yrs}</small></span><span className="lb">{t.fact2}</span></li>
            <li><span className="big"><Count to={7} /></span><span className="lb">{t.fact3}</span></li>
            <li><span className="big">{t.fact4big}</span><span className="lb">{t.fact4}</span></li>
          </ul>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head row">
            <div><span className="eyebrow">{t.homeSvcEyebrow}</span><h2>{t.homeSvcH2}</h2></div>
            <Link className="btn btn-ghost btn-sm" href={pagePath('services', lang)}>{t.allSvc}</Link>
          </div>
          <div className="svc-grid">
            {SITE.featured.map((id) => <ServiceCard key={id} sv={SERVICE(id)} lang={lang} />)}
          </div>
        </div>
      </section>

      <section className="sec tint">
        <div className="wrap">
          <div className="sec-head"><span className="eyebrow">{t.howEyebrow}</span><h2>{t.howH2}</h2></div>
          <ol className="steps">
            <li><h3>{t.st1t}</h3><p>{t.st1d}</p></li>
            <li><h3>{t.st2t}</h3><p>{t.st2d}</p></li>
            <li><h3>{t.st3t}</h3><p>{t.st3d}</p></li>
          </ol>
        </div>
      </section>

      <section className="sec">
        <div className="wrap doc-strip">
          <DoctorPhoto lang={lang} />
          <div className="doc-txt">
            <span className="eyebrow">{t.docEyebrow}</span>
            <p className="name">{t.docName}</p>
            <p className="role">{t.docRole}</p>
            <p className="lead">{t.docLead}</p>
            <Link className="btn btn-ghost" href={pagePath('doctor', lang)}>{t.docMore}</Link>
          </div>
        </div>
      </section>

      <section className="sec tint">
        <div className="wrap">
          <div className="sec-head row">
            <div><span className="eyebrow">{t.clinicEyebrow}</span><h2>{t.clinicH2}</h2><p className="lead">{t.clinicP}</p></div>
            <Link className="btn btn-ghost btn-sm" href={pagePath('clinic', lang)}>{t.clinicMore}</Link>
          </div>
          <div className="vt-grid">
            {SITE.home_videos.map((id) => (
              <Link className="vtile" href={pagePath('clinic', lang)} key={id}>
                <span className="pic">
                  <Image src={`/media/${id}.jpg`} alt="" width={480} height={854} sizes="(max-width: 560px) 33vw, 280px" quality={70} />
                  <span className="playbadge" />
                </span>
                <span>{t[caption[id] ?? '']}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head row">
            <div><span className="eyebrow">{t.revEyebrow}</span><h2>{t.revH2}</h2></div>
            <Link className="btn btn-ghost btn-sm" href={pagePath('reviews', lang)}>{t.revMore}</Link>
          </div>
          <Reviews lang={lang} />
        </div>
      </section>

      <Cta lang={lang} />
    </>
  );
}
