import type { Metadata } from 'next';
import Link from 'next/link';
import { LANGS, SITE, dict, pagePath } from '@/content/i18n';
import { SPRITE } from '@/content/sprite';
import { MobileBar, SiteFooter, SiteHeader } from '@/components/Chrome';
import './globals.css';

export const metadata: Metadata = {
  title: `${dict('uz').nfH1} — Oral Dent`,
  robots: { index: false, follow: true },
  icons: { icon: [{ url: '/brand/favicon.svg', type: 'image/svg+xml' }], apple: '/brand/apple-touch-icon.png' },
};

/** Any URL that is not a page of the site. Uzbek first, with links to the other languages. */
export default function GlobalNotFound() {
  const t = dict('uz');
  return (
    <html lang="uz" className="js">
      <body>
        <div aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: SPRITE }} />
        <SiteHeader lang="uz" page="home" />
        <main id="main">
          <section className="nf">
            <div className="wrap">
              <span className="big" aria-hidden="true">404</span>
              <h1>{t.nfH1}</h1>
              <p className="lead">{t.nfP}</p>
              <div className="btn-row">
                <Link className="btn btn-primary" href={pagePath('booking', 'uz')}>{t.ctaMain}</Link>
                <Link className="btn btn-ghost" href="/">{t.toHome}</Link>
              </div>
              <p className="langs">
                {LANGS.filter((l) => l !== 'uz').map((l) => (
                  <Link key={l} href={pagePath('home', l)} hrefLang={SITE.html_lang[l]} lang={SITE.html_lang[l]}>{dict(l).toHome}</Link>
                ))}
              </p>
            </div>
          </section>
        </main>
        <SiteFooter lang="uz" page="home" />
        <MobileBar lang="uz" />
      </body>
    </html>
  );
}
