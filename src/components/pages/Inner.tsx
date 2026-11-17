import Image from 'next/image';
import Link from 'next/link';
import { SITE, S, TG_URL, dict, pagePath, type Lang } from '@/content/i18n';
import media from '@/content/media.json';
import BookingForm from '../client/BookingForm';
import { ClinicVideos, Lightbox } from '../client/Media';
import { CopyPhone, Count, HoursRows, StatusPill } from '../client/Live';
import Rail from '../client/Rail';
import { Icon, PageHead, Reviews, ServiceCard, Slide } from '../ui';
import { a, statusLabels } from './shared';

const MEDIA: Record<string, number[]> = media;
const dim = (src: string): [number, number] => {
  const [w, h] = MEDIA[src] ?? [];
  return w && h ? [w, h] : [560, 400];
};
const pad = (n: number) => String(n).padStart(2, '0');

/* Every inner page is a short run of full-screen slides (FullPage); the footer slide closes each one. */

export function Services({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const priced = SITE.services.filter((s) => s.p);
  return (
    <>
      <Slide id="start" label={t.navServices ?? ''} className="s-svc-head">
        <div className="svc-head-grid">
          <div className="svc-head-l">
            <PageHead lang={lang} crumb={t.navServices ?? ''} h1={t.svcH1 ?? ''} lead={t.svcSub} />
            {/* what the next screens hold */}
            <nav className="toc a" style={a(4)} aria-label={t.navServices}>
              <a href="#prices"><i>02</i>{t.priceH2}<span aria-hidden="true">↓</span></a>
              <a href="#after"><i>03</i>{t.afterH2}<span aria-hidden="true">↓</span></a>
            </nav>
          </div>
          <div className="free-card a" style={a(3)}>
            <div className="zero"><span>0</span><small>{t.cur}</small></div>
            <div><h2>{t.freeTitle}</h2><p>{t.freeP}</p></div>
          </div>
        </div>
      </Slide>

      <Slide id="prices" tone="soft" label={t.priceH2 ?? ''} className="s-prices">
        <div className="sec-head"><span className="kicker a" style={a(0)}>{t.priceEyebrow}</span><h2 data-split>{t.priceH2}</h2></div>
        <div className="svc-grid">
          {priced.map((sv, i) => <div key={sv.id} className="a" style={a(2 + i)}><ServiceCard sv={sv} lang={lang} /></div>)}
        </div>
        <p className="price-note a" style={a(4 + priced.length)}><span className="chip">{t.badge}</span><span>{t.priceNote}</span></p>
      </Slide>

      <Slide id="after" tone="mint" label={t.afterH2 ?? ''} className="s-after">
        <div className="after-grid">
          <div className="sec-head">
            <span className="kicker a" style={a(0)}>{t.afterEyebrow}</span>
            <h2 data-split>{t.afterH2}</h2>
            <p className="lead a" style={a(2)}>{t.afterP}</p>
            <div className="btn-row a" style={a(3)}><Link className="btn btn-primary" href={pagePath('booking', lang)}>{t.ctaMain}</Link></div>
          </div>
          <ul className="after-list">
            {SITE.after.map((id, i) => <li key={id} className="a" style={a(2 + i)}><i>{pad(i + 1)}</i><span>{t[`s_${id}`]}</span></li>)}
          </ul>
        </div>
      </Slide>
    </>
  );
}

export function Doctor({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const certs = SITE.certs.map((c) => ({ f: c.f, org: c.org[lang], ti: c.ti[lang], dt: c.dt[lang] }));
  const licCap = `${t.licH2}. ${t.licShort}`;
  return (
    <>
      <Slide id="start" label={t.navDoctor ?? ''} className="s-doctor">
        <div className="doc-grid">
          <figure className="portrait a" style={a(1)}>
            <svg className="portrait-arc" viewBox="-110 -110 220 220" aria-hidden="true"><path d="M61.1 -84.1A104 104 0 0 1 -61.1 84.1" /></svg>
            <Image src="/brand/doctor-cut.webp" alt={t.docName ?? ''} width={640} height={620} priority
              sizes="(max-width: 1023px) 90vw, 460px" quality={80} />
          </figure>
          <div className="doc-txt">
            <nav className="crumbs a" style={a(0)} aria-label="Breadcrumb">
              <Link href={pagePath('home', lang)}>{t.navHome}</Link><span aria-hidden="true">/</span><span>{t.navDoctor}</span>
            </nav>
            <p className="kicker a" style={a(1)}>{t.docH1}</p>
            <h1 className="name" data-split>{t.docName}</h1>
            <p className="role a" style={a(3)}>{t.docRole}</p>
            <div className="stats a" style={a(4)}>
              <div className="stat"><b><Count to={18} /></b><span>{t.statExp}</span></div>
              <div className="stat"><b><Count to={7} /></b><span>{t.statCerts}</span></div>
              <div className="stat"><b>{t.fact4big}</b><span>{t.statLic}</span></div>
            </div>
            <p className="claim a" style={a(5)}><Icon id="i-smile" /><span>{t.freeTitle}<small>{t.freeP}</small></span></p>
            <div className="btn-row a" style={a(6)}>
              <Link className="btn btn-primary" href={pagePath('booking', lang)}>{t.ctaMain}</Link>
              <a className="btn btn-quiet" href="#certs">{t.docCertH2} ↓</a>
            </div>
          </div>
        </div>
      </Slide>

      <Slide id="certs" tone="soft" label={t.docCertH2 ?? ''} className="s-certs">
        <div className="s-head">
          <div className="sec-head"><span className="kicker a" style={a(0)}>{t.docCertEyebrow}</span><h2 data-split>{t.docCertH2}</h2></div>
          <p className="muted a" style={a(2)}>{t.docCertP}</p>
        </div>
        <Rail className="certs a" prev={t.railPrev ?? '←'} next={t.railNext ?? '→'}>
          {certs.map((c) => {
            const label = `${c.org}. ${c.ti}. ${c.dt}`;
            return (
              <button type="button" className="cert" key={c.f} data-full={`/img/${c.f}.webp`} data-cap={label} aria-label={`${label} — ${t.certOpen}`}>
                <span className="im"><Image src={`/img/${c.f}-t.jpg`} alt="" width={dim(`/img/${c.f}-t.jpg`)[0]} height={dim(`/img/${c.f}-t.jpg`)[1]} sizes="300px" quality={80} /></span>
                <span className="tx">
                  <span className="org">{c.org}</span>
                  <span className="ti">{c.ti}</span>
                  <span className="dt"><Icon id="i-cert" style={{ width: 16, height: 16 }} />{c.dt}</span>
                </span>
              </button>
            );
          })}
        </Rail>
      </Slide>

      <Slide id="license" label={t.licH2 ?? ''} className="s-lic">
        <div className="lic">
          <button type="button" className="cert a" style={a(1)} data-full="/img/license.webp" data-cap={licCap} aria-label={t.licOpen}>
            <span className="im"><Image src="/img/license-t.jpg" alt="" width={dim('/img/license-t.jpg')[0]} height={dim('/img/license-t.jpg')[1]} sizes="280px" quality={80} /></span>
          </button>
          <div className="lic-tx">
            <span className="kicker a" style={a(0)}>{t.licEyebrow}</span>
            <h2 data-split>{t.licH2}</h2>
            <p className="a" style={a(2)}>{t.licP}</p>
            <button type="button" className="btn btn-quiet btn-sm a" style={a(3)} data-full="/img/license.webp" data-cap={licCap}>{t.licOpen}</button>
          </div>
        </div>
      </Slide>
      <Lightbox closeLabel={t.lbClose ?? 'Close'} />
    </>
  );
}

export function Clinic({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <Slide id="start" label={t.navClinic ?? ''} className="s-clinic-page">
      <PageHead lang={lang} crumb={t.navClinic ?? ''} h1={t.clinicH1 ?? ''} lead={t.clinicLead} />
      <div className="a" style={a(3)}>
        <ClinicVideos items={SITE.videos.map(([id, cap]) => ({ id, caption: t[cap] ?? '' }))} play={t.play ?? ''} pause={t.pause ?? ''} />
      </div>
      <div className="clinic-foot a" style={a(4)}>
        <p className="vnote"><Icon id="i-cal" /><span>{t.vidNote}</span></p>
        <Link className="x-link" href={pagePath('contacts', lang)}>{t.routeTitle}: {t.routeBtn}</Link>
      </div>
    </Slide>
  );
}

export function ReviewsPage({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <Slide id="start" label={t.navReviews ?? ''} className="s-reviews">
      <div className="rev-top">
        <PageHead lang={lang} crumb={t.navReviews ?? ''} h1={t.revH1 ?? ''} lead={t.revPageP} />
        <div className="rev-stat a" style={a(3)}>
          <b><Count to={S.rev_count} />+</b>
          <span>{t.revStatP}</span>
          <div className="links">
            <a href={S.yandex_reviews} target="_blank" rel="noopener">{t.revLink}</a>
            <a href={S.gis} target="_blank" rel="noopener">{t.revLink2}</a>
          </div>
        </div>
      </div>
      <Reviews lang={lang} />
    </Slide>
  );
}

export function Booking({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <Slide id="start" label={t.ctaShort ?? ''} className="s-booking">
      <PageHead lang={lang} crumb={t.ctaShort ?? ''} h1={t.bookH1 ?? ''} lead={t.bookSub} />
      <div className="a" style={a(3)}>
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
    </Slide>
  );
}

export function Contacts({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const [lat, lng] = S.geo;
  return (
    <Slide id="start" label={t.navContacts ?? ''} className="s-contacts">
      <PageHead lang={lang} crumb={t.navContacts ?? ''} h1={t.cH1 ?? ''} />
      <div className="c-grid">
        <div className="c-block a" style={a(3)}>
          <span className="c-lbl">{t.cAddrLbl}</span>
          <p className="c-addr">{t.cAddr}</p>
          <p className="muted">{t.cLandmark}</p>
          <div className="c-btns">
            <a className="btn btn-quiet btn-sm" href={S.yandex_org} target="_blank" rel="noopener">{t.cYandex}</a>
            <a className="btn btn-quiet btn-sm" href={S.gis} target="_blank" rel="noopener">2GIS</a>
            <a className="btn btn-quiet btn-sm" href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`} target="_blank" rel="noopener">Google Maps</a>
            <a className="btn btn-quiet btn-sm" href={`https://yandex.com/maps/?rtext=~${lat}%2C${lng}&rtt=auto`} target="_blank" rel="noopener">{t.cTaxi}</a>
          </div>
        </div>
        <div className="c-block a" style={a(4)}>
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
        <div className="c-block a" style={a(5)}>
          <span className="c-lbl">{t.cPhoneLbl}</span>
          <div className="phone-big">
            <a href={`tel:${S.phone}`} data-goal="tel">{S.phone_display}</a>
            <CopyPhone phone={S.phone_display} copy={t.copy ?? ''} copied={t.copied ?? ''} />
          </div>
          <p className="handle">@{S.telegram}</p>
          <div className="c-btns">
            <Link className="btn btn-primary btn-sm" href={pagePath('booking', lang)}>{t.ctaShort}</Link>
            <a className="btn btn-quiet btn-sm" href={TG_URL} target="_blank" rel="noopener" data-goal="tg"><Icon id="i-send" /><span>Telegram</span></a>
          </div>
          <span className="c-lbl" style={{ marginTop: 8 }}>{t.licLbl}</span>
          <p className="muted" style={{ fontSize: 14 }}>{t.licShort}</p>
        </div>
      </div>
    </Slide>
  );
}

export function Privacy({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const items = SITE.privacy[lang].map(([h, p]) => [h, p.replace('{retention}', String(S.privacy_retention_days))] as const);
  const all = S.metrika_id ? [...items, SITE.privacy_metrika[lang]] : items;
  return (
    <Slide id="start" label={t.footPrivacy ?? ''} className="s-privacy">
      <PageHead lang={lang} crumb={t.footPrivacy ?? ''} h1={t.footPrivacy ?? ''} />
      <div className="prose a" style={a(3)}>
        {all.map(([h, p]) => <div key={h}><h2>{h}</h2><p>{p}</p></div>)}
        <p className="upd">{t.prUpd}: {S.privacy_updated}</p>
      </div>
    </Slide>
  );
}

export function Thanks({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <Slide id="start" label={t.tyH1 ?? ''} className="s-thanks">
      <div className="nf">
        <span className="kicker a" style={a(0)}>Oral Dent</span>
        <h1 data-split>{t.tyH1}</h1>
        <p className="lead a" style={a(2)}>{t.doneP}</p>
        <div className="btn-row a" style={a(3)}>
          <Link className="btn btn-primary" href={pagePath('home', lang)}>{t.toHome}</Link>
          <a className="btn btn-quiet" href={TG_URL} target="_blank" rel="noopener" data-goal="tg"><Icon id="i-send" /><span>Telegram</span></a>
        </div>
      </div>
    </Slide>
  );
}
