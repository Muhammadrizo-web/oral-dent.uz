import Image from 'next/image';
import Link from 'next/link';
import { SITE, S, SERVICE, TG_URL, dict, pagePath, type Lang } from '@/content/i18n';
import media from '@/content/media.json';
import BookingForm from '../client/BookingForm';
import { ClinicVideos, Lightbox } from '../client/Media';
import { CopyPhone, Count, HoursRows, StatusPill } from '../client/Live';
import { Cta, DoctorPhoto, Icon, Ill, PageHead, Reviews, ServiceCard } from '../ui';
import { statusLabels } from './shared';

const MEDIA: Record<string, number[]> = media;
const dim = (src: string): [number, number] => {
  const [w, h] = MEDIA[src] ?? [];
  return w && h ? [w, h] : [560, 400];
};

export function Services({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <>
      <PageHead lang={lang} crumb={t.navServices ?? ''} h1={t.svcH1 ?? ''} lead={t.svcSub} />
      <section className="sec">
        <div className="wrap">
          <div className="free-card">
            <Ill name="diag" />
            <div><h2>{t.freeTitle}</h2><p>{t.freeP}</p></div>
            <div className="zero"><span>0</span><small>{t.cur}</small></div>
          </div>
          <div className="sec-head" style={{ marginTop: 'clamp(28px,4vw,44px)' }}><span className="eyebrow">{t.priceEyebrow}</span><h2>{t.priceH2}</h2></div>
          <div className="svc-grid">
            {SITE.services.filter((s) => s.p).map((sv) => <ServiceCard key={sv.id} sv={sv} lang={lang} />)}
          </div>
          <div className="after-box">
            <div className="sec-head" style={{ margin: 0 }}><span className="eyebrow">{t.afterEyebrow}</span><h2>{t.afterH2}</h2><p className="lead">{t.afterP}</p></div>
            <ul className="after-list">
              {SITE.after.map((id) => { const sv = SERVICE(id); return <li key={id}><Ill name={sv.ill} /><span>{t[`s_${id}`]}</span></li>; })}
            </ul>
            <div className="btn-row"><Link className="btn btn-primary" href={pagePath('booking', lang)}>{t.ctaMain}</Link></div>
          </div>
          <p className="price-note"><span className="chip">{t.badge}</span><span>{t.priceNote}</span></p>
        </div>
      </section>
      <Cta lang={lang} />
    </>
  );
}

export function Doctor({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const certs = SITE.certs.map((c) => ({ f: c.f, org: c.org[lang], ti: c.ti[lang], dt: c.dt[lang] }));
  const licCap = `${t.licH2}. ${t.licShort}`;
  return (
    <>
      <PageHead lang={lang} crumb={t.navDoctor ?? ''} h1={t.docH1 ?? ''} />
      <section className="sec">
        <div className="wrap doc-strip">
          <DoctorPhoto lang={lang} eager />
          <div className="doc-txt">
            <span className="eyebrow">{t.docEyebrow}</span>
            <h2 className="name">{t.docName}</h2>
            <p className="role">{t.docRole}</p>
            <div className="stats">
              <div className="stat"><b><Count to={18} /></b><span>{t.statExp}</span></div>
              <div className="stat"><b><Count to={7} /></b><span>{t.statCerts}</span></div>
              <div className="stat"><b>{t.fact4big}</b><span>{t.statLic}</span></div>
            </div>
            <p className="claim"><Icon id="i-smile" /><span>{t.freeTitle}<small>{t.freeP}</small></span></p>
            <div className="btn-row">
              <Link className="btn btn-primary" href={pagePath('booking', lang)}>{t.ctaMain}</Link>
              <a className="btn btn-tg" href={TG_URL} target="_blank" rel="noopener" data-goal="tg"><Icon id="i-send" /><span>{t.tgBtn}</span></a>
            </div>
          </div>
        </div>
      </section>
      <section className="sec tint">
        <div className="wrap">
          <div className="sec-head"><span className="eyebrow">{t.docCertEyebrow}</span><h2>{t.docCertH2}</h2><p className="lead">{t.docCertP}</p></div>
          <div className="certs">
            {certs.map((c) => {
              const label = `${c.org}. ${c.ti}. ${c.dt}`;
              return (
                <button type="button" className="cert" key={c.f} data-full={`/img/${c.f}.webp`} data-cap={label} aria-label={`${label} — ${t.certOpen}`}>
                  <span className="im"><Image src={`/img/${c.f}-t.jpg`} alt="" width={dim(`/img/${c.f}-t.jpg`)[0]} height={dim(`/img/${c.f}-t.jpg`)[1]} sizes="280px" quality={80} /></span>
                  <span className="tx">
                    <span className="org">{c.org}</span>
                    <span className="ti">{c.ti}</span>
                    <span className="dt"><Icon id="i-cert" style={{ width: 16, height: 16 }} />{c.dt}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          <div className="sec-head"><span className="eyebrow">{t.licEyebrow}</span><h2>{t.licH2}</h2></div>
          <div className="lic">
            <button type="button" className="cert" data-full="/img/license.webp" data-cap={licCap} aria-label={t.licOpen}>
              <span className="im"><Image src="/img/license-t.jpg" alt="" width={dim('/img/license-t.jpg')[0]} height={dim('/img/license-t.jpg')[1]} sizes="240px" quality={80} /></span>
            </button>
            <div className="lic-tx">
              <p>{t.licP}</p>
              <button type="button" className="btn btn-ghost btn-sm" data-full="/img/license.webp" data-cap={licCap}>{t.licOpen}</button>
            </div>
          </div>
        </div>
      </section>
      <Cta lang={lang} />
      <Lightbox closeLabel={t.lbClose ?? 'Close'} />
    </>
  );
}

export function Clinic({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <>
      <PageHead lang={lang} crumb={t.navClinic ?? ''} h1={t.clinicH1 ?? ''} lead={t.clinicLead} />
      <section className="sec">
        <div className="wrap">
          <ClinicVideos items={SITE.videos.map(([id, cap]) => ({ id, caption: t[cap] ?? '' }))} play={t.play ?? ''} pause={t.pause ?? ''} />
          <p className="vnote"><Icon id="i-cal" /><span>{t.vidNote}</span></p>
          <div className="route">
            <div><h2>{t.routeTitle}</h2><p>{t.routeP}</p></div>
            <Link className="btn btn-primary" href={pagePath('contacts', lang)}>{t.routeBtn}</Link>
          </div>
        </div>
      </section>
      <Cta lang={lang} />
    </>
  );
}

export function ReviewsPage({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <>
      <PageHead lang={lang} crumb={t.navReviews ?? ''} h1={t.revH1 ?? ''} lead={t.revPageP} />
      <section className="sec"><div className="wrap"><Reviews lang={lang} /></div></section>
      <Cta lang={lang} />
    </>
  );
}

export function Booking({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <>
      <PageHead lang={lang} crumb={t.ctaShort ?? ''} h1={t.bookH1 ?? ''} lead={t.bookSub} />
      <section className="sec">
        <div className="wrap">
          <BookingForm
            s={t}
            lang={lang}
            services={SITE.services.map((s) => ({ id: s.id, label: t[`s_${s.id}`] ?? s.id }))}
            phone={S.phone}
            phoneDisplay={S.phone_display}
            tgUrl={TG_URL}
            privacyHref={pagePath('privacy', lang)}
            metrikaId={Number(S.metrika_id) || 0}
          />
        </div>
      </section>
    </>
  );
}

export function Contacts({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const [lat, lng] = S.geo;
  return (
    <>
      <PageHead lang={lang} crumb={t.navContacts ?? ''} h1={t.cH1 ?? ''} />
      <section className="sec">
        <div className="wrap c-grid">
          <div className="c-block">
            <span className="c-lbl">{t.cAddrLbl}</span>
            <p className="c-addr">{t.cAddr}</p>
            <p className="muted">{t.cLandmark}</p>
            <div className="c-btns">
              <a className="btn btn-tg btn-sm" href={S.yandex_org} target="_blank" rel="noopener">{t.cYandex}</a>
              <a className="btn btn-ghost btn-sm" href={S.gis} target="_blank" rel="noopener">2GIS</a>
              <a className="btn btn-ghost btn-sm" href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`} target="_blank" rel="noopener">Google Maps</a>
              <a className="btn btn-ghost btn-sm" href={`https://yandex.com/maps/?rtext=~${lat}%2C${lng}&rtt=auto`} target="_blank" rel="noopener">{t.cTaxi}</a>
            </div>
          </div>
          <div className="c-block">
            <span className="c-lbl">{t.cHoursLbl}</span>
            <HoursRows rows={[
              { days: [1, 2, 3, 4, 5, 6], label: t.cWeek ?? '', value: '8:00–20:00' },
              { days: [0], label: t.cSun ?? '', value: t.cSunH ?? '' },
            ]} />
            <StatusPill as="p" labels={statusLabels(lang)} style={{ fontWeight: 700, fontSize: 14.5 }} />
            <span className="c-lbl" style={{ marginTop: 8 }}>{t.cRouteLbl}</span>
            <div className="c-row"><span>{t.cMetro}</span><span>730 m</span></div>
            <div className="c-row"><span>{t.cBus}</span><span>240 m</span></div>
          </div>
          <div className="c-block">
            <span className="c-lbl">{t.cPhoneLbl}</span>
            <div className="phone-big">
              <a href={`tel:${S.phone}`} data-goal="tel">{S.phone_display}</a>
              <CopyPhone phone={S.phone_display} copy={t.copy ?? ''} copied={t.copied ?? ''} />
            </div>
            <p className="handle">@{S.telegram}</p>
            <div className="c-btns">
              <a className="btn btn-tg btn-sm" href={TG_URL} target="_blank" rel="noopener" data-goal="tg"><Icon id="i-send" /><span>Telegram</span></a>
              <Link className="btn btn-primary btn-sm" href={pagePath('booking', lang)}>{t.ctaShort}</Link>
            </div>
            <span className="c-lbl" style={{ marginTop: 8 }}>{t.licLbl}</span>
            <p className="muted" style={{ fontSize: 14 }}>{t.licShort}</p>
          </div>
        </div>
      </section>
    </>
  );
}

export function Privacy({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const items = SITE.privacy[lang].map(([h, p]) => [h, p.replace('{retention}', String(S.privacy_retention_days))] as const);
  const all = S.metrika_id ? [...items, SITE.privacy_metrika[lang]] : items;
  return (
    <>
      <PageHead lang={lang} crumb={t.footPrivacy ?? ''} h1={t.footPrivacy ?? ''} />
      <section className="sec">
        <div className="wrap">
          <div className="prose">
            {all.map(([h, p]) => <div key={h}><h2>{h}</h2><p>{p}</p></div>)}
            <p className="upd">{t.prUpd}: {S.privacy_updated}</p>
          </div>
        </div>
      </section>
    </>
  );
}

export function Thanks({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <section className="nf">
      <div className="wrap">
        <span className="eyebrow">Oral Dent</span>
        <h1>{t.tyH1}</h1>
        <p className="lead">{t.doneP}</p>
        <div className="btn-row">
          <Link className="btn btn-primary" href={pagePath('home', lang)}>{t.toHome}</Link>
          <a className="btn btn-tg" href={TG_URL} target="_blank" rel="noopener" data-goal="tg"><Icon id="i-send" /><span>Telegram</span></a>
        </div>
      </div>
    </section>
  );
}
